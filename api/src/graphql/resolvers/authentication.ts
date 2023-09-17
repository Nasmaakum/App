import { ApolloError } from '../../functions/errors'
import { Resolvers } from '../../gql-types'
import dayjs from 'dayjs'
import ForgetPasswordEmail from '../../emails/forget-password'
import Hash from '../../functions/hash'
import jwt from 'jsonwebtoken'
import PasswordChangedEmail from '../../emails/password-changed'
import sendEmail from '../../functions/send-email'
import VerifyEmailEmail from '../../emails/verify-email'
import WelcomeEmail from '../../emails/welcome'

const API_SECRET = process.env.API_SECRET
if (!API_SECRET)
	throw new Error('The API_SECRET environment variable must be set')

const signJWT = (payload: { id: string }) =>
	jwt.sign({ ...payload, createdAt: new Date() }, API_SECRET, {
		expiresIn: '31d',
	})

export default {
	Query: {
		async login(_, { data: { email, password } }, { database, userAgent }) {
			try {
				const user = await database.user.findFirstOrThrow({
					where: { email, deleted: false },
					include: { interpreter: { select: { status: true } } },
				})

				if (user.password !== Hash(password))
					throw ApolloError('INCORRECT_PASSWORD')
				if (user.role === 'INTERPRETER') {
					switch (user.interpreter?.status) {
						case 'PENDING':
							throw ApolloError('AWAITING_APPROVAL')
						case 'REJECTED':
							throw ApolloError('APPLICATION_REJECTED')
					}
				}

				const token = signJWT({ id: user.id })

				await database.authToken.create({
					data: {
						token,
						user: { connect: { id: user.id } },
						device: userAgent,
					},
					select: { id: true },
				})

				return {
					message: 'Logged in successfully',
					authentication: { user, token },
				}
			} catch {
				throw ApolloError('INCORRECT_CREDENTIALS')
			}
		},
	},
	Mutation: {
		async register(
			_,
			{
				data: {
					acceptPrivacyPolicy,
					acceptTermsOfUse,
					interpreter,
					email,
					...rest
				},
			},
			{ database, userAgent },
		) {
			if (!acceptPrivacyPolicy || !acceptTermsOfUse)
				throw ApolloError('PRIVACY_POLICY_AND_TERMS_OF_USE_MUST_BE_ACCEPTED')

			const privacyPolicy = await database.privacyPolicy.findFirstOrThrow({
				orderBy: { version: 'desc' },
				select: { id: true },
			})

			const termsOfUse = await database.termsOfUse.findFirstOrThrow({
				orderBy: { version: 'desc' },
				select: { id: true },
			})

			const user = await database.user.create({
				data: {
					...rest,
					email,
					role: interpreter ? 'INTERPRETER' : 'USER',
					preferences: { create: {} },
					privacyPolicyAcceptance: {
						create: { privacyPolicy: { connect: { id: privacyPolicy.id } } },
					},
					active: false,
					termsOfUseAcceptance: {
						create: { termsOfUse: { connect: { id: termsOfUse.id } } },
					},
					interpreter: { create: interpreter },
				},
			})

			const token = signJWT({ id: user.id })

			await database.authToken.create({
				data: { token, user: { connect: { id: user.id } }, device: userAgent },
				select: { id: true },
			})

			const code = `${Math.floor(1000 + Math.random() * 9000)}`

			await database.oneTimePassword.create({
				data: { code: code, email, operation: 'VERIFY_EMAIL' },
			})

			await sendEmail({
				subject: 'Verify your email on Nasmaakum!',
				to: user.email,
				html: VerifyEmailEmail({ name: user.firstName, code }),
			})

			return {
				message: 'OTP sent successfully',
			}
		},

		async verifyRegistration(
			_,
			{ data: { code, email } },
			{ database, userAgent },
		) {
			const savedOTP = await database.oneTimePassword.findFirst({
				where: { email },
				orderBy: { createdAt: 'desc' },
			})

			if (!savedOTP || savedOTP.expired || savedOTP.code !== code)
				throw ApolloError('INVALID_OTP')

			if (dayjs().diff(dayjs(savedOTP.createdAt), 'minutes', true) >= 5) {
				await database.oneTimePassword.update({
					where: { id: savedOTP.id },
					data: { expired: true },
				})

				throw ApolloError('INVALID_OTP')
			}

			const user = await database.user.update({
				where: { email },
				data: { active: true },
			})

			const token = signJWT({ id: user.id })

			await database.authToken.create({
				data: { token, user: { connect: { id: user.id } }, device: userAgent },
				select: { id: true },
			})

			await sendEmail({
				subject: 'Welcome to Nasmaakum! We hear your signs!',
				to: user.email,
				html: WelcomeEmail({ name: user.firstName }),
			})

			if (user.role === 'INTERPRETER') {
				return {
					message: 'Awaiting approval',
				}
			}

			return {
				message: 'OTP sent successfully',
				authentication: { user, token },
			}
		},

		async requestPasswordReset(_, { data: { email } }, { database }) {
			const message =
				'If the email address you entered is associated with an account, you will receive an email with a one time password to reset your password.'

			const user = await database.user.findFirst({
				where: { email, deleted: false },
			})

			if (!user) return { message }

			const code = `${Math.floor(1000 + Math.random() * 9000)}`

			await database.oneTimePassword.create({
				data: { code, email, operation: 'RESET_PASSWORD' },
			})

			await sendEmail({
				subject: 'Password Reset Request',
				to: email,
				html: ForgetPasswordEmail({ code, name: user.firstName }),
			})

			return { message }
		},

		async verifyPasswordReset(_, { data: { code, email } }, { database }) {
			const savedOTP = await database.oneTimePassword.findFirst({
				where: { email },
				orderBy: { createdAt: 'desc' },
			})

			if (!savedOTP || savedOTP.expired || savedOTP.code !== code)
				throw ApolloError('INVALID_OTP')

			if (dayjs().diff(dayjs(savedOTP.createdAt), 'days', true) >= 1) {
				await database.oneTimePassword.update({
					where: { code },
					data: { expired: true },
				})

				throw ApolloError('INVALID_OTP')
			}

			return { message: 'Confirmed' }
		},

		async resetPassword(
			_,
			{ data: { code, email, password } },
			{ database, userAgent },
		) {
			const savedOTP = await database.oneTimePassword.findFirst({
				where: { email },
				orderBy: { createdAt: 'desc' },
			})

			if (!savedOTP || savedOTP.expired || savedOTP.code !== code)
				throw ApolloError('INVALID_OTP')

			if (dayjs().diff(dayjs(savedOTP.createdAt), 'minutes', true) >= 5) {
				await database.oneTimePassword.update({
					where: { code },
					data: { expired: true },
				})

				throw ApolloError('INVALID_OTP')
			}

			const user = await database.user.update({
				where: { email },
				data: { password },
			})

			await database.oneTimePassword.update({
				where: { code },
				data: { expired: true },
			})

			await sendEmail({
				subject: 'Your password was changed',
				to: email,
				html: PasswordChangedEmail({ name: user.firstName }),
			})

			const token = signJWT({ id: user.id })

			await database.authToken.create({
				data: { token, user: { connect: { id: user.id } }, device: userAgent },
				select: { id: true },
			})

			return {
				message: 'Password reset successfully',
				authentication: { user, token },
			}
		},

		async changePassword(
			_,
			{ data: { currentPassword, newPassword } },
			{ database, user: loggedInUser },
		) {
			const user = await database.user.findUniqueOrThrow({
				where: { id: loggedInUser?.id },
			})

			if (user.password !== Hash(currentPassword))
				throw ApolloError('INCORRECT_PASSWORD')

			await database.user.update({
				where: { id: user.id },
				data: { password: newPassword },
			})

			// await sendEmail({
			// 	subject: 'Your password was changed',
			// 	to: user.email,
			// 	html: PasswordChangedEmail({ name: user.firstName }),
			// })

			return { message: 'Password changed successfully' }
		},
	},
} as Resolvers
