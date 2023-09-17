import { $, GraphQLTypes, useTypedMutation } from '../../../api'
import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { Heading, Text, useToast, VStack } from 'native-base'
import { useTranslation } from 'react-i18next'
import { validate as validateEmail } from 'email-validator'
import Button from '../../../components/form/Button'
import Input from '../../../components/form/Input'
import KeyboardAvoidingView from '../../../components/layout/KeyboardAvoidingView'
import React from 'react'

export default function ForgetPasswordScreen({
	navigation,
}: AuthStackScreenProps<'ForgetPassword'>) {
	const { t } = useTranslation('auth')

	const toast = useToast()

	const [requestPasswordReset, { loading }] = useTypedMutation(
		{
			requestPasswordReset: [
				{ data: $('data', 'RequestPasswordResetInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ requestPasswordReset }) => {
					if (requestPasswordReset)
						navigation.navigate('VerifyOTP', {
							email: values.email as string,
						})
					else
						toast.show({ description: 'Account with this email is not found' })
				},
				onError: () => {
					toast.show({ description: 'Network request failed' })
				},
			},
		},
	)

	const { errors, handleChange, handleSubmit, values } = useFormik<
		GraphQLTypes['RequestPasswordResetInput']
	>({
		initialValues: { email: '' },
		onSubmit: data => requestPasswordReset({ variables: { data } }),
		validate: values => {
			const errors: FormikErrors<GraphQLTypes['RequestPasswordResetInput']> = {}

			if (!values.email) errors.email = t('email-is-required')
			else if (!validateEmail(values.email))
				errors.email = t('invalid-email-format')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<KeyboardAvoidingView flex={1} p='8'>
			<VStack space='16'>
				<Heading color='primary.600' textAlign='center'>
					{t('forgot-password-title')}
				</Heading>

				<Text
					color='primary.600'
					fontWeight='semibold'
					fontSize='lg'
					px='8'
					textAlign='center'
				>
					{t('enter-email-address-to-reset-password')}
				</Text>

				<VStack space='sm' px='4'>
					<Text color='primary.600' fontWeight='semibold' fontSize='lg'>
						{t('enter-email-address')}
					</Text>

					<Input
						value={values.email}
						error={errors.email}
						autoCapitalize='none'
						autoCorrect={false}
						keyboardType='email-address'
						placeholder={t('email')}
						isDisabled={loading}
						onChangeText={handleChange('email')}
					/>
				</VStack>

				<Button mt='-8' isLoading={loading} onPress={() => handleSubmit()}>
					{t('send')}
				</Button>
			</VStack>
		</KeyboardAvoidingView>
	)
}

export type ForgetPasswordScreenParams = undefined
