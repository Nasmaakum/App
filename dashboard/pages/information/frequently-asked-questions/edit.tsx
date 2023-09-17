import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import Loading from '@/components/layout/Loading'
import Modal from '@/components/layout/Modal'
import PageHeader from '@/components/layout/PageHeader'
import TextArea from '@/components/form/TextArea'
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
			frequentlyAskedQuestion: [
				{ where: $('where', 'FrequentlyAskedQuestionWhereUniqueInput!') },
				{
					questionEn: true,
					questionAr: true,
					answerEn: true,
					answerAr: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateFrequentlyAskedQuestion, { loading: createLoading }] =
		useTypedMutation(
			{
				updateFrequentlyAskedQuestion: [
					{
						data: $('data', 'FrequentlyAskedQuestionUpdateInput!'),
						where: $('where', 'FrequentlyAskedQuestionWhereUniqueInput!'),
					},
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						toast.success('Frequently Asked Question has been updated')
						allowNavigation()
						refetch()
					},
				},
			},
		)

	const [deleteFrequentlyAskedQuestion, { loading: deleteLoading }] =
		useTypedMutation(
			{
				deleteFrequentlyAskedQuestion: [
					{ where: $('where', 'FrequentlyAskedQuestionWhereUniqueInput!') },
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						toast.success('Frequently Asked Question has been deleted')
						setShowDeleteModal(false)
						allowNavigation()
						router.push('/admin/frequently-asked-questions')
					},
				},
			},
		)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['FrequentlyAskedQuestionUpdateInput']
	>({
		initialValues: {
			answerAr: '',
			answerEn: '',
			questionAr: '',
			questionEn: '',
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.frequentlyAskedQuestion) return

		setValues(data.frequentlyAskedQuestion)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Frequently Asked Question - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Frequently Asked Question' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data =>
							updateFrequentlyAskedQuestion({
								variables: { data, where: { id } },
							}),
						)}
					>
						<div className='flex gap-4'>
							<TextInput
								disabled={mutationsLoading}
								label='Question En'
								required
								{...getInputProps('questionEn')}
							/>

							<TextInput
								disabled={mutationsLoading}
								label='Question Ar'
								required
								{...getInputProps('questionAr')}
							/>
						</div>

						<div className='flex gap-4'>
							<TextArea
								disabled={mutationsLoading}
								label='Answer En'
								required
								{...getInputProps('answerEn')}
							/>

							<TextArea
								disabled={mutationsLoading}
								label='Answer Ar'
								required
								{...getInputProps('answerAr')}
							/>
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
								title='Delete FrequentlyAskedQuestion?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this frequentlyaskedquestion?
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
												deleteFrequentlyAskedQuestion({
													variables: { where: { id } },
												})
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
