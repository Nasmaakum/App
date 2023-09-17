import { $, GraphQLTypes, useTypedLazyQuery } from '../../api'
import { AuthStackScreenProps } from '../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { HStack, Image, Text, useToast, VStack } from 'native-base'
import { useAuth } from '../../contexts/auth'
import { useTranslation } from 'react-i18next'
import { validate as validateEmail } from 'email-validator'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import KeyboardAvoidingView from '../../components/layout/KeyboardAvoidingView'
import React from 'react'

export default function LoginScreen({
	navigation,
}: AuthStackScreenProps<'Login'>) {
	const { t } = useTranslation('auth')
	const { login: loginToken } = useAuth()
	const toast = useToast()

	const [login, { loading }] = useTypedLazyQuery(
		{
			login: [
				{ data: $('data', 'LoginInput!') },
				{ authentication: { token: true, user: { role: true } } },
			],
		},
		{
			apolloOptions: {
				onCompleted: async ({ login }) => {
					if (login.authentication.user.role === 'ADMIN')
						toast.show({ description: t('admin-not-allowed-in-app') })

					if (login.authentication) await loginToken(login.authentication.token)
				},
				onError: ({ message }) => {
					switch (message) {
						case 'Incorrect credentials':
							toast.show({ description: t('incorrect-credentials') })
							break
						case 'Your account is awaiting approval':
							toast.show({ description: t('user-is-not-verified') })
							break
						case 'Your application has been rejected':
							toast.show({ description: t('application-rejected') })
							break
						default:
							toast.show({ description: t('network-request-failed') })
					}
				},
			},
		},
	)

	const { errors, handleChange, handleSubmit, values } = useFormik<
		GraphQLTypes['LoginInput']
	>({
		initialValues: { email: '', password: '' },
		onSubmit: data => login({ variables: { data } }),
		validate: values => {
			const errors: FormikErrors<GraphQLTypes['LoginInput']> = {}

			if (!values.email) errors.email = t('email-is-required')
			else if (!validateEmail(values.email))
				errors.email = t('invalid-email-format')

			if (!values.password) errors.password = t('password-is-required')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<KeyboardAvoidingView flex={1} p='8'>
			<VStack justifyContent='space-between' flex={1} space='4'>
				<Image
					source={require('../../assets/images/auth/login.png')}
					alt='Login'
					style={{ resizeMode: 'contain' }}
					flex={1}
				/>

				<VStack space='2xl'>
					<Input
						autoCapitalize='none'
						autoCorrect={false}
						keyboardType='email-address'
						placeholder={t('email')}
						icon='AtSolid'
						isDisabled={loading}
						value={values.email}
						error={errors.email}
						onChangeText={handleChange('email')}
					/>

					<Input
						placeholder={t('password')}
						icon='LockSolid'
						type='password'
						isDisabled={loading}
						value={values.password}
						error={errors.password}
						onChangeText={handleChange('password')}
					/>
				</VStack>

				<Button
					variant='link'
					isDisabled={loading}
					hitSlop={8}
					textAlign='right'
					justifyContent='flex-end'
					mt='-6'
					_text={{
						fontWeight: 'semibold',
						fontSize: 'md',
						color: 'primary.400',
						italic: true,
						underline: true,
					}}
					onPress={() => navigation.navigate('ForgetPassword')}
				>
					{t('forgot-password')}
				</Button>

				<VStack mt='2' space='sm'>
					<Button isLoading={loading} onPress={() => handleSubmit()}>
						{t('sign-in')}
					</Button>

					<Button
						variant='link'
						isDisabled={loading}
						hitSlop={8}
						_text={{
							fontWeight: 'bold',
							fontSize: 'lg',
							color: 'primary.500',
							underline: true,
						}}
						onPress={() => navigation.navigate('RegisterOne')}
					>
						<HStack space='1' justifyContent='center'>
							<Text fontWeight='semibold' fontSize='lg' color='primary.600'>
								{t('dont-have-an-account')}
							</Text>
							<Text
								fontWeight='semibold'
								fontSize='lg'
								color='primary.400'
								underline
								italic
							>
								{t('sign-up')}
							</Text>
						</HStack>
					</Button>
				</VStack>
			</VStack>
		</KeyboardAvoidingView>
	)
}

export type LoginScreenParams = undefined
