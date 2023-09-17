import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import ImageInput from '@/components/form/ImageInput'
import Loading from '@/components/layout/Loading'
import Modal from '@/components/layout/Modal'
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
			serviceCategory: [
				{ where: $('where', 'ServiceCategoryWhereUniqueInput!') },
				{
					titleEn: true,
					titleAr: true,
					image: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateServiceCategory, { loading: createLoading }] = useTypedMutation(
		{
			updateServiceCategory: [
				{
					data: $('data', 'ServiceCategoryUpdateInput!'),
					where: $('where', 'ServiceCategoryWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Service Category has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const [deleteServiceCategory, { loading: deleteLoading }] = useTypedMutation(
		{
			deleteServiceCategory: [
				{ where: $('where', 'ServiceCategoryWhereUniqueInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Service Category has been deleted')
					setShowDeleteModal(false)
					allowNavigation()
					router.push('/services/categories')
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['ServiceCategoryUpdateInput'] & {
			passwordConfirmation?: string
		}
	>({
		initialValues: {
			titleAr: '',
			titleEn: '',
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.serviceCategory) return

		setValues(data.serviceCategory)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Service Category - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Service Category' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data =>
							updateServiceCategory({
								variables: { data, where: { id } },
							}),
						)}
					>
						<div className='flex gap-4'>
							<ImageInput
								label='Image'
								variant='square'
								disabled={mutationsLoading}
								required
								{...getInputProps('image')}
							/>

							<div className='flex flex-1 flex-col gap-4'>
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
							</div>
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
								title='Delete ServiceCategory?'
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
												deleteServiceCategory({ variables: { where: { id } } })
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
