import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import languages from '@/constants/languages.json'
import Loading from '@/components/layout/Loading'
import MultiSelect from '@/components/form/MultiSelect'
import PageHeader from '@/components/layout/PageHeader'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()
	const { id = '' } = router.query

	const {
		data,
		loading: dataLoading,
		refetch,
	} = useTypedQuery(
		{
			interpreter: [
				{ where: $('where', 'InterpreterWhereUniqueInput!') },
				{
					user: { id: true, firstName: true, lastName: true },
					languages: true,
					status: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateInterpreter, { loading: createLoading }] = useTypedMutation(
		{
			updateInterpreter: [
				{
					data: $('data', 'InterpreterUpdateInput!'),
					where: $('where', 'InterpreterWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Interpreter has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['InterpreterUpdateInput']
	>({
		initialValues: {
			languages: [],
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.interpreter) return

		setValues(data.interpreter)
	}, [dataLoading])

	const mutationsLoading = createLoading

	return (
		<>
			<Head>
				<title>Update Interpreter - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Interpreter' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(({ languages, status }) =>
							updateInterpreter({
								variables: { data: { languages, status }, where: { id } },
							}),
						)}
					>
						<div className='flex gap-4'>
							<TextInput
								label='First Name'
								value={data?.interpreter.user?.firstName}
								disabled
							/>

							<TextInput
								label='last Name'
								value={data?.interpreter.user?.lastName}
								disabled
							/>
						</div>

						<Select
							disabled={mutationsLoading}
							label='Status'
							options={[
								{ label: 'Pending', value: 'PENDING' },
								{ label: 'Approved', value: 'APPROVED' },
								{ label: 'Rejected', value: 'REJECTED' },
							]}
							required
							{...getInputProps('status')}
						/>

						<MultiSelect
							label='Languages'
							options={languages.map(lang => ({
								label: lang.name,
								value: lang.name,
							}))}
							disabled={mutationsLoading}
							{...getInputProps('languages')}
						/>

						<div className='mt-4 flex justify-end gap-4'>
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
