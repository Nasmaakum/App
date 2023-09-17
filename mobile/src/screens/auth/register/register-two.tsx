import { $, GraphQLTypes, sanitizeData, useTypedMutation } from '../../../api'
import { AuthStackScreenProps } from '../../../navigation/types'
import { FormikErrors, useFormik } from 'formik'
import { Heading, HStack, Pressable, Text, useToast, VStack } from 'native-base'
import { Pill } from '../../../components/Pill'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/form/Button'
import Checkbox from '../../../components/form/Checkbox'
import flags from '../../../constants/flags.json'
import Input from '../../../components/form/Input'
import PhoneInput from '../../../components/form/PhoneInput'
import React, { useEffect } from 'react'
import ScrollView from '../../../components/layout/ScrollView'
import Select from '../../../components/form/Select'

export default function RegisterTwoScreen({
	navigation,
	route: { params },
}: AuthStackScreenProps<'RegisterTwo'>) {
	const { t } = useTranslation('auth')

	const toast = useToast()

	const [register, { loading: registerLoading }] = useTypedMutation(
		{
			register: [{ data: $('data', 'RegistrationInput!') }, { message: true }],
		},
		{
			apolloOptions: {
				onCompleted: async () =>
					navigation.navigate('RegisterThree', {
						email: values.email,
					}),
				onError: ({ message }) => {
					if (
						message.includes(
							'Unique constraint failed on the fields: (`email`)',
						)
					)
						setFieldError(
							'email',
							t('an-account-using-this-email-address-already-exists'),
						)
					else if (
						message.includes(
							'Unique constraint failed on the fields: (`mobile`)',
						)
					)
						setFieldError(
							'mobile',
							t('an-account-using-this-mobile-number-already-exists'),
						)
					else toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	type Values = GraphQLTypes['RegistrationInput'] & {
		acceptTermsOfUseAndPrivacyPolicy: boolean
		passwordConfirmation: string
		registerAs: 'USER' | 'INTERPRETER'
	}

	const {
		errors,
		handleChange,
		handleSubmit,
		values,
		setFieldError,
		setFieldValue,
	} = useFormik<Values>({
		initialValues: {
			...params,
			country: '',
			city: '',
			gender: 'MALE' as GraphQLTypes['Gender'],
			mobile: '',
			acceptTermsOfUseAndPrivacyPolicy: false,
			registerAs: 'USER',
		},
		onSubmit: data =>
			register({
				variables: {
					data: {
						...sanitizeData(data, [
							'acceptTermsOfUseAndPrivacyPolicy',
							'passwordConfirmation',
							'registerAs',
						]),
						interpreter:
							data.registerAs === 'INTERPRETER'
								? { languages: [params.language] }
								: undefined,
						acceptTermsOfUse: true,
						acceptPrivacyPolicy: true,
					},
				},
			}),
		validate: values => {
			const errors: FormikErrors<Values> = {}

			if (!values.country) errors.country = t('country-is-required')
			if (!values.city) errors.city = t('city-is-required')
			if (!values.mobile) errors.mobile = t('mobile-is-required')

			if (!values.acceptTermsOfUseAndPrivacyPolicy)
				errors.acceptTermsOfUseAndPrivacyPolicy = t(
					'you-must-agree-to-the-terms-of-use-and-privacy-policy',
				)

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	useEffect(() => {
		setFieldError('acceptTermsOfUseAndPrivacyPolicy', undefined)
	}, [values.acceptTermsOfUseAndPrivacyPolicy])

	return (
		<ScrollView space='2xl' flex={1} p='8'>
			<Heading color='primary.600' textAlign='center'>
				{t('sign-up')}
			</Heading>

			<VStack space='sm' justifyContent='space-between' flex={1}>
				<Select
					placeholder={t('country')}
					error={errors.country}
					data={flags.map(flag => ({
						label: `${flag.flag}  ${flag.country}`,
						value: flag.code,
					}))}
					selectedValue={values.country}
					isDisabled={registerLoading}
					onValueChange={val => setFieldValue('country', val)}
				/>

				<Input
					placeholder={t('city')}
					isDisabled={registerLoading}
					value={values.city}
					error={errors.city}
					onChangeText={handleChange('city')}
				/>

				<VStack mb='4' space='xs'>
					<Text fontSize='md' color='primary.600' fontWeight='semibold'>
						{t('register-as')}
					</Text>

					<HStack h='12' space='md'>
						<Pill
							label={t('user')}
							active={values.registerAs === 'USER'}
							fontSize='md'
							lowShadow
							onPress={() => setFieldValue('registerAs', 'USER')}
						/>

						<Pill
							label={t('interpreter')}
							active={values.registerAs === 'INTERPRETER'}
							fontSize='md'
							lowShadow
							onPress={() => setFieldValue('registerAs', 'INTERPRETER')}
						/>
					</HStack>
				</VStack>

				<PhoneInput
					label={t('mobile')}
					placeholder='+973 XXXX XXXX'
					maxLength={12}
					isDisabled={registerLoading}
					value={values.mobile}
					error={errors.mobile}
					keyboardType='numeric'
					onChangeText={handleChange('mobile')}
				/>

				<VStack mb='4' space='xs'>
					<Text fontSize='md' color='primary.600' fontWeight='semibold'>
						{t('gender')}
					</Text>

					<HStack h='12' space='md'>
						<Pill
							label={t('male')}
							active={values.gender === 'MALE'}
							fontSize='md'
							lowShadow
							onPress={() => setFieldValue('gender', 'MALE')}
						/>

						<Pill
							label={t('female')}
							active={values.gender === 'FEMALE'}
							fontSize='md'
							lowShadow
							onPress={() => setFieldValue('gender', 'FEMALE')}
						/>
					</HStack>
				</VStack>

				<Checkbox
					isDisabled={registerLoading}
					isChecked={values.acceptTermsOfUseAndPrivacyPolicy}
					// title={t('i-accept-the-terms-of-use-and-privacy-policy')}
					title={
						<HStack alignItems='center' justifyContent='center'>
							<Text>{t('i-accept-the')} </Text>
							<Pressable onPress={() => navigation.navigate('TermsOfUse')}>
								<Text color='primary.500'>{t('terms-of-use')}</Text>
							</Pressable>
							<Text>{t('and')}</Text>
							<Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
								<Text color='primary.500'>{t('privacy-policy')}</Text>
							</Pressable>
						</HStack>
					}
					error={!!errors.acceptTermsOfUseAndPrivacyPolicy}
					isToggle
					onPress={() =>
						setFieldValue(
							'acceptTermsOfUseAndPrivacyPolicy',
							!values.acceptTermsOfUseAndPrivacyPolicy,
						)
					}
				/>
			</VStack>

			<VStack mt='2' space='sm'>
				<Button isLoading={registerLoading} onPress={() => handleSubmit()}>
					{t('sign-up')}
				</Button>

				<Button
					variant='link'
					hitSlop={8}
					_text={{
						fontWeight: 'bold',
						fontSize: 'lg',
						color: 'primary.500',
						underline: true,
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
						>
							{t('sign-in')}
						</Text>
					</HStack>
				</Button>
			</VStack>
		</ScrollView>
	)
}

type Values = Omit<
	GraphQLTypes['RegistrationInput'],
	'country' | 'city' | 'biometric' | 'gender' | 'mobile' | 'role'
>

export type RegisterTwoScreenParams = Values & {
	passwordConfirmation: string
}
