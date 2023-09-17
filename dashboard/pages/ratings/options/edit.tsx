import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import Loading from '@/components/layout/Loading'
import Modal from '@/components/layout/Modal'
import NumberInput from '@/components/form/NumberInput'
import PageHeader from '@/components/layout/PageHeader'
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
			interpreterRatingOption: [
				{ where: $('where', 'InterpreterRatingOptionWhereUniqueInput!') },
				{
					titleEn: true,
					titleAr: true,
					ratingVisibleFrom: true,
					ratingVisibleTo: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateInterpreterRatingOption, { loading: createLoading }] =
		useTypedMutation(
			{
				updateInterpreterRatingOption: [
					{
						data: $('data', 'InterpreterRatingOptionUpdateInput!'),
						where: $('where', 'InterpreterRatingOptionWhereUniqueInput!'),
					},
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						toast.success('Ratings Option has been updated')
						allowNavigation()
						refetch()
					},
				},
			},
		)

	const [deleteInterpreterRatingOption, { loading: deleteLoading }] =
		useTypedMutation(
			{
				deleteInterpreterRatingOption: [
					{ where: $('where', 'InterpreterRatingOptionWhereUniqueInput!') },
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						toast.success('Ratings Option has been deleted')
						setShowDeleteModal(false)
						allowNavigation()
						router.push('/services/categories')
					},
				},
			},
		)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['InterpreterRatingOptionUpdateInput']
	>({
		initialValues: {
			titleAr: '',
			titleEn: '',
			ratingVisibleFrom: 0,
			ratingVisibleTo: 0,
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.interpreterRatingOption) return

		setValues(data.interpreterRatingOption)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Ratings Option - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Ratings Option' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data =>
							updateInterpreterRatingOption({
								variables: { data, where: { id } },
							}),
						)}
					>
						<TextInput
							disabled={mutationsLoading}
							label='Title En'
							required
							{...getInputProps('titleEn')}
						/>

						<TextInput
							disabled={mutationsLoading}
							label='Title Ar'
							required
							{...getInputProps('titleAr')}
						/>

						<NumberInput
							disabled={mutationsLoading}
							label='Visible From'
							required
							{...getInputProps('ratingVisibleFrom')}
						/>

						<NumberInput
							disabled={mutationsLoading}
							label='Visible To'
							required
							{...getInputProps('ratingVisibleTo')}
						/>

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
								title='Delete InterpreterRatingOption?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this servicecategory?
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
												deleteInterpreterRatingOption({
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
