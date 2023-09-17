import { ApolloError } from '../../functions/errors'
import { Expo } from 'expo-server-sdk'
import { Resolvers } from '../../gql-types'
import compareVersions from 'compare-versions'
import sendPushNotification from '../../functions/send-push-notification'

export default {
	Query: {
		async maintenanceMode(_, __, { database }) {
			const config = await database.config.findFirst()

			if (config)
				return {
					message: config?.maintenanceMode
						? 'Maintenance enabled'
						: 'Maintenance disabled',
				}

			const newConfig = await database.config.create({
				data: { maintenanceMode: false },
			})

			return {
				message: newConfig?.maintenanceMode
					? 'Maintenance enabled'
					: 'Maintenance disabled',
			}
		},

		async compareVersions(_, { data: { version } }, { database }) {
			const config = await database.config.findFirst()

			const compare = config?.minimumVersion
				? compareVersions(config.minimumVersion, version)
				: 0

			if (compare === 1)
				return {
					message: 'Update required',
				}

			return { message: 'Update not required' }
		},
	},
	Mutation: {
		async toggleMaintenanceMode(_, __, { database, isAdmin, requireAuth }) {
			requireAuth(isAdmin)

			const config = await database.config.findFirst()

			if (config) {
				const updatedConfig = await database.config.update({
					where: { id: config?.id },
					data: {
						maintenanceMode: !config?.maintenanceMode,
					},
				})

				return {
					message: updatedConfig?.maintenanceMode
						? 'Maintenance enabled'
						: 'Maintenance disabled',
				}
			}

			const newConfig = await database.config.create({
				data: { maintenanceMode: true },
			})

			return {
				message: newConfig?.maintenanceMode
					? 'Maintenance enabled'
					: 'Maintenance disabled',
			}
		},

		async submitExpoToken(_, { data }, { database, user, requireAuth }) {
			requireAuth()

			if (!Expo.isExpoPushToken(data.token))
				throw ApolloError('MALFORMED_INPUT', 'Invalid Expo token provided')

			const token = await database.expoToken.upsert({
				where: { token: data.token },
				create: { token: data.token, user: { connect: { id: user?.id } } },
				update: { user: { connect: { id: user?.id } } },
			})

			if (!token) throw ApolloError('INTERNAL_ERROR')

			return {
				message: 'Expo token saved',
			}
		},

		async sendNotification(
			_,
			{ data: { body, title, test } },
			{ database, isAdmin, user, requireAuth },
		) {
			requireAuth(isAdmin)

			let tokens: string[] = []

			if (test)
				tokens = (
					await database.expoToken.findMany({ where: { userId: user?.id } })
				).map(({ token }) => token)
			else
				tokens = (
					await database.user.findMany({
						select: {
							expoTokens: true,
							preferences: true,
						},
					})
				)
					.filter(({ preferences }) => preferences?.pushNotifications)
					.flatMap(({ expoTokens }) => expoTokens.map(({ token }) => token))

			await sendPushNotification({
				title,
				body,
				data: {},
				tokens: [...new Set(tokens)],
			})

			return {
				message: 'Notification sent',
			}
		},
	},
} as Resolvers
