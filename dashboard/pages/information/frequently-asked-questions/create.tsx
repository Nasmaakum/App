import { $, GraphQLTypes, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import PageHeader from '@/components/layout/PageHeader'
import TextArea from '@/components/form/TextArea'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createFrequentlyAskedQuestion, { loading }] = useTypedMutation(
		{
			createFrequentlyAskedQuestion: [
				{ data: $('data', 'FrequentlyAskedQuestionCreateInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ createFrequentlyAskedQuestion: { id } }) => {
					toast.success('FrequentlyAskedQuestion has been created')
					allowNavigation()
					router.replace(`/admin/frequently-asked-questions/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['FrequentlyAskedQuestionCreateInput']
	>({
		initialValues: {
			answerEn: '',
			questionEn: '',
			answerAr: '',
			questionAr: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create FrequentlyAskedQuestion - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create FrequentlyAskedQuestion' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data =>
						createFrequentlyAskedQuestion({ variables: { data } }),
					)}
				>
					<div className='flex gap-4'>
						<TextInput
							disabled={loading}
							label='Question En'
							required
							{...getInputProps('questionEn')}
						/>

						<TextInput
							disabled={loading}
							label='Question Ar'
							required
							{...getInputProps('questionAr')}
						/>
					</div>

					<div className='flex gap-4'>
						<TextArea
							disabled={loading}
							label='Answer En'
							required
							{...getInputProps('answerEn')}
						/>

						<TextArea
							disabled={loading}
							label='Answer Ar'
							required
							{...getInputProps('answerAr')}
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
