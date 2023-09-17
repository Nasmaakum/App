import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Checkbox from '@/components/form/Checkbox'
import Head from 'next/head'
import ImageInput from '@/components/form/ImageInput'
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
			advertisement: [
				{ where: $('where', 'AdvertisementWhereUniqueInput!') },
				{
					image: true,
					titleEn: true,
					titleAr: true,
					contentEn: true,
					contentAr: true,
					url: true,
					duration: true,
					active: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateAdvertisement, { loading: createLoading }] = useTypedMutation(
		{
			updateAdvertisement: [
				{
					data: $('data', 'AdvertisementUpdateInput!'),
					where: $('where', 'AdvertisementWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Advertisement has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const [deleteAdvertisement, { loading: deleteLoading }] = useTypedMutation(
		{
			deleteAdvertisement: [
				{ where: $('where', 'AdvertisementWhereUniqueInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Advertisement has been deleted')
					setShowDeleteModal(false)
					allowNavigation()
					router.push('/admin/advertisements')
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['AdvertisementUpdateInput']
	>({
		initialValues: {
			contentAr: '',
			contentEn: '',
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.advertisement) return

		setValues(data.advertisement)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Advertisement - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Advertisement' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data =>
							updateAdvertisement({ variables: { data, where: { id } } }),
						)}
					>
						<div className='flex gap-4'>
							<ImageInput
								label='Image'
								variant='rectangle'
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

								<TextInput
									disabled={mutationsLoading}
									label='Content En'
									required
									{...getInputProps('contentEn')}
								/>

								<TextInput
									disabled={mutationsLoading}
									label='Content Ar'
									required
									{...getInputProps('contentAr')}
								/>

								<TextInput
									disabled={mutationsLoading}
									label='URL'
									required
									{...getInputProps('url')}
								/>

								<NumberInput
									disabled={mutationsLoading}
									label='Duration (seconds)'
									required
									{...getInputProps('duration')}
								/>

								<Checkbox
									disabled={mutationsLoading}
									label='Active'
									{...getInputProps('active')}
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
								title='Delete Advertisement?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this advertisement?
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
												deleteAdvertisement({ variables: { where: { id } } })
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
