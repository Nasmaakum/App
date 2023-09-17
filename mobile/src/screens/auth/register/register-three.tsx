import { $, GraphQLTypes, useTypedMutation } from '../../../api'
import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { Heading, HStack, Text, useTheme, useToast, VStack } from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/form/Button'
import KeyboardAvoidingView from '../../../components/layout/KeyboardAvoidingView'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import React from 'react'

export default function RegisterThreeScreen({
	navigation,
	route: { params },
}: AuthStackScreenProps<'RegisterThree'>) {
	const { email } = params

	const { t } = useTranslation('auth')

	const theme = useTheme()
	const toast = useToast()

	const [verifyRegistration, { loading }] = useTypedMutation(
		{
			verifyRegistration: [
				{ data: $('data', 'VerifyRegistrationInput!') },
				{
					authentication: {
						token: true,
					},
				},
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ verifyRegistration: { authentication } }) => {
					navigation.navigate('RegisterFour', {
						interpreter: !authentication?.token,
						token: authentication?.token,
					})
				},
				onError: ({ message }) => {
					if (message === 'OTP provided is invalid or expired')
						toast.show({ description: t('code-is-invalid') })
					else toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	const { handleChange, handleSubmit, values } = useFormik<
		GraphQLTypes['VerifyRegistrationInput']
	>({
		initialValues: { email, code: '' },
		onSubmit: data => verifyRegistration({ variables: { data } }),
		validate: values => {
			const errors: FormikErrors<GraphQLTypes['VerifyRegistrationInput']> = {}

			if (!values.code || values.code.length !== 4)
				errors.code = 'OTP is invalid'

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<KeyboardAvoidingView>
			<VStack space='md' p='8' minH='full' justifyContent='space-between'>
				<Heading color='primary.600' textAlign='center'>
					{t('enter-verification-code')}
				</Heading>

				<Text
					color='primary.600'
					fontWeight='semibold'
					fontSize='lg'
					px='2'
					textAlign='center'
				>
					{t('please-enter-the-4-digit-verification-code-sent-to-your-email')}
				</Text>

				<HStack justifyContent='center'>
					<OTPInputView
						style={{ width: '70%', height: 100 }}
						pinCount={4}
						code={values.code}
						codeInputFieldStyle={{
							width: 48,
							height: 55,
							borderWidth: 2,
							borderColor: theme.colors.primary[100],
							borderRadius: theme.radii['xl'],
							fontSize: theme.fontSizes['2xl'],
							color: theme.colors.primary[400],
							backgroundColor: theme.colors.primary[50],
						}}
						codeInputHighlightStyle={{
							borderColor: '#03DAC6',
						}}
						autoFocusOnLoad
						onCodeChanged={handleChange('code')}
					/>
				</HStack>

				<Text
					color='gray.500'
					fontWeight='semibold'
					fontSize='md'
					px='1'
					textAlign='center'
				>
					{t(
						'if-your-didnt-receive-a-verification-code-please-check-to-ensure-the-email-address-you-entered-is-correct',
					)}
				</Text>

				<Button
					mt='4'
					isLoading={loading}
					isDisabled={values.code.length !== 4}
					onPress={() => handleSubmit()}
				>
					{t('verify')}
				</Button>
			</VStack>
		</KeyboardAvoidingView>
	)
}

export type RegisterThreeScreenParams = {
	email: string
}
