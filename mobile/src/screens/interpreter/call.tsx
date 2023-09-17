import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from '../../api'
import {
	Box,
	FlatList,
	HStack,
	Image,
	IPressableProps,
	PresenceTransition,
	Pressable,
	Text,
	VStack,
} from 'native-base'
import { Dimensions, I18nManager } from 'react-native'
import { Enx, EnxPlayerView, EnxRoom, EnxStream } from 'enx-rtc-react-native'
import { InterpreterStackScreenProps } from '../../navigation/types'
import { Section } from '../../components/layout/Section'
import { useMyUser } from '../../contexts/my-user'
import Icon from '../../components/Icon'
import React, { useEffect, useRef, useState } from 'react'
import useComponentWillMount from '../../hooks/useComponentWillMount'
import useForceUpdate from '../../hooks/useForceUpdate'

const Card = (props: CardProps) => {
	const { index, image, title, ...rest } = props

	return (
		<Pressable
			_pressed={{ opacity: 0.5 }}
			pr={index % 2 === 0 ? 2 : 0}
			pl={index % 2 === 0 ? 0 : 2}
			mt={index > 1 ? 2 : 0}
			borderRadius='3xl'
			w='1/2'
			{...rest}
		>
			<VStack space='xs'>
				<Box position='relative' flex={1} p='2' h='32'>
					<Box
						bg='primary.50'
						flex={1}
						borderRadius='3xl'
						shadow='9'
						style={{ shadowOpacity: 0.15 }}
						justifyContent='center'
						alignItems='center'
					>
						<Image
							source={{ uri: image }}
							style={{ resizeMode: 'contain' }}
							alt='Image'
							w='24'
							h='24'
						/>
					</Box>

					<Box
						position='absolute'
						justifyContent='center'
						top='0'
						bottom='0'
						left={0.5}
					>
						<Box borderRadius='full' w='2' bg='primary.600' h='10' />
					</Box>
				</Box>

				<Text
					textAlign='center'
					fontSize='xl'
					fontWeight='bold'
					color='primary.600'
				>
					{title}
				</Text>
			</VStack>
		</Pressable>
	)
}

interface CardProps extends IPressableProps {
	index: number
	title: string
	image: string
}

const Categories = (props: CategoriesProps) => {
	const { onClose, categories, services, onPress, title } = props

	return (
		<Box
			position='absolute'
			top='0'
			right='0'
			left='0'
			bottom='0'
			pt='0'
			bg='white'
			safeArea
		>
			<HStack justifyContent='space-between' h='12' alignItems='center' px='8'>
				<Icon
					name={I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'}
					color='primary.600'
					size='2xl'
					onPress={onClose}
				/>

				<Image
					source={require('../../assets/images/logo.png')}
					style={{ resizeMode: 'contain' }}
					w='56'
					h='full'
					alt='Logo'
				/>

				<Icon name='ASolid' color='transparent' size='2xl' />
			</HStack>

			<VStack px='8' py='4' flex={1}>
				<Section
					label={title || 'Categories'}
					textAlign='center'
					containerProps={{ flex: 1 }}
					flex={1}
				>
					{services ? (
						<FlatList
							_contentContainerStyle={{ p: 4 }}
							overScrollMode='never'
							numColumns={2}
							showsVerticalScrollIndicator={false}
							keyExtractor={({ id }) => id}
							data={services}
							renderItem={({ item: { phone, name, ...rest }, index }) => (
								<Card
									index={index}
									title={name}
									onPress={() => onPress(phone)}
									{...rest}
								/>
							)}
						/>
					) : (
						<FlatList
							_contentContainerStyle={{ p: 4 }}
							overScrollMode='never'
							numColumns={2}
							showsVerticalScrollIndicator={false}
							keyExtractor={({ id }) => id}
							data={categories}
							renderItem={({ item: { id, ...rest }, index }) => (
								<Card index={index} onPress={() => onPress(id)} {...rest} />
							)}
						/>
					)}
				</Section>
			</VStack>
		</Box>
	)
}

interface CategoriesProps {
	title?: string
	categories?: Array<
		Category & {
			services?: Service[]
		}
	>
	services?: Service[]
	onPress: (number: string) => void
	onClose: () => void
}

export default function CallScreen({
	navigation,
	route: { params },
}: InterpreterStackScreenProps<'Call'>) {
	const { id, interpreterId, token, initiatedByMe } = params

	const [isCallActive, setIsCallActive] = useState(true)
	const [isExternalCallActive, setIsExternalCallActive] = useState(false)
	const [isVideoMuted, setIsVideoMuted] = useState(false)
	const [isAudioMuted, setIsAudioMuted] = useState(false)
	const [isSpeaker, setIsSpeaker] = useState(false)

	const [tabShown, setTabShown] = useState(0)
	const [categoryId, setCategoryId] = useState('')
	const [service, setService] = useState<Service>(null)

	const [initialized, setInitialized] = useState(false)
	const [isConnected, setIsConnected] = useState(false)
	const [localStreamId, setLocalStreamId] = useState('')
	const [remoteStream, setRemoteStream] = useState('')

	const { myUser } = useMyUser()

	const LOCAL_STREAM_INFO = {
		audio: true,
		video: true,
		data: false,
		maxVideoBW: '400',
		minVideoBW: '300',
		audioMuted: false,
		videoMuted: false,
		name: myUser?.fullName,
		minWidth: '720',
		minHeight: '480',
		maxWidth: '1280',
		maxHeight: '720',
		audio_only: false,
	}

	const ROOM_INFO = {
		allow_reconnect: true,
		number_of_attempts: '3',
		timeout_interval: '15',
		playerConfiguration: {
			audiomute: false,
			videomute: false,
			bandwidth: false,
			screenshot: false,
			avatar: false,
			iconHeight: 30,
			iconWidth: 30,
			avatarHeight: 50,
			avatarWidth: 50,
			iconColor: '#0000FF',
		},
	}

	const forceUpdate = useForceUpdate()

	useComponentWillMount(() => {
		Enx.initRoom()
		setInitialized(true)
	})

	useEffect(() => {
		return () => {
			Enx.destroy()
		}
	}, [])

	const keepAlive = useRef<NodeJS.Timeout>()

	const { data, loading } = useTypedQuery(
		{
			serviceCategories: [
				{
					orderBy: $('orderBy', '[ServiceCategoryOrderByInput!]'),
				},
				{
					id: true,
					title: true,
					image: true,
					services: { name: true, id: true, image: true, phone: true },
				},
			],
			outboundNumber: true,
		},
		{
			apolloOptions: {
				fetchPolicy: 'network-only',
				variables: {
					orderBy: [{ titleEn: 'desc' }],
				},
			},
		},
	)

	const [keepCallAlive] = useTypedMutation(
		{
			keepCallAlive: [
				{ where: { id }, data: { getToken: false } },
				{ id: true },
			],
		},
		{ apolloOptions: { onError: () => setIsCallActive(false) } },
	)

	const [endCall] = useTypedMutation(
		{ endCall: { id: true } },
		{
			apolloOptions: {
				onError: () => navigate(),
				onCompleted: () => navigate(),
			},
		},
	)

	const [connectService] = useTypedMutation({
		connectService: [{ data: $('data', 'ConnectServiceInput!') }, { id: true }],
	})

	const navigate = () => {
		if (initiatedByMe) navigation.replace('Feedback', { id: interpreterId })
		else navigation.replace('HomeStack', { screen: 'Home' })
	}

	useEffect(() => {
		keepAlive.current = setInterval(() => {
			keepCallAlive({ variables: { where: { id } } })
		}, 2500)

		return () => clearInterval(keepAlive.current)
	}, [id, keepCallAlive])

	useEffect(() => {
		navigation.addListener('beforeRemove', e => {
			if (!isCallActive) navigation.dispatch(e.data.action)
			else e.preventDefault()
		})

		navigation.setOptions({ headerShown: false })
	}, [isCallActive, navigation])

	const roomEventHandlers = {
		roomConnected: () => {
			setIsConnected(true)
			Enx.getLocalStreamId(streamId => {
				setLocalStreamId(streamId)
			})
			Enx.publish()
		},
		userReconnect: () => {
			forceUpdate()
		},
		activeTalkerList: event => {
			if (!event || event.length === 0) {
				setRemoteStream('')
				forceUpdate()
				return
			}

			setRemoteStream(event[0].streamId)

			Enx.getDevices(devices => {
				if (devices.includes('SPEAKER_PHONE'))
					Enx.switchMediaDevice('SPEAKER_PHONE')
			})
		},
		roomDisconnected: () => {
			handleEndCall()
		},
		userConnected: () => {
			// console.log('userConnected', event)
		},
		userDisconnected: () => {
			// handleEndCall()
		},
		streamAdded: event => {
			Enx.subscribe(event.streamId, () => {
				// eslint-disable-next-line no-console
				console.log(
					JSON.stringify(
						{
							message: `${myUser.fullName} has subscribed to stream with id: ${event.streamId} successfully`,
							event,
						},
						null,
						2,
					),
				)
			})
		},
		dialStateEvents: event => {
			if (typeof event === 'string' && event.includes('"number"')) {
				const parsedEvent = JSON.parse(event)

				const number = parsedEvent.number

				;(() => {
					const service = data.serviceCategories
						.map(category => category.services)
						.flat()
						.find(service => service.phone === number)

					if (service) setService(service)
				})()
			}

			if (event === 'Initiated' || event === 'Ringing' || event === 'Connected')
				setIsExternalCallActive(true)
			if (event === 'Disconnected') {
				setCategoryId('')
				setService(null)
				setIsExternalCallActive(false)
			}
		},
	}

	const streamEventHandlers = {
		audioEvent: event => {
			setIsAudioMuted(event.msg === 'Audio Off')
		},
		videoEvent: event => {
			setIsVideoMuted(event.msg === 'Video Off')
		},
	}

	const { height, width } = Dimensions.get('window')

	const handleEndCall = () => {
		endCall({ variables: { where: { id } } })
		clearInterval(keepAlive.current)
		setIsCallActive(false)
		Enx.destroy()
	}

	useEffect(() => {
		if (isCallActive) return

		navigate()
	}, [isCallActive])

	const handleOutboundCall = (number: string, id: string) => {
		connectService({ variables: { data: { id } } })
		Enx.makeOutboundCall(number, data.outboundNumber, {})
	}

	const handleEndOutboundCall = () => {
		Enx.cancelOutboundCall(service.phone)
	}

	const handleToggleVideo = () => {
		Enx.muteSelfVideo(localStreamId, !isVideoMuted)
	}

	const handleToggleAudio = () => {
		Enx.muteSelfAudio(localStreamId, !isAudioMuted)
	}

	const handleToggleSpeaker = () => {
		Enx.getDevices(devices => {
			if (devices.includes('SPEAKER_PHONE') && devices.includes('EARPIECE')) {
				if (isSpeaker) Enx.switchMediaDevice('EARPIECE')
				else Enx.switchMediaDevice('SPEAKER_PHONE')
				setIsSpeaker(!isSpeaker)
			}
		})
	}

	useEffect(() => {
		Enx.getDevices(devices => {
			if (devices.includes('WIRED_HEADSET')) {
				Enx.switchMediaDevice('WIRED_HEADSET')
				setIsSpeaker(false)
			}

			if (devices.includes('BLUETOOTH')) {
				Enx.switchMediaDevice('BLUETOOTH')
				setIsSpeaker(false)
			}
		})
	}, [])

	if (loading || !data || !initialized) return null

	return (
		<>
			<Box position='relative' h='full'>
				{/* INTERPRETER VIDEO */}
				<Box position='absolute' top='0' left='0' right='0' bottom='0'>
					{!!remoteStream && localStreamId && (
						<EnxPlayerView
							key={remoteStream}
							style={{
								flex: 1,
								margin: 1,
								height,
								width,
							}}
							streamId={remoteStream}
							isLocal='remote'
						/>
					)}
				</Box>

				{/* MY VIDEO */}
				<Box
					bg='primary.50'
					w='30%'
					style={{ aspectRatio: 12 / 16 }}
					left='8'
					top='8%'
					position='absolute'
					// borderRadius='3xl'
					overflow='hidden'
				>
					<EnxRoom
						// key={localStreamId}
						token={token}
						eventHandlers={roomEventHandlers}
						localInfo={LOCAL_STREAM_INFO}
						roomInfo={ROOM_INFO}
					>
						{isConnected && (
							<EnxStream
								style={{
									left: 0,
									width: '100%',
									height: '100%',
								}}
								eventHandlers={streamEventHandlers}
							/>
						)}
					</EnxRoom>
				</Box>

				{/* CONTROLS */}
				<Box
					position='absolute'
					left='0'
					right='0'
					bottom='0'
					borderRadius='3xl'
					borderBottomRadius='0'
					shadow='9'
					px='2'
					bg='#2D4451'
				>
					<HStack alignItems='center' flex={1} space='xl' px='4' py='8'>
						<Pressable
							_pressed={{ opacity: 0.5 }}
							flex={1}
							justifyContent='center'
							alignItems='center'
							h='full'
							bg='#577F9A'
							borderRadius='full'
							style={{ aspectRatio: 1, transform: [{ scale: 1.2 }] }}
							onPress={handleToggleVideo}
						>
							<Icon name={isVideoMuted ? 'VideoSlashSolid' : 'VideoSolid'} />
						</Pressable>

						<Pressable
							_pressed={{ opacity: 0.5 }}
							flex={1}
							justifyContent='center'
							alignItems='center'
							h='full'
							bg='#577F9A'
							borderRadius='full'
							style={{ aspectRatio: 1, transform: [{ scale: 1.2 }] }}
							onPress={handleToggleAudio}
						>
							<Icon
								size='md'
								name={isAudioMuted ? 'MicrophoneSlashSolid' : 'MicrophoneSolid'}
							/>
						</Pressable>

						<Pressable
							_pressed={{ opacity: 0.5 }}
							flex={1}
							justifyContent='center'
							alignItems='center'
							bg='#577F9A'
							borderRadius='full'
							style={{ aspectRatio: 1, transform: [{ scale: 1.2 }] }}
							h='full'
							onPress={handleToggleSpeaker}
						>
							<Icon
								size='md'
								name={isSpeaker ? 'VolumeHighSolid' : 'VolumeLowSolid'}
							/>
						</Pressable>

						<Pressable
							_pressed={{ opacity: 0.5 }}
							flex={1}
							justifyContent='center'
							alignItems='center'
							bg='#577F9A'
							borderRadius='full'
							style={{ aspectRatio: 1, transform: [{ scale: 1.2 }] }}
							h='full'
							onPress={() =>
								isExternalCallActive ? handleEndOutboundCall() : setTabShown(1)
							}
						>
							<Icon
								size='md'
								name={isExternalCallActive ? 'UserSlashSolid' : 'UserPlusSolid'}
								color={isExternalCallActive ? 'red.600' : 'white'}
								style={{
									transform: [{ scale: isExternalCallActive ? 1.5 : 1.2 }],
								}}
							/>
						</Pressable>

						<Pressable
							_pressed={{ opacity: 0.5 }}
							bg='red.600'
							style={{ aspectRatio: 1, transform: [{ scale: 1.2 }] }}
							h='full'
							borderRadius='full'
							justifyContent='center'
							alignItems='center'
							flex={1}
							onPress={() => handleEndCall()}
						>
							<Icon
								size='md'
								name='PhoneSolid'
								style={{ transform: [{ rotate: '135deg' }] }}
							/>
						</Pressable>
					</HStack>
				</Box>

				{/* SERVICE */}
				<Box right='8' top='8%' position='absolute' w='35%'>
					<PresenceTransition
						visible={isExternalCallActive}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1, transition: { duration: 250 } }}
					>
						<Box
							bg='primary.50'
							style={{ aspectRatio: 16 / 12 }}
							borderRadius='3xl'
							p='2'
						>
							<Image
								source={{ uri: service?.image }}
								h='full'
								style={{ resizeMode: 'contain' }}
								alt='Service'
							/>

							<Box
								position='absolute'
								justifyContent='center'
								top='0'
								bottom='0'
								left={-4}
							>
								<Box borderRadius='full' w='2' bg='primary.600' h='10' />
							</Box>
						</Box>
					</PresenceTransition>
				</Box>

				<Image
					source={require('../../assets/images/logo.png')}
					h='12'
					w='24'
					style={{ resizeMode: 'contain' }}
					top='0'
					alt='Logo'
					position='absolute'
					left='4'
				/>
			</Box>

			{tabShown === 1 && (
				<Categories
					categories={data.serviceCategories}
					onClose={() => setTabShown(0)}
					onPress={id => {
						setCategoryId(id)
						setTabShown(2)
					}}
				/>
			)}

			{tabShown === 2 && (
				<Categories
					title={data.serviceCategories.find(c => c.id === categoryId)?.title}
					services={
						data.serviceCategories.find(c => c.id === categoryId)?.services
					}
					onClose={() => setTabShown(1)}
					onPress={number => {
						const category = data.serviceCategories.find(
							c => c.id === categoryId,
						)
						const service = category?.services.find(s => s.phone === number)

						setService(service)
						setTabShown(0)
						handleOutboundCall(number, service.id)
					}}
				/>
			)}
		</>
	)
}

export type CallScreenParams = {
	id: string
	token: string
	interpreterId: string
	initiatedByMe: boolean
}

type Service = Pick<GraphQLTypes['Service'], 'id' | 'name' | 'image' | 'phone'>
type Category = Pick<GraphQLTypes['ServiceCategory'], 'id' | 'title' | 'image'>
