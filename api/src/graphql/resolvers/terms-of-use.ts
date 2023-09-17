import { Resolvers } from '../../gql-types'

export default {
	TermsOfUseAcceptance: {
		async user({ userId }, _, { database }) {
			return await database.user.findUniqueOrThrow({
				where: { id: userId },
			})
		},

		async termsOfUse({ termsOfUseId }, _, { database }) {
			return await database.termsOfUse.findUniqueOrThrow({
				where: { id: termsOfUseId },
			})
		},
	},

	TermsOfUse: {
		async content({ contentEn, contentAr }, _, { language }) {
			return language === 'ar' && contentAr ? contentAr : contentEn
		},
	},

	Query: {
		async latestTermsOfUse(_, __, { database }) {
			return await database.termsOfUse.findFirst({
				orderBy: { version: 'desc' },
			})
		},

		async termsOfUse(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.termsOfUse.findUnique(input)
		},

		async termsOfUses(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.termsOfUse.findMany(input)
		},

		async termsOfUsesCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.termsOfUse.count(input)
		},
	},

	Mutation: {
		async createTermsOfUse(_, { data }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.termsOfUse.create({ data })
		},

		async updateTermsOfUse(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.termsOfUse.update({ where, data })
		},

		async deleteTermsOfUse(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.termsOfUse.delete(input)
		},

		async acceptTermsOfUse(
			_,
			{ where: { id } },
			{ database, requireAuth, user },
		) {
			requireAuth()

			return await database.termsOfUseAcceptance.create({
				data: {
					termsOfUse: { connect: { id } },
					user: { connect: { id: user?.id } },
				},
			})
		},
	},
} as Resolvers
