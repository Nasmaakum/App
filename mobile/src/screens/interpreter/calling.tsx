import { $, useTypedMutation } from '../../api'
import { Audio } from 'expo-av'
import { Avatar, Box, Pressable, Text, VStack } from 'native-base'
import { InterpreterStackScreenProps } from '../../navigation/types'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import React, { useEffect, useRef, useState } from 'react'

export default function CallingScreen({
	navigation,
	route: { params },
}: InterpreterStackScreenProps<'Calling'>) {
	const { id, image, name } = params

	const { t } = useTranslation('interpreter')

	const [isCalling, setIsCalling] = useState(true)
	const [keptAliveCount, setKeptAliveCount] = useState(0)
	const [ringtone, setRingtone] = useState<Audio.Sound | null>(null)

	const keepAlive = useRef<NodeJS.Timeout>()

	const [keepCallAlive] = useTypedMutation(
		{
			keepCallAlive: [
				{
					where: $('where', 'KeepCallAliveWhereInput!'),
					data: { getToken: true },
				},
				{ id: true, token: true, to: { id: true } },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ keepCallAlive: { id, token, to } }) => {
					if (token) {
						setIsCalling(false)
						clearInterval(keepAlive.current)
						handleJoinCall({ id, token, to })
					}

					setKeptAliveCount(val => val + 1)
					if (keptAliveCount >= 31) handleEndCall()
				},
				onError: () => handleEndCall(),
			},
		},
	)

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

	useEffect(() => {
		navigation.addListener('beforeRemove', e => {
			if (!isCalling) navigation.dispatch(e.data.action)
			else e.preventDefault()
		})
	}, [isCalling, navigation])

	async function playSound() {
		const { sound } = await Audio.Sound.createAsync(
			require('../../assets/audio/calling.mp3'),
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

	useEffect(() => {
		const play = async () => {
			if (isCalling) await playSound()
			else ringtone?.stopAsync()
		}

		play()
	}, [isCalling])

	const handleEndCall = () => {
		endCall({ variables: { where: { id } } })
		setIsCalling(false)
	}

	const handleJoinCall = (data: {
		id: string
		token: string
		to: { id: string }
	}) => {
		setIsCalling(false)
		navigation.replace('Call', {
			id: data.id,
			token: data.token,
			interpreterId: data.to.id,
			initiatedByMe: true,
		})
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
					{t('calling')}
				</Text>
			</VStack>

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
				<Icon name='PhoneSolid' style={{ transform: [{ rotate: '135deg' }] }} />
			</Pressable>
		</Box>
	)
}

export type CallingScreenParams = {
	id: string
	name: string
	image?: string
}
