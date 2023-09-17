import { ApolloError } from '../../functions/errors'
import { Resolvers } from '../../gql-types'

export default {
	InterpreterRating: {
		async user({ userId }, _, { database }) {
			return await database.user.findUniqueOrThrow({
				where: { id: userId },
			})
		},

		async interpreter({ interpreterId }, _, { database }) {
			return await database.interpreter.findUniqueOrThrow({
				where: { id: interpreterId },
			})
		},

		async options({ id }, _, { database }) {
			return await database.interpreterRatingOption.findMany({
				where: { ratings: { some: { id } } },
			})
		},
	},

	Query: {
		async interpreterRating(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.interpreterRating.findUnique(input)
		},

		async interpreterRatings(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.interpreterRating.findMany(input)
		},

		async interpreterRatingsCount(
			_,
			input,
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.interpreterRating.count(input)
		},
	},

	Mutation: {
		async createInterpreterRating(
			_,
			{ data: { options, interpreter, rating, ...rest } },
			{ database, requireAuth, user, ip },
		) {
			requireAuth()

			if (interpreter === user?.id)
				throw ApolloError('UNAUTHORIZED', 'You cannot rate yourself.')

			if (rating < 1 || rating > 5)
				throw ApolloError('MALFORMED_INPUT', 'Rating must be between 1 and 5.')

			return await database.interpreterRating.create({
				data: {
					ip,
					interpreter: { connect: { id: interpreter } },
					user: { connect: { id: user?.id } },
					rating,
					options: { connect: options.map(id => ({ id })) },
					...rest,
				},
			})
		},

		async updateInterpreterRating(
			_,
			{ data: { interpreter, options, ...data }, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.interpreterRating.update({
				where,
				data: {
					...data,
					interpreter: interpreter
						? { connect: { id: interpreter } }
						: undefined,
					options: options ? { set: options.map(id => ({ id })) } : undefined,
				},
			})
		},

		async deleteInterpreterRating(
			_,
			input,
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.interpreterRating.delete(input)
		},
	},
} as Resolvers
