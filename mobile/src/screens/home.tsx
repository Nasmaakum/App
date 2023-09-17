import { $, useTypedMutation, useTypedQuery } from '../api'
import { BottomNavigation } from '../components/BottomNavigation'
import { Box, HStack, Text, VStack } from 'native-base'
import { HomeStackScreenProps } from '../navigation/types'
import { Section } from '../components/layout/Section'
import { useMyUser } from '../contexts/my-user'
import { UserCard } from '../components/UserCard'
import { useTranslation } from 'react-i18next'
import ScrollView from '../components/layout/ScrollView'
import Switch from '../components/form/Switch'
import useCall from '../hooks/useCall'

const AvailabilitySwitch = (props: AvailabilitySwitchProps) => {
	const { label, isChecked, onPress, isDisabled } = props

	return (
		<HStack justifyContent='space-between' py='3' bg='white'>
			<Text fontSize='lg' fontWeight='semibold' color='primary.600'>
				{label}
			</Text>

			<Switch isChecked={isChecked} isDisabled={isDisabled} onPress={onPress} />
		</HStack>
	)
}

interface AvailabilitySwitchProps {
	label: string
	isChecked: boolean
	onPress: () => void
	isDisabled?: boolean
}

export default function HomeScreen({
	navigation,
}: HomeStackScreenProps<'Home'>) {
	useCall()

	const { t } = useTranslation('home')
	const { myUser } = useMyUser()

	const { data, refetch, loading } = useTypedQuery(
		{
			serviceCategories: [{}, { id: true }],
			interpreters: [
				{
					orderBy: $('orderBy', '[InterpreterOrderByInput!]'),
				},
				{
					id: true,
					user: { id: true, fullName: true, image: true },
					languages: true,
					isFavorite: true,
					isBusy: true,
					rating: true,
					online: true,
				},
			],
		},
		{
			operationOptions: { operationName: 'HomeInterpreters' },
			apolloOptions: {
				fetchPolicy: 'cache-and-network',
				variables: {
					orderBy: [{ online: 'desc' }],
				},
			},
		},
	)

	const {
		data: availabilityData,
		loading: availabilityLoading,
		refetch: availabilityRefetch,
	} = useTypedQuery(
		{
			myAvailability: true,
		},
		{
			apolloOptions: {
				skip: myUser?.role !== 'INTERPRETER',
			},
		},
	)

	const [toggleAvailability, { loading: toggleAvailabilityLoading }] =
		useTypedMutation(
			{ toggleInterpreterAvailability: true },
			{
				apolloOptions: {
					onCompleted: () => {
						refetch()
						availabilityRefetch()
					},
				},
			},
		)

	return (
		<Box flex={1}>
			<ScrollView
				p='8'
				pb='32'
				position='relative'
				refreshing={loading}
				onRefresh={refetch}
			>
				<VStack space='md'>
					{myUser?.role === 'INTERPRETER' && (
						<AvailabilitySwitch
							label={t('toggle-availability')}
							isChecked={availabilityData?.myAvailability}
							isDisabled={toggleAvailabilityLoading || availabilityLoading}
							onPress={() => toggleAvailability()}
						/>
					)}

					<Section label={t('meet-the-interpreters')} space='lg'>
						{data?.interpreters.map(interpreter => (
							<UserCard
								key={interpreter.id}
								id={interpreter.id}
								userId={interpreter.user.id}
								fullName={interpreter.user.fullName}
								image={interpreter.user.image}
								languages={interpreter.languages}
								rating={interpreter.rating}
								isFavorite={interpreter.isFavorite}
								isOnline={interpreter.online}
								isBusy={interpreter.isBusy}
								isInterpreter
								onPress={() =>
									navigation.navigate('InterpreterStack', {
										screen: 'Interpreter',
										params: { id: interpreter.id },
									})
								}
							/>
						))}
					</Section>
				</VStack>
			</ScrollView>

			<BottomNavigation activeScreen='Home' />
		</Box>
	)
}

export interface HomeScreenParams {}
