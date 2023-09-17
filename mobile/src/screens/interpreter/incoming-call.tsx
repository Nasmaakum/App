import { $, useTypedMutation } from '../../api'
import { Audio } from 'expo-av'
import { Avatar, Box, HStack, Pressable, Text, VStack } from 'native-base'
import { InterpreterStackScreenProps } from '../../navigation/types'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import React, { useEffect, useRef, useState } from 'react'

export default function IncomingCallScreen({
	navigation,
	route: { params },
}: InterpreterStackScreenProps<'IncomingCall'>) {
	const { id, image, name } = params

	const { t } = useTranslation('interpreter')

	const [isCalling, setIsCalling] = useState(true)
	const [ringtone, setRingtone] = useState<Audio.Sound | null>(null)

	const [keptAliveCount, setKeptAliveCount] = useState(0)
	const keepAlive = useRef<NodeJS.Timeout>()

	const [keepCallAlive] = useTypedMutation(
		{
			keepCallAlive: [
				{
					where: $('where', 'KeepCallAliveWhereInput!'),
					data: { getToken: true },
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					setKeptAliveCount(val => val + 1)
					if (keptAliveCount >= 31) handleEndCall()
				},
				onError: () => handleEndCall(),
			},
		},
	)

	const handleKeepCallAlive = () => {
		if (!isCalling) return
		keepCallAlive({ variables: { where: { id } } })
	}

	useEffect(() => {
		keepAlive.current = setInterval(() => {
			handleKeepCallAlive()
		}, 1000)

		return () => clearInterval(keepAlive.current)
	}, [id, keepAlive, isCalling])

	async function playSound() {
		const { sound } = await Audio.Sound.createAsync(
			require('../../assets/audio/ringtone.mp3'),
			{ isLooping: true },
		)

		setRingtone(sound)

		await sound.playAsync()
	}

	useEffect(() => {
		return ringtone
			? () => {
					ringtone.unloadAsync()
			  }
			: undefined
	}, [ringtone])

	const [endCall] = useTypedMutation(
		{ endCall: { id: true, token: true } },
		{
			apolloOptions: {
				onCompleted: () => {
					setIsCalling(false)
					navigation.goBack()
				},
				onError: () => {
					setIsCalling(false)
					navigation.goBack()
				},
			},
		},
	)

	const [answerCall] = useTypedMutation(
		{
			answerCall: {
				id: true,
				token: true,
				to: { id: true },
			},
		},
		{
			apolloOptions: {
				onCompleted: ({ answerCall: { token, id, to } }) => {
					navigation.replace('Call', {
						id,
						token,
						interpreterId: to.id,
						initiatedByMe: false,
					})
				},
				onError: () => {
					setIsCalling(false)
					navigation.goBack()
				},
			},
		},
	)

	useEffect(() => {
		const play = async () => {
			if (isCalling) await playSound()
			else ringtone?.stopAsync()
		}

		play()
	}, [isCalling])

	useEffect(() => {
		navigation.addListener('beforeRemove', e => {
			if (!isCalling) navigation.dispatch(e.data.action)
			else e.preventDefault()
		})
	}, [isCalling, navigation])

	const handleEndCall = () => {
		endCall({ variables: { where: { id } } })
		setIsCalling(false)
	}

	const handleAnswerCall = () => {
		setIsCalling(false)
		answerCall()
	}

	return (
		<Box flex={1} alignItems='center' py='8' safeArea>
			<VStack flex={1} alignItems='center' space='md'>
				<Avatar
					size='2xl'
					source={
						image ? { uri: image } : require('../../assets/images/user.png')
					}
				/>

				<Text fontWeight='semibold' fontSize='lg'>
					{name}
				</Text>

				<Text fontWeight='semibold' fontSize='md'>
					{t('incoming-call')}
				</Text>
			</VStack>

			<HStack justifyContent='space-between' w='full' px='16'>
				<Pressable
					bg='red.600'
					style={{ aspectRatio: 1 }}
					h='20'
					borderRadius='full'
					justifyContent='center'
					alignItems='center'
					_pressed={{ opacity: 0.5 }}
					onPress={handleEndCall}
				>
					<Icon
						name='PhoneSolid'
						style={{ transform: [{ rotate: '135deg' }] }}
					/>
				</Pressable>

				<Pressable
					bg='green.600'
					style={{ aspectRatio: 1 }}
					h='20'
					borderRadius='full'
					justifyContent='center'
					alignItems='center'
					_pressed={{ opacity: 0.5 }}
					onPress={handleAnswerCall}
				>
					<Icon name='PhoneSolid' />
				</Pressable>
			</HStack>
		</Box>
	)
}

export type IncomingCallScreenParams = {
	id: string
	name: string
	image?: string
}
