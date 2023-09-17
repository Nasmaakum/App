import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from '../../api'
import {
	Box,
	FlatList,
	HStack,
	IBoxProps,
	Input,
	Pressable,
	Text,
	useToast,
	VStack,
} from 'native-base'
import { FormikErrors, useFormik } from 'formik'
import { InterpreterStackScreenProps } from '../../navigation/types'
import { UserCard } from '../../components/UserCard'
import { useTranslation } from 'react-i18next'
import Button from '../../components/form/Button'
import Icon from '../../components/Icon'
import React, { useEffect } from 'react'
import ScrollView from '../../components/layout/ScrollView'

const RatingOption = (props: RatingOptionProps) => {
	const { title, selected, onPress, ...rest } = props

	return (
		<Box {...rest}>
			<Pressable
				borderRadius='full'
				borderWidth={1.5}
				px='4'
				py='2'
				borderColor='primary.600'
				justifyContent='center'
				alignItems='center'
				bg={selected ? 'primary.600' : 'transparent'}
				flex={1}
				onPress={onPress}
			>
				<Text
					fontWeight='semibold'
					fontSize='sm'
					color={selected ? 'white' : 'primary.600'}
				>
					{title}
				</Text>
			</Pressable>
		</Box>
	)
}

interface RatingOptionProps extends IBoxProps {
	title: string
	selected: boolean
	onPress: () => void
}

export default function FeedbackScreen({
	navigation,
	route: { params },
}: InterpreterStackScreenProps<'Feedback'>) {
	const { id } = params

	const toast = useToast()

	const { t } = useTranslation('interpreter')

	const { data, loading } = useTypedQuery(
		{
			interpreter: [
				{ where: $('where', 'InterpreterWhereUniqueInput!') },
				{
					id: true,
					user: { id: true, fullName: true },
					languages: true,
					isFavorite: true,
					online: true,
				},
			],
			interpreterRatingOptions: [
				{},
				{
					id: true,
					title: true,
					ratingVisibleFrom: true,
					ratingVisibleTo: true,
				},
			],
		},
		{
			operationOptions: { operationName: 'Interpreter' },
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [rateInterpreter, { loading: rateInterpreterLoading }] =
		useTypedMutation(
			{
				createInterpreterRating: [
					{ data: $('data', 'InterpreterRatingCreateInput!') },
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						toast.show({ description: t('rating-thank-you') })
						navigation.replace('HomeStack', { screen: 'Home' })
					},
					onError: () =>
						toast.show({ description: t('network-request-failed') }),
				},
			},
		)

	useEffect(() => {
		setFieldError('error', 'error')
	}, [])

	const {
		values,
		setFieldValue,
		setFieldError,
		handleChange,
		errors,
		handleSubmit,
	} = useFormik<
		GraphQLTypes['InterpreterRatingCreateInput'] & {
			error?: string
		}
	>({
		initialValues: {
			rating: 5,
			tellUsMore: '',
			options: [],
			interpreter: id,
		},
		validate: values => {
			const errors: FormikErrors<{ error?: string }> = {}

			if (!values.options) errors.error = 'error'

			return errors
		},
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: data => rateInterpreter({ variables: { data } }),
	})

	let ratingText: 'inadequate' | 'poor' | 'acceptable' | 'good' | 'excellent' =
		'excellent'
	switch (values.rating) {
		case 1:
			ratingText = 'inadequate'
			break
		case 2:
			ratingText = 'poor'
			break
		case 3:
			ratingText = 'acceptable'
			break
		case 4:
			ratingText = 'good'
			break
		default:
			ratingText = 'excellent'
			break
	}

	if (loading || !data) return null

	const filteredRatingOptions = data?.interpreterRatingOptions?.filter(
		option =>
			option.ratingVisibleFrom <= values.rating &&
			option.ratingVisibleTo >= values.rating,
	)

	const ratingTitle = (() => {
		switch (values.rating) {
			case 1:
				return t('what-was-inadequate')
			case 2:
				return t('what-was-poor')
			case 3:
				return t('what-was-acceptable')
			case 4:
				return t('what-was-good')
			default:
				return t('what-was-excellent')
		}
	})()

	return (
		<ScrollView>
			<VStack flex={1} p='8' space='2xl'>
				<UserCard
					id={data.interpreter.id}
					userId={data.interpreter.user.id}
					fullName={data.interpreter.user.fullName}
					languages={data.interpreter.languages}
					isFavorite={data.interpreter.isFavorite}
					isOnline={data.interpreter.online}
					isInterpreter
				/>

				<VStack justifyContent='center' space='sm'>
					<HStack justifyContent='center' space='sm'>
						{Array(5)
							.fill(0)
							.map((_, i) => (
								<Icon
									key={`rating_${i}`}
									name='StarSolid'
									color={values.rating > i ? 'primary.600' : 'gray.200'}
									size='4xl'
									onPress={() => {
										setFieldValue('options', [])
										setFieldValue('rating', i + 1)
									}}
								/>
							))}
					</HStack>

					<Text
						textAlign='center'
						fontSize='2xl'
						fontWeight='bold'
						color='primary.600'
					>
						{t(ratingText)}
					</Text>
				</VStack>

				<VStack justifyContent='center' space='sm'>
					<Text
						textAlign='center'
						fontSize='2xl'
						fontWeight='bold'
						color='primary.600'
					>
						{ratingTitle}
					</Text>

					<FlatList
						overScrollMode='never'
						numColumns={2}
						showsVerticalScrollIndicator={false}
						keyExtractor={({ id }) => id}
						data={filteredRatingOptions}
						renderItem={({ item, index }) => (
							<RatingOption
								key={item.id}
								title={item.title}
								w={'50%'}
								pr={index % 2 === 0 ? 1 : 0}
								pl={index % 2 === 0 ? 0 : 1}
								mt={index > 1 ? 2 : 0}
								selected={values.options.includes(item.id)}
								onPress={() => {
									const isSelected = values.options.includes(item.id)

									if (isSelected) {
										setFieldValue(
											'options',
											values.options.filter(id => id !== item.id),
										)
										return
									}

									setFieldValue('options', [...values.options, item.id])
								}}
							/>
						)}
					/>
				</VStack>

				<VStack justifyContent='center' space='sm'>
					<Text
						textAlign='center'
						fontSize='2xl'
						fontWeight='bold'
						color='primary.600'
					>
						{t('tell-us-more')}
					</Text>

					<Input
						placeholder={t('let-us-know-how-your-call-went')}
						minH='32'
						borderColor='primary.600'
						borderRadius='2xl'
						borderWidth={2}
						value={values.tellUsMore as string}
						_input={{
							fontSize: 'md',
							fontWeight: 'bold',
							color: 'primary.600',
						}}
						_focus={{
							bg: 'transparent',
						}}
						textAlignVertical='top'
						multiline
						onChangeText={handleChange('tellUsMore')}
					/>
				</VStack>

				<Button
					isLoading={rateInterpreterLoading}
					isDisabled={!!errors.error}
					onPress={() => handleSubmit()}
				>
					{t('submit-rating')}
				</Button>
			</VStack>
		</ScrollView>
	)
}

export type FeedbackScreenParams = {
	id: string
}
