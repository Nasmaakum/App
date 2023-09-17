import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { GraphQLTypes } from '../../../api'
import { Heading, HStack, Text, VStack } from 'native-base'
import { PasswordRequirements } from '../../../components/PasswordRequirements'
import { useTranslation } from 'react-i18next'
import { validate as validateEmail } from 'email-validator'
import Button from '../../../components/form/Button'
import DatePicker from '../../../components/form/DatePicker'
import Input from '../../../components/form/Input'
import React from 'react'
import ScrollView from '../../../components/layout/ScrollView'
import Select from '../../../components/form/Select'
import validatePassword from '../../../functions/validate-pasword'

export default function RegisterOneScreen({
	navigation,
}: AuthStackScreenProps<'RegisterOne'>) {
	const { t } = useTranslation('auth')

	type Values = Omit<
		GraphQLTypes['RegistrationInput'],
		'country' | 'city' | 'gender' | 'mobile' | 'role'
	> & {
		passwordConfirmation: string
	}

	const { errors, handleChange, handleSubmit, values } = useFormik<Values>({
		initialValues: {
			firstName: '',
			lastName: '',
			cpr: '',
			email: '',
			password: '',
			passwordConfirmation: '',
			dateOfBirth: new Date(),
			language: 'English',
			acceptPrivacyPolicy: false,
			acceptTermsOfUse: false,
		},
		onSubmit: data => navigation.navigate('RegisterTwo', data),
		validate: values => {
			const errors: FormikErrors<Values> = {}

			if (!values.firstName) errors.firstName = t('first-name-is-required')
			if (!values.lastName) errors.lastName = t('last-name-is-required')
			if (!values.cpr) errors.cpr = t('cpr-is-required')

			if (!values.email) errors.email = t('email-is-required')
			if (!validateEmail(values.email)) errors.email = t('invalid-email-format')

			if (!values.password) errors.password = t('password-is-required')
			else if (!validatePassword(values.password))
				errors.password = t('password-is-invalid')

			if (
				!values.passwordConfirmation ||
				values.passwordConfirmation !== values.password
			)
				errors.passwordConfirmation = t('passwords-do-not-match')

			if (!values.language) errors.language = t('language-is-required')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	return (
		<ScrollView space='2xl' flex={1} p='8'>
			<Heading color='primary.600' textAlign='center'>
				{t('sign-up')}
			</Heading>

			<VStack space='sm' justifyContent='space-between' flex={1}>
				<Input
					autoCapitalize='words'
					autoCorrect={false}
					placeholder={t('first-name')}
					icon='UserSolid'
					value={values.firstName}
					error={errors.firstName}
					onChangeText={handleChange('firstName')}
				/>

				<Input
					autoCapitalize='words'
					autoCorrect={false}
					placeholder={t('last-name')}
					icon='UserSolid'
					value={values.lastName}
					error={errors.lastName}
					onChangeText={handleChange('lastName')}
				/>

				<Input
					placeholder={t('cpr-number')}
					icon='IdCardSolid'
					keyboardType='numeric'
					value={values.cpr}
					error={errors.cpr}
					onChangeText={handleChange('cpr')}
				/>

				<Input
					autoCapitalize='none'
					autoCorrect={false}
					keyboardType='email-address'
					placeholder={t('email')}
					icon='AtSolid'
					value={values.email}
					error={errors.email}
					onChangeText={handleChange('email')}
				/>

				<Input
					placeholder={t('create-password')}
					icon='LockSolid'
					value={values.password}
					error={errors.password}
					type='password'
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					onChangeText={handleChange('password')}
				/>

				<PasswordRequirements password={values.password} mb='8' mt='-4' />

				<Input
					placeholder={t('confirm-password')}
					icon='LockSolid'
					value={values.passwordConfirmation}
					error={errors.passwordConfirmation}
					type='password'
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					onChangeText={handleChange('passwordConfirmation')}
				/>

				<HStack space='md' mt='-4'>
					<VStack flex={1}>
						<Text
							ml='9'
							fontSize='md'
							color='primary.600'
							fontWeight='semibold'
						>
							{t('date-of-birth')}
						</Text>

						<DatePicker
							placeholder='DD/MM/YYYY'
							icon='CalendarSolid'
							value={values.dateOfBirth}
							error={errors.dateOfBirth as string}
							onChange={handleChange('dateOfBirth')}
						/>
					</VStack>

					<VStack flex={1}>
						<Text
							ml='9'
							fontSize='md'
							color='primary.600'
							fontWeight='semibold'
						>
							{t('language')}
						</Text>

						<Select
							placeholder='English'
							icon='EarthAsiaSolid'
							selectedValue={values.language}
							data={[
								{ label: 'English', value: 'English' },
								{ label: 'Arabic', value: 'Arabic' },
							]}
							error={errors.language}
							onValueChange={handleChange('language')}
						/>
					</VStack>
				</HStack>
			</VStack>

			<VStack mt='2' space='sm'>
				<Button onPress={() => handleSubmit()}>{t('continue')}</Button>

				<Button
					variant='link'
					hitSlop={8}
					_text={{
						fontWeight: 'bold',
						fontSize: 'lg',
						color: 'primary.500',
						underline: true,
						italic: true,
					}}
					onPress={() => navigation.navigate('Login')}
				>
					<HStack space='1'>
						<Text fontWeight='semibold' fontSize='lg' color='primary.600'>
							{t('already-have-an-account')}
						</Text>
						<Text
							fontWeight='semibold'
							fontSize='lg'
							color='primary.400'
							underline
							italic
						>
							{t('sign-in')}
						</Text>
					</HStack>
				</Button>
			</VStack>
		</ScrollView>
	)
}

export type RegisterOneScreenParams = undefined
