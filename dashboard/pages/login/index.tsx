import { $, GraphQLTypes, useTypedLazyQuery } from 'api'
import { toast } from 'react-toastify'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import React, { useEffect } from 'react'
import TextInput from '@/components/form/TextInput'

export default function Page() {
	const { isLoggedIn, login: loginToApp } = useAuth()
	const router = useRouter()
	const { return: returnRoute } = router.query

	useEffect(() => {
		if (!isLoggedIn) return

		router.push(returnRoute?.toString() || '/')
	}, [isLoggedIn])

	const { onSubmit, getInputProps } = useForm<GraphQLTypes['LoginInput']>({
		initialValues: { email: '', password: '' },
	})

	const [login, { loading: loginLoading }] = useTypedLazyQuery(
		{
			login: [
				{ data: $('data', 'LoginInput!') },
				{ authentication: { token: true, user: { role: true } } },
			],
		},
		{
			apolloOptions: {
				fetchPolicy: 'no-cache',
				onCompleted: ({ login }) => {
					if (login.authentication?.user.role === 'ADMIN')
						loginToApp({ token: login.authentication.token })
					else
						toast.error(
							'You do not have permission to access the dashboard. If you think this is a mistake, please contact us using the live chat.',
						)
				},
			},
		},
	)

	const loading = loginLoading

	return (
		<>
			<Head>
				<title>Login - Nasmaakum</title>
			</Head>

			<div className='flex flex-1 items-center justify-center'>
				<form
					className='flex max-w-lg flex-1 flex-col gap-2'
					onSubmit={onSubmit(data => login({ variables: { data } }))}
				>
					<TextInput
						disabled={loading}
						label='Email'
						type='email'
						required
						{...getInputProps('email')}
					/>

					<TextInput
						disabled={loading}
						label='Password'
						type='password'
						required
						{...getInputProps('password')}
					/>

					<div className='mt-4 flex justify-end'>
						<Button disabled={loading} loading={loading} type='submit'>
							Login
						</Button>
					</div>
				</form>
			</div>
		</>
	)
}
