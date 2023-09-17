import { $, GraphQLTypes, useTypedMutation } from '../../api'
import { FormikErrors, useFormik } from 'formik'
import { PasswordRequirements } from '../../components/PasswordRequirements'
import { Section } from '../../components/layout/Section'
import { useToast } from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import React from 'react'
import ScrollView from '../../components/layout/ScrollView'
import validatePassword from '../../functions/validate-pasword'

export default function ChangePasswordScreen() {
	const { t } = useTranslation('settings')

	const toast = useToast()

	const [changePassword, { loading }] = useTypedMutation(
		{
			changePassword: [
				{ data: $('data', 'ChangePasswordInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onError: ({ message }) => {
					toast.show({ description: message })
				},
			},
		},
	)

	type Values = GraphQLTypes['ChangePasswordInput'] & {
		confirmPassword: string
	}

	const { errors, handleChange, handleSubmit, values } = useFormik<Values>({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		onSubmit: ({ confirmPassword, ...data }) =>
			changePassword({ variables: { data } }),
		validate: values => {
			const errors: FormikErrors<Values> = {}

			if (!values.currentPassword)
				errors.currentPassword = t('current-password-is-required')
			if (!values.newPassword)
				errors.newPassword = t('new-password-is-required')
			else if (!validatePassword(values.newPassword))
				errors.newPassword = t('password-is-invalid')

			if (
				!values.confirmPassword ||
				values.confirmPassword !== values.newPassword
			)
				errors.confirmPassword = t('passwords-do-not-match')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<ScrollView>
			<Section
				containerProps={{ flex: 1, p: 8 }}
				label={t('change-password')}
				textAlign='center'
				space='md'
			>
				<Input
					label={t('current-password')}
					value={values.currentPassword}
					error={errors.currentPassword}
					type='password'
					onChangeText={handleChange('currentPassword')}
				/>

				<Input
					label={t('new-password')}
					value={values.newPassword}
					error={errors.newPassword}
					type='password'
					onChangeText={handleChange('newPassword')}
				/>

				<PasswordRequirements password={values.newPassword} mb='8' mt='-4' />

				<Input
					label={t('confirm-password')}
					value={values.confirmPassword}
					error={errors.confirmPassword}
					type='password'
					onChangeText={handleChange('confirmPassword')}
				/>

				<Button isLoading={loading} onPress={() => handleSubmit()}>
					{t('change')}
				</Button>
			</Section>
		</ScrollView>
	)
}

export type ChangePasswordScreenParams = undefined
