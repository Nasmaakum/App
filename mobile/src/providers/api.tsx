import { Alert, HStack, Slide, Text } from 'native-base'
import {
	ApolloClient,
	ApolloLink,
	ApolloProvider,
	from,
	InMemoryCache,
} from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { I18nManager } from 'react-native'
import { onError } from '@apollo/client/link/error'
import { ReactNode, useEffect, useState } from 'react'
import { setContext } from '@apollo/client/link/context'
import { useAuth } from '../contexts/auth'
import { useTranslation } from 'react-i18next'
import env from '../constants/env'
import Icon from '../components/Icon'
import MergeFetchMore from '../functions/merge-fetch-more'

export function useApolloClient() {
	const { token, logout } = useAuth()
	const { t } = useTranslation('common')

	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (error) {
			setTimeout(() => {
				setError(null)
			}, 3000)
		}
	}, [error])

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		// eslint-disable-next-line no-console
		console.error(JSON.stringify({ graphQLErrors, networkError }, null, 2))

		if (graphQLErrors)
			graphQLErrors.forEach(async ({ message }) => {
				if (
					message.includes('Invalid token provided') ||
					message.includes('Context creation failed')
				) {
					setError(t('please-login-again'))
					await logout()
				}
			})
	})

	const authLink = setContext((_, { headers }) => ({
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
			language: I18nManager.isRTL ? 'ar' : 'en',
		},
	}))

	const httpLink = authLink.concat(
		createUploadLink({
			uri: env.API_URL,
		}) as unknown as ApolloLink,
	)

	const cache = new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					interpreters: MergeFetchMore(),
					notifications: MergeFetchMore(),
					frequentlyAskedQuestions: MergeFetchMore(),
					services: MergeFetchMore(),
					serviceCategories: MergeFetchMore(),
				},
			},
		},
	})

	const client = new ApolloClient({
		link: from([errorLink, httpLink]),
		cache,
		defaultOptions: { mutate: { fetchPolicy: 'no-cache' } },
	})

	return { client, error }
}

export default function APIProvider(props: Props) {
	const { children } = props

	const { client, error } = useApolloClient()

	return (
		<ApolloProvider client={client}>
			<Slide in={!!error} placement='top'>
				<Alert status='error'>
					<HStack alignItems='center' space='2' pt='5'>
						<Icon
							name='TriangleExclamationSolid'
							color='danger.600'
							size='sm'
						/>

						<Text color='error.600' fontWeight='medium'>
							{error}
						</Text>
					</HStack>
				</Alert>
			</Slide>

			{children}
		</ApolloProvider>
	)
}

type Props = {
	children: ReactNode
}
