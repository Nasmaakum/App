import { AuthStackScreenProps } from '../../../navigation/types'
import { Image, Text, VStack } from 'native-base'
import { useAuth } from '../../../contexts/auth'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/form/Button'
import React, { useEffect } from 'react'
import RNRestart from 'react-native-restart'

export default function RegisterFourScreen({
	navigation,
	route: { params },
}: AuthStackScreenProps<'RegisterFour'>) {
	const { token, interpreter } = params
	const { t } = useTranslation('auth')

	const { login } = useAuth()

	useEffect(() => {
		navigation.addListener('beforeRemove', e => e.preventDefault())
	}, [navigation])

	return (
		<VStack p='8' justifyContent='space-between' flex={1}>
			<VStack justifyContent='center' alignItems='center' flex={1} space='2xl'>
				<Image
					source={require('../../../assets/images/auth/register.png')}
					alt='Get Started'
					flex={1}
					style={{ resizeMode: 'contain' }}
				/>

				<Text
					color='primary.600'
					textAlign='center'
					fontSize='2xl'
					fontWeight='semibold'
					maxW={interpreter ? undefined : '240'}
					flex={1}
				>
					{t(
						interpreter
							? 'thank-you-your-application-is-being-reviewed'
							: 'congratulations-on-creating-your-account',
					)}
				</Text>
			</VStack>

			<VStack mt='2' space='sm' w='full'>
				{token ? (
					<Button onPress={async () => await login(token)}>{t('login')}</Button>
				) : (
					<Button onPress={() => RNRestart.restart()}>{t('continue')}</Button>
				)}
			</VStack>
		</VStack>
	)
}

export type RegisterFourScreenParams = {
	token?: string
	interpreter: boolean
}
