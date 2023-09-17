import { ApolloError as APError } from 'apollo-server-errors'

const ERRORS = {
	NOT_FOUND: {
		code: '404',
		message: 'Not Found',
	},
	ORDER_PROCESSING: {
		code: '405',
		message: 'Your order cannot be cancelled',
	},
	METHOD_NOT_ALLOW: {
		code: '405',
		message: 'Method selected not available to your country',
	},
	PRODUCT_NOT_AVAILABLE: {
		code: '405',
		message: 'This product is not available anymore',
	},
	EMPTY_CART: {
		code: '405',
		message: 'You cannot checkout an empty cart',
	},
	PRODUCT_OUT_OF_STOCK: {
		code: '405',
		message: 'This product is out of stock',
	},
	PRODUCT_NOT_ENOUGH_STOCK: {
		code: '405',
		message: 'This product does not have enough stock',
	},
	INCORRECT_PASSWORD: {
		code: '401',
		message: 'Password is incorrect',
	},
	USER_EXISTS: {
		code: '409',
		message: 'User already exists',
	},
	INTERNAL_ERROR: {
		code: '500',
		message: 'Internal Server Error',
	},
	MALFORMED_INPUT: {
		code: '400',
		message: 'Malformed input',
	},
	UNAUTHORIZED: {
		code: '401',
		message: 'You do not have access to this resource',
	},
	INVALID_TOKEN: {
		code: '401',
		message: 'Invalid token provided',
	},
	NO_TOKEN: {
		code: '401',
		message: 'Authorization token is required',
	},
	MAINTENANCE_ACTIVE: {
		code: '503',
		message: 'Maintenance is active',
	},
	INVALID_OTP: {
		code: '400',
		message: 'OTP provided is invalid or expired',
	},
	PRIVACY_POLICY_AND_TERMS_OF_USE_MUST_BE_ACCEPTED: {
		code: '400',
		message: 'Privacy Policy and Terms of Use must be accepted',
	},
	AWAITING_APPROVAL: {
		code: '400',
		message: 'Your account is awaiting approval',
	},
	APPLICATION_REJECTED: {
		code: '400',
		message: 'Your application has been rejected',
	},
	INCORRECT_CREDENTIALS: {
		code: '401',
		message: 'Incorrect credentials',
	},
	INTERPRETER_BUSY: {
		code: '405',
		message: 'Interpreter is busy',
	},
}

export const ApolloError = (
	error: keyof typeof ERRORS,
	...errors: Array<string | number>
) => new APError(ERRORS[error].message, ERRORS[error].code, { errors })
