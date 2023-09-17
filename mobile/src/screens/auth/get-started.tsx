import { AuthStackScreenProps } from '../../navigation/types'
import { Image, VStack } from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../components/form/Button'
import React from 'react'

export default function GetStartedScreen({
	navigation,
}: AuthStackScreenProps<'GetStarted'>) {
	const { t } = useTranslation('auth')

	return (
		<VStack p='8' justifyContent='space-between' flex={1}>
			<Image
				source={require('../../assets/images/logo.png')}
				alt='Logo'
				height={100}
				style={{ resizeMode: 'contain' }}
				w='full'
			/>

			<Image
				source={require('../../assets/images/auth/get-started.png')}
				alt='Get Started'
				flex={1}
				style={{ resizeMode: 'contain' }}
			/>

			<Button onPress={() => navigation.navigate('Login')}>
				{t('get-started')}
			</Button>
		</VStack>
	)
}

export type GetStartedScreenParams = undefined
