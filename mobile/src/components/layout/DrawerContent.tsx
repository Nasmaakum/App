import {
	AlertDialog,
	Avatar,
	Box,
	Button,
	HStack,
	Image,
	IPressableProps,
	Pressable,
	Text,
	VStack,
} from 'native-base'
import { Dimensions, I18nManager } from 'react-native'
import {
	DrawerNavigationHelpers,
	DrawerNavigationProp,
} from '@react-navigation/drawer/lib/typescript/src/types'
import { RootStackParamList } from '../../navigation/types'
import { useAuth } from '../../contexts/auth'
import { useMyUser } from '../../contexts/my-user'
import { useTranslation } from 'react-i18next'
import Icon, { IconsType } from '../Icon'
import React, { useRef, useState } from 'react'
import useIsInterpreter from '../../hooks/useIsInterpreter'

const LogoutModal = (props: LogoutModalProps) => {
	const { isOpen, onClose, onLogout } = props

	const { t } = useTranslation()

	const logoutRef = useRef(null)

	return (
		<AlertDialog
			isOpen={isOpen}
			leastDestructiveRef={logoutRef}
			onClose={onClose}
		>
			<AlertDialog.Content>
				<AlertDialog.CloseButton />
				<AlertDialog.Header>{t('logout')}</AlertDialog.Header>
				<AlertDialog.Body>
					<Text>{t('are-you-sure-you-want-to-logout-question')}</Text>
				</AlertDialog.Body>
				<AlertDialog.Footer>
					<HStack space='sm'>
						<Button variant='danger' onPress={onClose}>
							{t('cancel')}
						</Button>

						<Button onPress={onLogout}>{t('logout')}</Button>
					</HStack>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog>
	)
}

interface LogoutModalProps {
	isOpen: boolean
	onClose: () => void
	onLogout: () => void
}

const DrawerItem = (props: DrawerItemProps) => {
	const { icon, label, ...rest } = props

	const { fontSize, space } = (() => {
		const { width } = Dimensions.get('window')

		if (width >= 640) return { fontSize: 'lg', space: 'lg' }
		if (width >= 300) return { fontSize: 'md', space: 'md' }

		return { fontSize: 'sm', space: 'sm' }
	})()

	return (
		<Pressable py='1' {...rest}>
			<HStack alignItems='center' space={space}>
				<Icon name={icon} color='white' size='lg' />

				<Text fontSize={fontSize} fontWeight='bold' color='white'>
					{label}
				</Text>
			</HStack>
		</Pressable>
	)
}

interface DrawerItemProps extends IPressableProps {
	icon: IconsType
	label: string
}

export const DrawerContent = (props: DrawerContentProps) => {
	const navigation =
		props.navigation as unknown as DrawerNavigationProp<RootStackParamList>

	const { t } = useTranslation('common')

	const [showLogoutModal, setShowLogoutModal] = useState(false)

	const { myUser } = useMyUser()
	const { logout } = useAuth()
	const isInterpreter = useIsInterpreter()

	const userImage = myUser?.image
		? { uri: myUser.image }
		: require('../../assets/images/user.png')

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const navigate = (screen: any, args?: any) => {
		navigation.navigate(screen, args)
		navigation.closeDrawer()
	}

	return (
		<Box flex={1} position='relative'>
			<Pressable
				position='absolute'
				top='0'
				bottom='0'
				right={!I18nManager.isRTL ? '0' : undefined}
				left={!I18nManager.isRTL ? undefined : '0'}
				w='full'
				onPress={() => navigation.closeDrawer()}
			/>

			<Box position='absolute' left='0' top='0' right='0' bottom='0' w='85%'>
				<Image
					style={{
						transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
						aspectRatio: 648 / 1721,
					}}
					source={require('../../assets/images/drawer.png')}
					alt='Drawer'
					h='full'
					w='24'
				/>
			</Box>

			<VStack h='full' px='4' space='xl' w='85%' safeArea>
				<HStack>
					<Icon
						mt={1.5}
						size='2xl'
						name='BarsSolid'
						color='white'
						onPress={() => navigation.closeDrawer()}
					/>
				</HStack>

				<HStack space='xs' alignItems='center'>
					<Avatar size='lg' source={userImage} />

					<Text fontSize='xl' fontWeight='bold' color='white'>
						{myUser?.fullName}
					</Text>
				</HStack>

				<VStack h='60%' justifyContent='space-between'>
					<DrawerItem
						icon='UserSolid'
						label={t('my-profile')}
						onPress={() => navigate('MyProfile')}
					/>

					<DrawerItem
						icon='CalendarSolid'
						label={t('appointments')}
						onPress={() => navigate('Appointments')}
					/>

					{isInterpreter && (
						<DrawerItem
							icon='CircleCheckSolid'
							label={t('availability')}
							onPress={() => navigate('Availability')}
						/>
					)}

					<DrawerItem
						icon='BellSolid'
						label={t('notifications')}
						onPress={() => navigate('Notifications')}
					/>

					{/* <DrawerItem
						icon='MessageSolid'
						label='Messages'
						onPress={() => navigate('Messages')}
					/> */}

					<DrawerItem
						icon='GearSolid'
						label={t('settings')}
						onPress={() => navigate('SettingsStack')}
					/>

					<DrawerItem
						icon='QuestionSolid'
						label={t('help')}
						onPress={() =>
							navigate('SettingsStack', {
								screen: 'Help',
							})
						}
					/>

					<DrawerItem
						icon='FileSolid'
						label={t('terms-of-use')}
						onPress={() => navigate('TermsOfUse')}
					/>

					<DrawerItem
						icon='ShieldSolid'
						label={t('privacy-policy')}
						onPress={() => navigate('PrivacyPolicy')}
					/>

					<DrawerItem
						icon='ArrowRightFromBracketSolid'
						label={t('logout')}
						onPress={() => setShowLogoutModal(true)}
					/>
				</VStack>
			</VStack>

			<LogoutModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				onLogout={() => logout()}
			/>
		</Box>
	)
}

interface DrawerContentProps {
	navigation: DrawerNavigationHelpers
}
