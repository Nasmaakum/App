import { ApolloError } from '../../functions/errors'
import { deleteFile, uploadFile } from '@404-software/s3-upload'
import { isNull } from 'lodash'
import { Prisma } from '@prisma/client'
import { Resolvers } from '../../gql-types'

export default {
	User: {
		fullName({ firstName, lastName }) {
			return `${firstName} ${lastName}`
		},

		async preferences({ id }, _, { database }) {
			return await database.userPreferences.findUniqueOrThrow({
				where: { userId: id },
			})
		},
	},

	Query: {
		async myPreferences(_, __, { database, requireAuth, user }) {
			requireAuth()

			return await database.userPreferences.findUniqueOrThrow({
				where: { userId: user?.id },
			})
		},

		async myUser(_, __, { database, requireAuth, user }) {
			requireAuth()

			return await database.user.findUniqueOrThrow({ where: { id: user?.id } })
		},

		async user(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.user.findUniqueOrThrow(input)
		},

		async users(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.user.findMany(input)
		},

		async usersCount(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.user.count(input)
		},
	},

	Mutation: {
		async createUser(
			_,
			{ data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.UserCreateInput = {
				...rest,
				preferences: { create: {} },
				image: image
					? await uploadFile({ folder: 'users', file: image })
					: undefined,
			}

			return await database.user.create({ data })
		},

		async updateUser(
			_,
			{ where, data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.UserUpdateInput = rest

			if (image && typeof image !== 'string') {
				const user = await database.user.findUniqueOrThrow({ where })

				data.image = await uploadFile({
					folder: 'users',
					file: image,
				})

				if (user.image) await deleteFile({ file: user.image })
			}

			return await database.user.update({ data, where })
		},

		async updateMyPreferences(_, { data }, { database, requireAuth, user }) {
			requireAuth()

			return await database.userPreferences.update({
				where: { userId: user?.id },
				data,
			})
		},

		async updateMyUser(
			_,
			{ data: { image, ...rest } },
			{ database, requireAuth, user: loggedInUser },
		) {
			requireAuth()

			const data: Prisma.UserUpdateInput = rest

			if (image && typeof image !== 'string') {
				const user = await database.user.findUniqueOrThrow({
					where: { id: loggedInUser?.id },
				})

				data.image = await uploadFile({
					folder: 'users',
					file: image,
				})

				if (user.image) await deleteFile({ file: user.image })
			}

			if (isNull(image)) {
				const user = await database.user.findUniqueOrThrow({
					where: { id: loggedInUser?.id },
				})

				data.image = null
				if (user.image) await deleteFile({ file: user.image })
			}

			return await database.user.update({
				where: { id: loggedInUser?.id },
				data,
			})
		},

		async deleteUser(
			_,
			{ where: { id } },
			{ database, requireAuth, isAdmin, user },
		) {
			requireAuth(isAdmin)

			if (id === user?.id)
				throw ApolloError(
					'MALFORMED_INPUT',
					'You are not allowed to delete your user account',
				)

			return await database.user.delete({ where: { id } })
		},

		async deleteMyUser(
			_,
			{ data: { password } },
			{ database, requireAuth, user: loggedInUser },
		) {
			requireAuth()

			const user = await database.user.findUniqueOrThrow({
				where: { id: loggedInUser?.id },
			})

			if (user.password !== password) throw ApolloError('INCORRECT_PASSWORD')

			return await database.user.update({
				where: { id: loggedInUser?.id },
				data: { deleted: true },
			})
		},
	},
} as Resolvers
