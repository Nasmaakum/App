import { Resolvers } from '../../gql-types'

export default {
	Notification: {
		async title({ titleEn, titleAr }, _, { language }) {
			return language === 'ar' ? titleAr : titleEn
		},

		async message({ messageEn, messageAr }, _, { language }) {
			return language === 'ar' ? messageAr : messageEn
		},
	},

	Query: {
		async notification(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.notification.findUnique(input)
		},

		async notifications(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.notification.findMany(input)
		},

		async notificationsCount(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.notification.count(input)
		},

		async myNotifications(_, input, { database, requireAuth, user }) {
			requireAuth()

			return await database.notification.findMany({
				...input,
				where: {
					...input.where,
					users: { some: { id: user?.id } },
				},
			})
		},

		async myNotificationsCount(_, input, { database, requireAuth, user }) {
			requireAuth()

			return await database.notification.count({
				...input,
				where: {
					...input.where,
					users: { some: { id: user?.id } },
				},
			})
		},
	},

	Mutation: {
		async createNotification(_, { data }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			const users = await database.userPreferences.findMany({
				where: { emailNotifications: true },
				select: { userId: true },
			})

			const usersIds = users.map(({ userId }) => userId)

			return await database.notification.create({
				data: {
					...data,
					users: { connect: usersIds.map(userId => ({ id: userId })) },
				},
			})
		},

		async updateNotification(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.notification.update({ where, data })
		},

		async deleteNotification(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.notification.delete(input)
		},
	},
} as Resolvers
