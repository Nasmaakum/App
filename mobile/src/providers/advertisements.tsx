import {
	Box,
	HStack,
	Image,
	Pressable,
	Text,
	useTheme,
	VStack,
} from 'native-base'
import { I18nManager, Linking } from 'react-native'
import { useAuth } from '../contexts/auth'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTypedQuery } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Carousel from 'react-native-reanimated-carousel'
import CircularProgress from 'react-native-circular-progress-indicator'
import dayjs from 'dayjs'
import Icon from '../components/Icon'

export default function AdvertisementsProvider(
	props: AdvertisementsProviderProps,
) {
	const { children } = props

	const { t } = useTranslation('common')

	const theme = useTheme()

	const { isLoggedIn } = useAuth()

	const [showAdvertisement, setShowAdvertisement] = useState(true)
	const [activeAdvertisement, setActiveAdvertisement] = useState(0)

	const [containerDimensions, setContainerDimensions] = useState({
		height: 0,
		width: 0,
	})
	const [duration, setDuration] = useState<undefined | number>()

	const { data, loading } = useTypedQuery(
		{
			activeAdvertisements: {
				id: true,
				duration: true,
				url: true,
				image: true,
				title: true,
				content: true,
			},
		},
		{ apolloOptions: { skip: !isLoggedIn } },
	)

	useEffect(() => {
		if (duration <= 0) {
			setDuration(undefined)
			if (activeAdvertisement !== data?.activeAdvertisements.length - 1)
				setActiveAdvertisement(activeAdvertisement + 1)
			return
		}

		const timer = setTimeout(() => {
			setDuration(duration - 1)
		}, 1000)

		return () => clearTimeout(timer)
	}, [duration])

	useEffect(() => {
		if (!advertisement) return
		setDuration(advertisement.duration)
	}, [activeAdvertisement, loading])

	useEffect(() => {
		const viewedToday = async () => {
			const lastViewed = await AsyncStorage.getItem('adsLastView')
			const isViewedToday = dayjs().isSame(dayjs(lastViewed), 'day')

			if (!isViewedToday) return

			setShowAdvertisement(false)
		}

		viewedToday()
	}, [])

	const isDone = activeAdvertisement === data?.activeAdvertisements.length - 1

	const advertisement = data?.activeAdvertisements[activeAdvertisement]

	if (loading) return null

	if (!showAdvertisement || !isLoggedIn) return children

	const handleEndAds = async () => {
		setShowAdvertisement(false)
		await AsyncStorage.setItem('adsLastView', dayjs().toISOString())
	}

	return (
		<VStack p='4' bg='white' flex={1} justifyContent='center'>
			<HStack
				w='full'
				justifyContent='space-between'
				flexDir={I18nManager.isRTL ? 'row-reverse' : 'row'}
				zIndex={100}
				alignItems='center'
			>
				<Pressable
					borderWidth='4'
					borderColor='primary.600'
					borderRadius='full'
					px='2'
					py='1'
					onPress={() => handleEndAds()}
				>
					<HStack justifyContent='center' alignItems='center' space='1'>
						<Icon name='CircleXmarkSolid' color='primary.600' size='md' />
						<Text color='primary.600' fontSize='md' fontWeight='bold'>
							{t('skip-all')}
						</Text>
					</HStack>
				</Pressable>

				<Pressable
					disabled={duration >= 0}
					onPress={() =>
						isDone
							? handleEndAds()
							: setActiveAdvertisement(activeAdvertisement + 1)
					}
				>
					{duration ? (
						<CircularProgress
							radius={20}
							value={duration}
							maxValue={advertisement.duration}
							progressValueStyle={{ fontSize: 16 }}
							progressValueColor={theme.colors.primary[600]}
							activeStrokeColor={theme.colors.primary[600]}
							activeStrokeWidth={8}
							inActiveStrokeWidth={8}
						/>
					) : (
						<Box
							borderColor='primary.600'
							borderWidth={6}
							borderRadius='full'
							w='10'
							h='10'
							fontWeight='bold'
							color='primary.600'
							justifyContent='center'
							alignItems='center'
						>
							<Icon name='ChevronRightSolid' color='primary.600' size='md' />
						</Box>
					)}
				</Pressable>
			</HStack>

			<Box
				flex={1}
				onLayout={e => {
					const { width, height } = e.nativeEvent.layout
					setContainerDimensions({ height, width })
				}}
			>
				{!!containerDimensions.width && (
					<Carousel
						width={containerDimensions.width}
						height={containerDimensions.height}
						data={data.activeAdvertisements}
						enabled={false}
						defaultIndex={activeAdvertisement}
						renderItem={({ item, index }) => (
							<VStack
								flex={1}
								justifyContent='center'
								alignItems='center'
								px='8'
								py='4'
							>
								<Pressable
									key={item.id}
									flex={1}
									onPress={() => Linking.openURL(item.url)}
								>
									<Image
										source={{ uri: item.image }}
										alt='Advertisement'
										w='full'
										style={{ aspectRatio: 9 / 16 }}
									/>
								</Pressable>

								<VStack p='2' w='full'>
									<Text fontSize='lg' fontWeight='bold'>
										{item.title}
									</Text>

									<Text fontSize='md' fontWeight='semibold'>
										{item.content}
									</Text>
								</VStack>

								<HStack space='xs'>
									{Array.from({
										length: data.activeAdvertisements.length,
									}).map((_, i) => (
										<Box
											key={`advertisement-indicator-${i}`}
											bg={i === index ? 'primary.400' : 'primary.600'}
											w='2'
											h='2'
											borderRadius='full'
										/>
									))}
								</HStack>
							</VStack>
						)}
					/>
				)}
			</Box>
		</VStack>
	)
}

interface AdvertisementsProviderProps {
	children: React.ReactElement
}
