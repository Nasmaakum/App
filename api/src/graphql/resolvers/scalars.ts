// DO NOT REMOVE THIS RULE
/* eslint no-console: "error" */

import { ApolloError } from '../../functions/errors'
import { GraphQLScalarType } from 'graphql'
import { Resolvers } from '../../gql-types'
import { validate as validateEmail } from 'email-validator'
import Hash from '../../functions/hash'
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js/min'

const UntrimmedString = new GraphQLScalarType({
	name: 'UntrimmedString',
	description: 'Untrimmed String',
	parseValue(value) {
		return value
	},
})

const String = new GraphQLScalarType({
	name: 'String',
	description: 'Trimmed string',
	parseValue(value) {
		return value.trim()
	},
})

const LowercaseString = new GraphQLScalarType({
	name: 'LowercaseString',
	description: 'Lowercase trimmed string',
	parseValue(value) {
		return value.toLowerCase().trim()
	},
})

const UppercaseString = new GraphQLScalarType({
	name: 'UppercaseString',
	description: 'Uppercase trimmed string',
	parseValue(value) {
		return value.toUpperCase().trim()
	},
})

const EmailAddress = new GraphQLScalarType({
	name: 'EmailAddress',
	description: 'Email Address validated string',
	parseValue(value) {
		const email = value.toLowerCase().trim()

		if (!validateEmail(email))
			throw ApolloError(
				'MALFORMED_INPUT',
				'Please provide a valid email address',
			)

		return email
	},
})

const OTP = new GraphQLScalarType({
	name: 'OTP',
	description: 'OTP validated string',
	parseValue(OTP) {
		if (OTP.length !== 4) throw ApolloError('INVALID_OTP')

		return OTP
	},
})

const Password = new GraphQLScalarType({
	name: 'Password',
	description: 'Password validated string',
	parseValue(password) {
		const passwordRegex =
			/^(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?])(?=.*[A-Z])(?=.*[a-z]).{6,}$/
		const errors = []
		if (!/(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?])/.test(password)) {
			errors.push('Password must contain at least one special character')
		}
		if (!/(?=.*[A-Z])/.test(password)) {
			errors.push('Password must contain at least one uppercase letter')
		}
		if (!/(?=.*[a-z])/.test(password)) {
			errors.push('Password must contain at least one lowercase letter')
		}
		if (!/[0-9]/.test(password)) {
			errors.push('Password must contain at least one number')
		}
		if (!/^.{6,}$/.test(password) || !passwordRegex.test(password)) {
			errors.push(
				'Password must be at least 6 characters and match the required pattern',
			)
		}

		if (errors.length)
			throw ApolloError(
				'MALFORMED_INPUT',
				`Password invalid: ${errors.join(' - ')}`,
			)

		return Hash(password)
	},
})

const PhoneNumber = new GraphQLScalarType({
	name: 'PhoneNumber',
	description: 'Phone Number validated string',
	parseValue(value) {
		if (!isValidPhoneNumber(value))
			throw ApolloError(
				'MALFORMED_INPUT',
				'Please provide a valid phone number',
			)

		return parsePhoneNumber(value)!.number
	},
})

const Upload = new GraphQLScalarType({
	name: 'Upload',
	description: 'Upload',
	parseValue(value) {
		if (value.file) return value.file

		return value
	},
})

export default {
	Upload,
	UntrimmedString,
	String,
	LowercaseString,
	UppercaseString,
	EmailAddress,
	Password,
	OTP,
	PhoneNumber,
} as Resolvers
