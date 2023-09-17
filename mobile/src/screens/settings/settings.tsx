import { $, useTypedMutation, useTypedQuery } from '../../api'
import { Alert, I18nManager } from 'react-native'
import {
	Box,
	HStack,
	IPressableProps,
	Pressable,
	Text,
	useToast,
	VStack,
} from 'native-base'
import { Section } from '../../components/layout/Section'
import { SettingsStackScreenProps } from '../../navigation/types'
import { useAuth } from '../../contexts/auth'
import { useTranslation } from 'react-i18next'
import Icon, { IconsType } from '../../components/Icon'
import Rate, { AndroidMarket, IConfig } from 'react-native-rate'
import React from 'react'
import Switch from '../../components/form/Switch'

const SettingSwitch = (props: SettingSwitchProps) => {
	const { label, isChecked, onPress, isDisabled } = props

	return (
		<HStack justifyContent='space-between' px='8' py='3' bg='white'>
			<Text fontSize='lg' fontWeight='semibold' color='primary.600'>
				{label}
			</Text>

			<Switch isChecked={isChecked} isDisabled={isDisabled} onPress={onPress} />
		</HStack>
	)
}

interface SettingSwitchProps {
	label: string
	isChecked: boolean
	onPress: () => void
	isDisabled?: boolean
}

const SettingPressable = (props: SettingPressableProps) => {
	const { label, colorScheme = 'default', icon, ...rest } = props

	let iconColor = 'primary.300'
	let textColor = 'primary.600'
	switch (colorScheme) {
		case 'red':
			iconColor = 'red.300'
			textColor = 'red.600'
			break
	}

	return (
		<Pressable {...rest}>
			<HStack justifyContent='space-between' px='8' py='3' bg='white'>
				<Text fontSize='lg' fontWeight='semibold' color={textColor}>
					{label}
				</Text>

				<Icon
					name={
						icon
							? icon
							: I18nManager.isRTL
							? 'ChevronLeftSolid'
							: 'ChevronRightSolid'
					}
					color={iconColor}
				/>
			</HStack>
		</Pressable>
	)
}

interface SettingPressableProps extends IPressableProps {
	label: string
	colorScheme?: 'default' | 'red'
	icon?: IconsType
}

export default function SettingsScreen({
	navigation,
}: SettingsStackScreenProps<'Settings'>) {
	const { t } = useTranslation('settings')

	const toast = useToast()

	const { logout } = useAuth()

	const { data, loading, refetch } = useTypedQuery({
		myPreferences: {
			emailNotifications: true,
			smsNotifications: true,
		},
	})

	const [updateMyPreferences, { loading: updateMyPreferencesLoading }] =
		useTypedMutation(
			{
				updateMyPreferences: [
					{ data: $('data', 'MyUserPreferencesUpdateInput!') },
					{ emailNotifications: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						refetch()
					},
					onError: () => {
						toast.show({ description: t('network-request-failed') })
					},
				},
			},
		)

	const [deleteMyAccount] = useTypedMutation(
		{
			deleteMyUser: [{ data: $('data', 'MyUserDeleteInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: () => logout(),
				onError: ({ message }) => {
					if (message === 'Not Found' || message === 'Password is incorrect') {
						toast.show({ description: t('incorrect-password') })
					} else {
						toast.show({ description: t('network-request-failed') })
					}
				},
			},
		},
	)

	const rateOptions: IConfig = {
		AppleAppID: '2193813192',
		GooglePackageName: 'com.invitabpo.nasmaakum',
		OtherAndroidURL: 'https://appgallery.huawei.com/#/app/C1040000',
		fallbackPlatformURL:
			'https://play.google.com/store/apps/details?id=com.invitabpo.nasmaakum',
		preferredAndroidMarket: AndroidMarket.Google,
		preferInApp: true,
		openAppStoreIfInAppFails: true,
	}

	if (loading) return null

	return (
		<VStack justifyContent='space-between' flex={1} pb='8'>
			<Section
				containerProps={{ flex: 1, py: 8 }}
				label={t('settings')}
				textAlign='center'
				space='sm'
				bg='gray.200'
				py='3'
			>
				<SettingSwitch
					isChecked={data.myPreferences.emailNotifications}
					isDisabled={updateMyPreferencesLoading}
					label={t('email-notifications')}
					onPress={() =>
						updateMyPreferences({
							variables: {
								data: {
									emailNotifications: !data.myPreferences.emailNotifications,
								},
							},
						})
					}
				/>

				<SettingSwitch
					isChecked={!data.myPreferences.smsNotifications}
					isDisabled={updateMyPreferencesLoading}
					label={t('sms-notifications')}
					onPress={() =>
						updateMyPreferences({
							variables: {
								data: {
									smsNotifications: !data.myPreferences.smsNotifications,
								},
							},
						})
					}
				/>

				<SettingPressable
					label={t('help')}
					onPress={() => navigation.navigate('Help')}
				/>

				<SettingPressable
					label={t('rate-us')}
					onPress={() => Rate.rate(rateOptions)}
				/>

				<SettingPressable
					label={t('about-nasmaakum')}
					onPress={() => navigation.navigate('About')}
				/>

				<SettingPressable
					label={t('change-password')}
					onPress={() => navigation.navigate('ChangePassword')}
				/>
			</Section>

			<Box bg='gray.200' py='3'>
				<SettingPressable
					colorScheme='red'
					icon='TrashSolid'
					label={t('delete-my-account')}
					onPress={() =>
						Alert.prompt(
							t('delete-my-account'),
							t('delete-my-account-warning'),
							[
								{
									text: t('cancel'),
									style: 'cancel',
								},
								{
									text: t('delete'),
									style: 'destructive',
									onPress: password => {
										if (password)
											deleteMyAccount({ variables: { data: { password } } })
										else
											Alert.alert(t('password-required'), undefined, [
												{ text: t('ok') },
											])
									},
								},
							],
							'secure-text',
						)
					}
				/>
			</Box>
		</VStack>
	)
}

export type SettingsScreenParams = undefined
