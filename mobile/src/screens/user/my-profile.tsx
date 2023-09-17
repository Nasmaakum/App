import {
	$,
	GraphQLTypes,
	sanitizeData,
	useTypedMutation,
	useTypedQuery,
} from '../../api'
import { FormikErrors, useFormik } from 'formik'
import { PillTabs } from '../../components/PillTabs'
import { Section } from '../../components/layout/Section'
import { Toast, VStack } from 'native-base'
import { useMyUser } from '../../contexts/my-user'
import { UserImage } from '../../components/UserImage'
import { useTranslation } from 'react-i18next'
import { validate as validateEmail } from 'email-validator'
import Button from '../../components/form/Button'
import DatePicker from '../../components/form/DatePicker'
import flags from '../../constants/flags.json'
import Input from '../../components/form/Input'
import PhoneInput from '../../components/form/PhoneInput'
import React, { useEffect, useState } from 'react'
import ScrollView from '../../components/layout/ScrollView'
import Select from '../../components/form/Select'

export default function MyProfileScreen() {
	const { t } = useTranslation('user')

	const { refetchMyUser } = useMyUser()

	const [tab, setTab] = useState<'PERSONAL_INFO' | 'MY_ADDRESS'>(
		'PERSONAL_INFO',
	)

	const { data, loading, refetch } = useTypedQuery({
		myUser: {
			id: true,
			firstName: true,
			lastName: true,
			cpr: true,
			dateOfBirth: true,
			mobile: true,
			email: true,
			country: true,
			city: true,
			image: true,
		},
	})

	const [updateUser, { loading: updateUserLoading }] = useTypedMutation(
		{
			updateMyUser: [{ data: $('data', 'MyUserUpdateInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					Toast.show({ description: t('profile-updated-successfully') })
					refetchMyUser()
					refetch()
				},
				onError: () => {
					Toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	const {
		errors,
		handleChange,
		handleSubmit,
		values,
		setValues,
		setFieldValue,
	} = useFormik<GraphQLTypes['MyUserUpdateInput']>({
		initialValues: {},
		onSubmit: data => updateUser({ variables: { data: sanitizeData(data) } }),
		validate: values => {
			const errors: FormikErrors<GraphQLTypes['MyUserUpdateInput']> = {}

			if (!values.firstName) errors.firstName = t('first-name-is-required')
			if (!values.lastName) errors.lastName = t('last-name-is-required')
			if (!values.cpr) errors.cpr = t('cpr-is-required')

			if (!values.email) errors.email = t('email-is-required')
			if (!validateEmail(values.email)) errors.email = t('invalid-email-format')

			if (!values.country) errors.country = t('country-is-required')
			if (!values.city) errors.city = t('city-is-required')
			if (!values.mobile) errors.mobile = t('mobile-is-required')

			return errors
		},
		validateOnBlur: false,
		validateOnChange: false,
	})

	useEffect(() => {
		if (loading) return

		setValues(data.myUser)
	}, [loading])

	if (loading) return null

	return (
		<ScrollView>
			<Section
				containerProps={{ flex: 1, p: 8 }}
				label={t('my-profile')}
				textAlign='center'
				space='2xl'
			>
				<UserImage
					image={data.myUser.image}
					setImage={image => setFieldValue('image', image)}
					isDisabled={updateUserLoading}
				/>

				<PillTabs
					pills={[
						{
							active: tab === 'PERSONAL_INFO',
							label: t('personal-info'),
							onPress: () => setTab('PERSONAL_INFO'),
						},
						{
							active: tab === 'MY_ADDRESS',
							label: t('my-address'),
							onPress: () => setTab('MY_ADDRESS'),
						},
					]}
				/>

				{tab === 'PERSONAL_INFO' && (
					<VStack space='xs'>
						<Input
							labelStyle={{ ml: 9 }}
							label={t('first-name')}
							placeholder={t('first-name')}
							icon='UserSolid'
							error={errors.firstName}
							value={values.firstName}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('firstName')}
						/>

						<Input
							labelStyle={{ ml: 9 }}
							label={t('last-name')}
							placeholder={t('last-name')}
							icon='UserSolid'
							error={errors.lastName}
							value={values.lastName}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('lastName')}
						/>

						<Input
							labelStyle={{ ml: 9 }}
							label={t('cpr-number')}
							maxLength={9}
							placeholder={t('cpr-number')}
							icon='IdCardSolid'
							keyboardType='numeric'
							error={errors.cpr}
							value={values.cpr}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('cpr')}
						/>

						<DatePicker
							labelStyle={{ ml: 9 }}
							label={t('date-of-birth')}
							placeholder='DD/MM/YYYY'
							icon='CalendarSolid'
							error={errors.dateOfBirth as string}
							value={values.dateOfBirth}
							isDisabled={updateUserLoading}
							onChange={handleChange('dateOfBirth')}
						/>

						<PhoneInput
							labelStyle={{ ml: 9 }}
							label={t('mobile')}
							icon='PhoneSolid'
							placeholder='+973 XXXX XXXX'
							maxLength={12}
							keyboardType='numeric'
							error={errors.mobile}
							value={values.mobile}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('mobile')}
						/>

						<Input
							labelStyle={{ ml: 9 }}
							label={t('email-address')}
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							placeholder='Email'
							icon='AtSolid'
							error={errors.email}
							value={values.email}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('email')}
						/>
					</VStack>
				)}

				{tab === 'MY_ADDRESS' && (
					<VStack px='4' space='xs'>
						<Select
							label={t('country')}
							placeholder={t('country')}
							error={errors.country}
							data={flags.map(flag => ({
								label: flag.country,
								value: flag.code,
							}))}
							selectedValue={values.country}
							isDisabled={updateUserLoading}
							onValueChange={val => setFieldValue('country', val)}
						/>

						<Input
							label={t('city')}
							placeholder={t('city')}
							error={errors.city}
							value={values.city}
							isDisabled={updateUserLoading}
							onChangeText={handleChange('city')}
						/>
					</VStack>
				)}

				<Button isLoading={updateUserLoading} onPress={() => handleSubmit()}>
					{t('save')}
				</Button>
			</Section>
		</ScrollView>
	)
}

export type MyProfileScreenParams = undefined
