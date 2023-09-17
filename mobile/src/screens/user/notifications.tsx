import { HStack, Image, Text, VStack } from 'native-base'
import { Section } from '../../components/layout/Section'
import { useTranslation } from 'react-i18next'
import { useTypedQuery } from '../../api'
import React from 'react'
import ScrollView from '../../components/layout/ScrollView'

const Notification = (props: NotificationProps) => {
	const { title, message } = props

	return (
		<HStack space='sm' bg='gray.100' px='4' py='2' alignItems='center'>
			<Image
				style={{ resizeMode: 'contain' }}
				w='30%'
				h='12'
				alt='logo'
				source={require('../../assets/images/logo.png')}
			/>

			<VStack flex={1}>
				<Text fontSize='md' fontWeight='bold' color='gray.500'>
					{title}
				</Text>

				<Text>{message}</Text>
			</VStack>
		</HStack>
	)
}

interface NotificationProps {
	title: string
	message: string
}

export default function NotificationsScreen() {
	const { t } = useTranslation('user')

	const { data, loading, refetch } = useTypedQuery({
		myNotifications: [
			{},
			{
				id: true,
				title: true,
				message: true,
			},
		],
	})

	if (!data?.myNotifications) return null

	return (
		<ScrollView refreshing={loading} onRefresh={refetch}>
			<Section
				containerProps={{ flex: 1, py: 8 }}
				label={t('notifications')}
				textAlign='center'
				space='sm'
			>
				{data.myNotifications.map(notification => (
					<Notification
						key={notification.id}
						title={notification.title}
						message={notification.message}
					/>
				))}
			</Section>
		</ScrollView>
	)
}

export type NotificationsScreenParams = undefined
