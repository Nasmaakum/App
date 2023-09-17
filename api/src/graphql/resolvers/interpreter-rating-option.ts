import { ApolloError } from '../../functions/errors'
import { Resolvers } from '../../gql-types'

export default {
	InterpreterRatingOption: {
		async title({ titleEn, titleAr }, _, { language }) {
			return language === 'ar' && titleAr ? titleAr : titleEn
		},
	},

	Query: {
		async interpreterRatingOption(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.interpreterRatingOption.findUnique(input)
		},

		async interpreterRatingOptions(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.interpreterRatingOption.findMany(input)
		},

		async interpreterRatingOptionsCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.interpreterRatingOption.count(input)
		},
	},

	Mutation: {
		async createInterpreterRatingOption(
			_,
			{ data },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			if (
				data.ratingVisibleFrom > 5 ||
				data.ratingVisibleFrom < 1 ||
				data.ratingVisibleTo > 5 ||
				data.ratingVisibleTo < 1
			)
				throw ApolloError(
					'MALFORMED_INPUT',
					'Rating visible must be between 1 and 5.',
				)

			return await database.interpreterRatingOption.create({ data })
		},

		async updateInterpreterRatingOption(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			if (
				(data.ratingVisibleFrom && data.ratingVisibleFrom > 5) ||
				(data.ratingVisibleFrom && data.ratingVisibleFrom < 1) ||
				(data.ratingVisibleTo && data.ratingVisibleTo > 5) ||
				(data.ratingVisibleTo && data.ratingVisibleTo < 1)
			)
				throw ApolloError(
					'MALFORMED_INPUT',
					'Rating visible must be between 1 and 5.',
				)

			return await database.interpreterRatingOption.update({ where, data })
		},

		async deleteInterpreterRatingOption(
			_,
			input,
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.interpreterRatingOption.delete(input)
		},
	},
} as Resolvers
