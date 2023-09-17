import { $, GraphQLTypes, sanitizeData, useTypedMutation } from '../../../api'
import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { Heading, Text, useToast, VStack } from 'native-base'
import { PasswordRequirements } from '../../../components/PasswordRequirements'
import { useAuth } from '../../../contexts/auth'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/form/Button'
import Input from '../../../components/form/Input'
import KeyboardAvoidingView from '../../../components/layout/KeyboardAvoidingView'
import React from 'react'
import validatePassword from '../../../functions/validate-pasword'

export default function ResetPasswordScreen({
	route: { params },
}: AuthStackScreenProps<'ResetPassword'>) {
	const { email, code } = params

	const { t } = useTranslation('auth')

	const { login } = useAuth()
	const toast = useToast()

	const [resetPassword, { loading }] = useTypedMutation(
		{
			resetPassword: [
				{ data: $('data', 'ResetPasswordInput!') },
				{ authentication: { token: true } },
			],
		},
		{
			apolloOptions: {
				onCompleted: async ({ resetPassword }) => {
					if (resetPassword.authentication)
						await login(resetPassword.authentication.token)
					else toast.show({ description: t('code-is-invalid') })
				},
				onError: ({ message }) => {
					if (message.includes('Malformed input'))
						toast.show({ description: t('code-is-invalid') })
					else toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	type Values = GraphQLTypes['ResetPasswordInput'] & {
		passwordConfirm: string
	}

	const { errors, handleChange, handleSubmit, values } = useFormik<Values>({
		initialValues: { email, code, password: '', passwordConfirm: '' },
		onSubmit: data =>
			resetPassword({
				variables: { data: sanitizeData(data, ['passwordConfirm']) },
			}),
		validate: values => {
			const errors: FormikErrors<Values> = {}

			if (!values.password) errors.password = t('password-is-required')
			else if (!validatePassword(values.password))
				errors.password = t('password-is-invalid')

			if (!values.passwordConfirm || values.passwordConfirm !== values.password)
				errors.passwordConfirm = t('passwords-do-not-match')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<KeyboardAvoidingView flex={1} p='8'>
			<VStack space='16'>
				<Heading color='primary.600' textAlign='center'>
					{t('reset-password')}
				</Heading>

				<Text
					color='primary.600'
					fontWeight='semibold'
					fontSize='lg'
					px='8'
					textAlign='center'
				>
					{t('pick-a-new-secure-password')}
				</Text>

				<VStack space='sm' px='4'>
					<Input
						value={values.password}
						error={errors.password}
						placeholder={t('password')}
						isDisabled={loading}
						type='password'
						onChangeText={handleChange('password')}
					/>

					<PasswordRequirements password={values.password} mb='8' mt='-4' />

					<Input
						value={values.passwordConfirm}
						error={errors.passwordConfirm}
						placeholder={t('confirm-password')}
						type='password'
						isDisabled={loading}
						onChangeText={handleChange('passwordConfirm')}
					/>
				</VStack>

				<Button mt='-8' isLoading={loading} onPress={() => handleSubmit()}>
					{t('reset')}
				</Button>
			</VStack>
		</KeyboardAvoidingView>
	)
}

export type ResetPasswordScreenParams = {
	email: string
	code: string
}
