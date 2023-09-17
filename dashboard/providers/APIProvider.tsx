import {
	ApolloClient,
	ApolloLink,
	ApolloProvider,
	from,
	InMemoryCache,
} from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { toast } from 'react-toastify'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import React from 'react'

export default function APIProvider(props: APIProviderProps) {
	const { children } = props

	const { token, logout } = useAuth()
	const router = useRouter()

	const API_URL = process.env.API_URL
	if (!API_URL) throw new Error('The API_URL environment variable must be set')

	const httpLink = createUploadLink({ uri: API_URL }) as unknown as ApolloLink

	const errorLink = onError(({ graphQLErrors }) => {
		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, extensions }) => {
				if (message.includes('Context creation failed')) {
					logout()

					router.push(`/login/?return=${router.pathname}`)

					toast.error('Your session has expired. Please login again.')
				} else {
					const error =
						(extensions as { cause?: string })?.cause ||
						message ||
						'Server Error'

					const ignoredErrors = ['Authorization token is required']
					if (ignoredErrors.includes(error)) return

					toast.error(error)
				}
			})
		}
	})

	const authLink = setContext((_, { headers }) => {
		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : '',
			},
		}
	})

	const client = new ApolloClient({
		cache: new InMemoryCache({ addTypename: false }),
		link: from([errorLink, authLink.concat(httpLink)]),
	})

	return <ApolloProvider client={client}>{children}</ApolloProvider>
}

interface APIProviderProps {
	children: React.ReactNode
}
