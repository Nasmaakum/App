import { $, GraphQLTypes, useTypedMutation } from 'api'
import { validate as isEmailValid } from 'email-validator'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import PageHeader from '@/components/layout/PageHeader'
import PhoneNumberInput from '@/components/form/PhoneNumberInput'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createUser, { loading }] = useTypedMutation(
		{
			createUser: [{ data: $('data', 'UserCreateInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: ({ createUser: { id } }) => {
					toast.success('User has been created')
					allowNavigation()
					router.replace(`/users/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['UserCreateInput'] & {
			passwordConfirmation: string
		}
	>({
		initialValues: {
			dateOfBirth: new Date(),
			email: '',
			firstName: '',
			lastName: '',
			mobile: '',
			password: '',
			passwordConfirmation: '',
			role: 'USER' as GraphQLTypes['UserRole'],
			city: '',
			country: '',
			cpr: '',
			gender: 'MALE' as GraphQLTypes['Gender'],
			language: 'Arabic',
		},
		validate: {
			email: value => (!isEmailValid(value) ? 'Email is not valid' : null),
			password: value =>
				value.length < 6 ? 'Password must be at least 6 characters' : null,
			passwordConfirmation: (value, { password }) =>
				value !== password ? 'Passwords do not match' : null,
		},
	})

	return (
		<>
			<Head>
				<title>Create User - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create User' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(({ passwordConfirmation, dateOfBirth, ...data }) =>
						createUser({
							variables: {
								data: {
									...data,
									dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
								},
							},
						}),
					)}
				>
					<div className='flex gap-4'>
						<TextInput
							disabled={loading}
							label='First Name'
							required
							{...getInputProps('firstName')}
						/>

						<TextInput
							disabled={loading}
							label='last Name'
							required
							{...getInputProps('lastName')}
						/>
					</div>

					<PhoneNumberInput
						disabled={loading}
						label='Mobile'
						required
						{...getInputProps('mobile')}
					/>

					<TextInput
						disabled={loading}
						label='Date of birth'
						type='date'
						{...getInputProps('dateOfBirth')}
					/>

					<TextInput
						disabled={loading}
						label='Email'
						type='email'
						required
						{...getInputProps('email')}
					/>

					<Select
						disabled={loading}
						label='Role'
						options={[
							{ label: 'User', value: 'USER' },
							{ label: 'Interpreter', value: 'INTERPRETER' },
							{ label: 'Admin', value: 'ADMIN' },
						]}
						required
						{...getInputProps('role')}
					/>

					<div className='flex gap-4'>
						<TextInput
							autoComplete='new-password'
							disabled={loading}
							label='Password'
							type='password'
							required
							{...getInputProps('password')}
						/>

						<TextInput
							disabled={loading}
							label='Confirm Password'
							type='password'
							required
							{...getInputProps('passwordConfirmation')}
						/>
					</div>

					<div className='mt-4 flex justify-end'>
						<Button loading={loading} type='submit'>
							Create
						</Button>
					</div>
				</form>
			</main>
		</>
	)
}
