import { Expo, ExpoPushMessage } from 'expo-server-sdk'

export default async function sendPushNotification(
	payload: NotificationPayload,
	silent = false,
) {
	const EXPO_TOKEN = process.env.EXPO_TOKEN
	if (!EXPO_TOKEN)
		throw new Error('The EXPO_TOKEN environment variable must be set')

	const expo = new Expo({ accessToken: EXPO_TOKEN })

	const messages: ExpoPushMessage[] = []
	for (const pushToken of payload.tokens) {
		if (!Expo.isExpoPushToken(pushToken)) {
			continue
		}

		messages.push({
			to: pushToken,
			sound: silent ? null : 'default',
			title: silent ? undefined : payload.title,
			body: silent ? undefined : payload.body,
			data: { data: payload.data },
		})
	}

	const chunks = expo.chunkPushNotifications(messages)
	;(async () => {
		for (const chunk of chunks) {
			await expo.sendPushNotificationsAsync(chunk)
		}
	})()
}

type NotificationPayload = {
	title: string
	body: string
	data?: { [key: string]: string }
	tokens: string[]
}
