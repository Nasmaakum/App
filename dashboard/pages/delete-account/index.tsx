import { $, useTypedLazyQuery, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import Button from '@/components/form/Button'
import TextInput from '@/components/form/TextInput'

export default function Page() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [deleteAccount, { loading: deleteAccountLoading }] = useTypedMutation(
		{
			deleteMyUser: [{ data: $('data', 'MyUserDeleteInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.error(
						'Your account has been deleted. We are sorry to see you go.',
					)
				},
				onError: () => {
					toast.error('Incorrect password.')
				},
			},
		},
	)

	const [login, { loading: loginLoading }] = useTypedLazyQuery(
		{
			login: [
				{ data: $('data', 'LoginInput!') },
				{ authentication: { token: true, user: { role: true } } },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ login }) => {
					deleteAccount({
						variables: { data: { password } },
						context: {
							headers: {
								authorization: `Bearer ${login.authentication?.token}`,
							},
						},
					})
				},
			},
		},
	)

	const isLoading = loginLoading || deleteAccountLoading

	return (
		<form
			className='flex w-full flex-col items-center justify-center gap-4'
			onSubmit={() => login({ variables: { data: { email, password } } })}
		>
			<h1>Delete Account?</h1>
			<p>Are you sure you want to delete your account?</p>

			<div className='flex w-full max-w-xl flex-col items-center justify-center gap-4'>
				<TextInput
					label='Email'
					value={email}
					disabled={isLoading}
					onChange={e => setEmail(e.target.value)}
				/>
				<TextInput
					label='Password'
					value={password}
					disabled={isLoading}
					onChange={e => setPassword(e.target.value)}
				/>

				<Button color='red' disabled={isLoading}>
					Delete Account
				</Button>
			</div>
		</form>
	)
}
