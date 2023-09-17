import { Resolvers } from '../../gql-types'

export default {
	About: {
		async content({ contentEn, contentAr }, _, { language }) {
			return language === 'ar' && contentAr ? contentAr : contentEn
		},
	},

	Query: {
		async latestAbout(_, __, { database }) {
			return await database.about.findFirst({
				orderBy: { version: 'desc' },
			})
		},

		async about(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.about.findUnique(input)
		},

		async abouts(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.about.findMany(input)
		},

		async aboutsCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.about.count(input)
		},
	},

	Mutation: {
		async createAbout(_, { data }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.about.create({ data })
		},

		async updateAbout(_, { data, where }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.about.update({ where, data })
		},

		async deleteAbout(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.about.delete(input)
		},
	},
} as Resolvers
