import {
	getCameraPermissionsAsync,
	requestCameraPermissionsAsync,
} from 'expo-image-picker'
import { PermissionsAndroid, Platform } from 'react-native'
import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTypedMutation } from '../api'

export default function useCall() {
	const navigation = useNavigation()

	useEffect(() => {
		const checkAndroidPermissions = async () =>
			new Promise((resolve, reject) => {
				PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
					PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
					PermissionsAndroid.PERMISSIONS.CALL_PHONE,
					PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
					PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
					PermissionsAndroid.PERMISSIONS.WRITE_CALL_LOG,
					PermissionsAndroid.PERMISSIONS.CAMERA,
					PermissionsAndroid.PERMISSIONS.USE_SIP,
					PermissionsAndroid.PERMISSIONS.ADD_VOICEMAIL,
					PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
				])
					.then(resolve)
					.catch(reject)
			})

		if (Platform.OS === 'android') checkAndroidPermissions()
	}, [])

	useEffect(() => {
		const checkIOSPermissions = async () => {
			const { status } = await getCameraPermissionsAsync()
			if (status !== 'granted') {
				await requestCameraPermissionsAsync()
			}
		}

		if (Platform.OS === 'ios') checkIOSPermissions()
	}, [])

	const [answerCall] = useTypedMutation(
		{
			answerCall: {
				id: true,
				token: true,
				to: { id: true, user: { id: true } },
			},
		},
		{
			apolloOptions: {
				onCompleted: ({ answerCall: { token, id, to } }) => {
					navigation.navigate('InterpreterStack', {
						screen: 'Call',
						params: {
							id,
							token,
							interpreterId: to.id,
							initiatedByMe: false,
						},
					})
				},
			},
		},
	)

	const [rejectCall] = useTypedMutation({
		rejectCall: {
			id: true,
		},
	})

	const [endCall] = useTypedMutation({
		endCall: {
			id: true,
		},
	})

	const [getActiveCall] = useTypedMutation(
		{
			activeCall: {
				id: true,
				from: { fullName: true, image: true },
			},
		},
		{
			apolloOptions: {
				onCompleted: ({ activeCall }) => {
					if (!activeCall) return

					navigation.navigate('InterpreterStack', {
						screen: 'IncomingCall',
						params: {
							id: activeCall.id,
							name: activeCall.from.fullName,
							image: activeCall.from.image,
						},
					})
				},
			},
		},
	)

	useEffect(() => {
		const refetchQueryInterval = setInterval(() => {
			getActiveCall()
		}, 3000)

		return () => clearInterval(refetchQueryInterval)
	}, [])

	return {
		answerCall,
		rejectCall,
		endCall,
	}
}
