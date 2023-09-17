import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { validate as isEmailValid } from 'email-validator'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import Loading from '@/components/layout/Loading'
import Modal from '@/components/layout/Modal'
import PageHeader from '@/components/layout/PageHeader'
import PhoneNumberInput from '@/components/form/PhoneNumberInput'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()
	const { id = '' } = router.query

	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const {
		data,
		loading: dataLoading,
		refetch,
	} = useTypedQuery(
		{
			user: [
				{ where: $('where', 'UserWhereUniqueInput!') },
				{
					dateOfBirth: true,
					email: true,
					firstName: true,
					lastName: true,
					mobile: true,
					role: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateUser, { loading: createLoading }] = useTypedMutation(
		{
			updateUser: [
				{
					data: $('data', 'UserUpdateInput!'),
					where: $('where', 'UserWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('User has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const [deleteUser, { loading: deleteLoading }] = useTypedMutation(
		{
			deleteUser: [
				{ where: $('where', 'UserWhereUniqueInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('User has been deleted')
					setShowDeleteModal(false)
					allowNavigation()
					router.push('/users')
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, values, allowNavigation } =
		useForm<
			GraphQLTypes['UserUpdateInput'] & {
				passwordConfirmation?: string
			}
		>({
			initialValues: {
				email: '',
				firstName: '',
				lastName: '',
				password: '',
				passwordConfirmation: '',
			},
			validate: {
				email: value =>
					value ? (!isEmailValid(value) ? 'Email is not valid' : null) : null,
				password: value =>
					value
						? value.length < 6
							? 'Password must be at least 6 characters'
							: null
						: null,
				passwordConfirmation: (value, { password }) =>
					password
						? value !== password
							? 'Passwords do not match'
							: null
						: null,
			},
		})

	useEffect(() => {
		if (dataLoading || !data?.user) return

		setValues(data.user)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update User - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update User' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(
							({ passwordConfirmation, password, dateOfBirth, ...data }) =>
								updateUser({
									variables: {
										data: {
											...data,
											dateOfBirth: dateOfBirth
												? new Date(dateOfBirth)
												: undefined,
											password: password || undefined,
										},
										where: { id },
									},
								}),
						)}
					>
						<div className='flex gap-4'>
							<TextInput
								disabled={mutationsLoading}
								label='First Name'
								required
								{...getInputProps('firstName')}
							/>

							<TextInput
								disabled={mutationsLoading}
								label='last Name'
								required
								{...getInputProps('lastName')}
							/>
						</div>

						<PhoneNumberInput
							disabled={mutationsLoading}
							label='Mobile'
							required
							{...getInputProps('mobile')}
						/>

						<TextInput
							disabled={mutationsLoading}
							label='Date of birth'
							type='date'
							{...getInputProps('dateOfBirth')}
						/>

						<TextInput
							disabled={mutationsLoading}
							label='Email'
							type='email'
							required
							{...getInputProps('email')}
						/>

						<Select
							disabled={mutationsLoading}
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
								disabled={mutationsLoading}
								label={
									values.password
										? 'Password'
										: 'Password (Empty for no change)'
								}
								type='password'
								{...getInputProps('password')}
							/>

							{!!values.password && (
								<TextInput
									disabled={mutationsLoading}
									label='Confirm Password'
									type='password'
									required
									{...getInputProps('passwordConfirmation')}
								/>
							)}
						</div>

						<div className='mt-4 flex justify-end gap-4'>
							<Modal
								button={
									<Button
										color='red'
										loading={mutationsLoading}
										type='button'
										onClick={() => setShowDeleteModal(true)}
									>
										Delete
									</Button>
								}
								isOpen={showDeleteModal}
								title='Delete User?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this user?
									</span>

									<div className='flex gap-4'>
										<Button
											className='flex-1'
											loading={mutationsLoading}
											type='button'
											onClick={() => setShowDeleteModal(false)}
										>
											Cancel
										</Button>

										<Button
											className='flex-1'
											color='red'
											loading={mutationsLoading}
											type='button'
											onClick={() =>
												deleteUser({ variables: { where: { id } } })
											}
										>
											Delete
										</Button>
									</div>
								</div>
							</Modal>

							<Button loading={mutationsLoading} type='submit'>
								Update
							</Button>
						</div>
					</form>
				</Loading>
			</main>
		</>
	)
}
