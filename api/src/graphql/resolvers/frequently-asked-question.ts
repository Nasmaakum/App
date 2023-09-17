import { Resolvers } from '../../gql-types'

export default {
	FrequentlyAskedQuestion: {
		async question({ questionEn, questionAr }, _, { language }) {
			return language === 'ar' ? questionAr : questionEn
		},

		async answer({ answerEn, answerAr }, _, { language }) {
			return language === 'ar' ? answerAr : answerEn
		},
	},

	Query: {
		async frequentlyAskedQuestion(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.frequentlyAskedQuestion.findUnique(input)
		},

		async frequentlyAskedQuestions(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.frequentlyAskedQuestion.findMany(input)
		},

		async frequentlyAskedQuestionsCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.frequentlyAskedQuestion.count(input)
		},
	},

	Mutation: {
		async createFrequentlyAskedQuestion(
			_,
			{ data },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.frequentlyAskedQuestion.create({ data })
		},

		async updateFrequentlyAskedQuestion(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.frequentlyAskedQuestion.update({ where, data })
		},

		async deleteFrequentlyAskedQuestion(
			_,
			input,
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.frequentlyAskedQuestion.delete(input)
		},
	},
} as Resolvers
