import { $, GraphQLTypes, useTypedMutation } from '../../../api'
import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import {
	Heading,
	HStack,
	Pressable,
	Text,
	useTheme,
	useToast,
	VStack,
} from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/form/Button'
import KeyboardAvoidingView from '../../../components/layout/KeyboardAvoidingView'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import React, { useEffect, useState } from 'react'

export default function VerifyOTPScreen({
	navigation,
	route: { params },
}: AuthStackScreenProps<'VerifyOTP'>) {
	const { t } = useTranslation('auth')

	const theme = useTheme()
	const toast = useToast()

	const [resendCodeTime, setResendCodeTime] = useState('00:30')

	useEffect(() => {
		const interval = setInterval(() => {
			const [minutes, seconds] = resendCodeTime.split(':').map(Number)
			const totalSeconds = minutes * 60 + seconds

			if (totalSeconds <= 0) {
				clearInterval(interval)
				return
			}

			const newTime = new Date(totalSeconds * 1000 - 1000)
				.toISOString()
				.substr(14, 5)

			setResendCodeTime(newTime)
		}, 1000)

		return () => clearInterval(interval)
	}, [resendCodeTime])

	const [requestPasswordReset] = useTypedMutation(
		{
			requestPasswordReset: [
				{ data: $('data', 'RequestPasswordResetInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ requestPasswordReset }) => {
					if (!requestPasswordReset) return

					toast.show({ description: t('code-has-been-sent') })
					setResendCodeTime('00:30')
				},
				onError: () => {
					toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	const [verifyPasswordReset, { loading }] = useTypedMutation(
		{
			verifyPasswordReset: [
				{ data: $('data', 'VerifyPasswordResetInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ verifyPasswordReset: { message } }) => {
					if (message === 'Confirmed')
						navigation.navigate('ResetPassword', values)
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
		GraphQLTypes['VerifyPasswordResetInput']
	>({
		initialValues: { ...params, code: '' },
		onSubmit: data => verifyPasswordReset({ variables: { data } }),
		validate: values => {
			const errors: FormikErrors<GraphQLTypes['VerifyPasswordResetInput']> = {}

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

				<VStack>
					<Pressable
						isDisabled={resendCodeTime !== '00:00'}
						onPress={() =>
							requestPasswordReset({
								variables: {
									data: { email: values.email },
								},
							})
						}
					>
						<Text
							color={resendCodeTime !== '00:00' ? 'primary.100' : 'primary.600'}
							fontWeight='semibold'
							fontSize='md'
							textAlign='center'
						>
							{t('resend-code')}
						</Text>
					</Pressable>

					<Text
						color='primary.300'
						fontWeight='semibold'
						fontSize='sm'
						textAlign='center'
					>
						{resendCodeTime}
					</Text>
				</VStack>

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
					mt='8'
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

export type VerifyOTPScreenParams = {
	email: string
}
