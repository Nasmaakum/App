import { Resolvers } from '../../gql-types'

export default {
	PrivacyPolicyAcceptance: {
		async user({ userId }, _, { database }) {
			return await database.user.findUniqueOrThrow({
				where: { id: userId },
			})
		},

		async privacyPolicy({ privacyPolicyId }, _, { database }) {
			return await database.privacyPolicy.findUniqueOrThrow({
				where: { id: privacyPolicyId },
			})
		},
	},

	PrivacyPolicy: {
		async content({ contentEn, contentAr }, _, { language }) {
			return language === 'ar' && contentAr ? contentAr : contentEn
		},
	},

	Query: {
		async latestPrivacyPolicy(_, __, { database }) {
			return await database.privacyPolicy.findFirst({
				orderBy: { version: 'desc' },
			})
		},

		async privacyPolicy(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.privacyPolicy.findUnique(input)
		},

		async privacyPolicies(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.privacyPolicy.findMany(input)
		},

		async privacyPoliciesCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.privacyPolicy.count(input)
		},
	},

	Mutation: {
		async createPrivacyPolicy(_, { data }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.privacyPolicy.create({ data })
		},

		async updatePrivacyPolicy(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.privacyPolicy.update({ where, data })
		},

		async deletePrivacyPolicy(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.privacyPolicy.delete(input)
		},
		async acceptPrivacyPolicy(
			_,
			{ where: { id } },
			{ database, requireAuth, user },
		) {
			requireAuth()

			return await database.privacyPolicyAcceptance.create({
				data: {
					privacyPolicy: { connect: { id } },
					user: { connect: { id: user?.id } },
				},
			})
		},
	},
} as Resolvers
