import { $, GraphQLTypes, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import NumberInput from '@/components/form/NumberInput'
import PageHeader from '@/components/layout/PageHeader'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createInterpreterRatingOption, { loading }] = useTypedMutation(
		{
			createInterpreterRatingOption: [
				{ data: $('data', 'InterpreterRatingOptionCreateInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ createInterpreterRatingOption: { id } }) => {
					toast.success('Rating Option has been created')
					allowNavigation()
					router.replace(`/services/categories/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['InterpreterRatingOptionCreateInput']
	>({
		initialValues: {
			ratingVisibleFrom: 0,
			ratingVisibleTo: 0,
			titleEn: '',
			titleAr: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create Rating Option - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create Rating Option' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data =>
						createInterpreterRatingOption({ variables: { data } }),
					)}
				>
					<TextInput
						disabled={loading}
						label='Title En'
						required
						{...getInputProps('titleEn')}
					/>

					<TextInput
						disabled={loading}
						label='Title Ar'
						required
						{...getInputProps('titleAr')}
					/>

					<NumberInput
						disabled={loading}
						label='Visible From'
						required
						{...getInputProps('ratingVisibleFrom')}
					/>

					<NumberInput
						disabled={loading}
						label='Visible To'
						required
						{...getInputProps('ratingVisibleTo')}
					/>

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
