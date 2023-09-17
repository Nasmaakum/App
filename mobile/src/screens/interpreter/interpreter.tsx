import { $, useTypedMutation, useTypedQuery } from '../../api'
import { InterpreterStackScreenProps } from '../../navigation/types'
import { Section } from '../../components/layout/Section'
import { UserCard } from '../../components/UserCard'
import { useToast, VStack } from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../components/form/Button'
import React from 'react'

export default function InterpreterScreen({
	navigation,
	route: { params },
}: InterpreterStackScreenProps<'Interpreter'>) {
	const { id } = params

	const toast = useToast()

	const { t } = useTranslation('interpreter')

	const { data, loading } = useTypedQuery(
		{
			interpreter: [
				{ where: $('where', 'InterpreterWhereUniqueInput!') },
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
			operationOptions: {
				operationName: 'Interpreter',
			},
			apolloOptions: {
				fetchPolicy: 'network-only',
				variables: { where: { id } },
			},
		},
	)

	const [startCall, { loading: startCallLoading }] = useTypedMutation(
		{
			startCall: [
				{ where: $('where', 'StartCallWhereInput!') },
				{ id: true, token: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ startCall }) => {
					navigation.navigate('Calling', {
						id: startCall.id,
						name: data.interpreter.user.fullName,
						image: data.interpreter.user.image,
					})
				},
				onError: ({ message }) => {
					if (message.includes('Interpreter is busy'))
						toast.show({ description: t('interpreter-is-busy') })
					else toast.show({ description: t('network-request-failed') })
				},
			},
		},
	)

	const handleCall = async () => {
		startCall({ variables: { where: { id } } })
	}

	if (loading) return null

	return (
		<Section
			containerProps={{ flex: 1, p: 8 }}
			label={t('interpreter')}
			textAlign='center'
			space='2xl'
		>
			<UserCard
				id={data.interpreter.id}
				userId={data.interpreter.user.id}
				image={data.interpreter.user.image}
				fullName={data.interpreter.user.fullName}
				languages={data.interpreter.languages}
				rating={data.interpreter.rating}
				isFavorite={data.interpreter.isFavorite}
				isBusy={data.interpreter.isBusy}
				isOnline={data.interpreter.online}
				isInterpreter
			/>

			<VStack space='sm'>
				<Button
					icon='VideoSolid'
					isDisabled={!data.interpreter.online || data.interpreter.isBusy}
					isLoading={startCallLoading}
					onPress={() => handleCall()}
				>
					{t('video-call')}
				</Button>

				<Button
					icon='PhoneSolid'
					isLoading={startCallLoading}
					isDisabled={
						true || !data.interpreter.online || data.interpreter.isBusy
					}
				>
					{t('audio-call')}
				</Button>
			</VStack>
		</Section>
	)
}

export type InterpreterScreenParams = {
	id: string
}
