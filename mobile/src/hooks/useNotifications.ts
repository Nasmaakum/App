import * as Notifications from 'expo-notifications'
import { $, useTypedMutation } from '../api'
import { isDevice } from 'expo-device'
import { Linking, Platform } from 'react-native'
import { Subscription } from 'expo-modules-core'
import { useAuth } from '../contexts/auth'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

export const setNotificationHandler = (status: boolean) => {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: status,
			shouldPlaySound: status,
			shouldSetBadge: status,
		}),
	})
}

export default function useNotifications() {
	const { isLoggedIn } = useAuth()

	const navigation = useNavigation()

	setNotificationHandler(true)

	const [token, setToken] = useState<string>()
	const [tokenSubmitted, setTokenSubmitted] = useState(false)
	const responseListener = useRef<Subscription>()

	const [submitExpoToken] = useTypedMutation(
		{
			submitExpoToken: [
				{ data: $('data', 'SubmitExpoTokenInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => setTokenSubmitted(true),
				onError: ({ message }) => {
					if (message.includes('Unique constraint failed on the constraint'))
						setTokenSubmitted(true)
				},
			},
		},
	)

	useEffect(() => {
		if (!isLoggedIn || tokenSubmitted) return

		const checkExpoTokenExistsAndSubmit = async () => {
			const savedToken = await AsyncStorage.getItem('expoToken')

			if (token && token !== savedToken) {
				await AsyncStorage.setItem('expoToken', token)

				submitExpoToken({ variables: { data: { token } } })
			}
		}

		checkExpoTokenExistsAndSubmit()
	}, [token, submitExpoToken, tokenSubmitted, isLoggedIn])

	async function registerForPushNotificationsAsync() {
		if (!isDevice) return

		const { status: existingStatus } = await Notifications.getPermissionsAsync()
		let finalStatus = existingStatus

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync()
			finalStatus = status
		}

		if (finalStatus !== 'granted') {
			return
		}

		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#ffffff',
			})
		}

		return (await Notifications.getExpoPushTokenAsync()).data
	}

	useEffect(() => {
		registerForPushNotificationsAsync().then(token => setToken(token))

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(response => {
				const {
					data: { type, data },
				} = response.notification.request
					.content as unknown as NotificationResponse
				const action = response.actionIdentifier

				// if (action === 'expo.modules.notifications.actions.DEFAULT')
				// switch (type) {
				// }
			})

		return () => {
			Notifications.removeNotificationSubscription(
				responseListener.current as Subscription,
			)
		}
	}, [])
}

type NotificationResponse = {
	data: {
		type: string
		data: { [key: string]: string }
	}
}
