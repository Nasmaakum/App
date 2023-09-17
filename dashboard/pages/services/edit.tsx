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
import PhoneNumberInput from '@/components/form/PhoneNumberInput'
import Select from '@/components/form/Select'
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
			service: [
				{ where: $('where', 'ServiceWhereUniqueInput!') },
				{
					nameAr: true,
					nameEn: true,
					image: true,
					phone: true,
					descriptionAr: true,
					descriptionEn: true,
					category: {
						id: true,
					},
				},
			],
			serviceCategories: [
				{ take: 10000 },
				{
					id: true,
					title: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateService, { loading: createLoading }] = useTypedMutation(
		{
			updateService: [
				{
					data: $('data', 'ServiceUpdateInput!'),
					where: $('where', 'ServiceWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Service  has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const [deleteService, { loading: deleteLoading }] = useTypedMutation(
		{
			deleteService: [
				{ where: $('where', 'ServiceWhereUniqueInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('Service has been deleted')
					setShowDeleteModal(false)
					allowNavigation()
					router.push('/services')
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['ServiceUpdateInput'] & {
			passwordConfirmation?: string
		}
	>({
		initialValues: {
			image: '',
			nameEn: '',
			nameAr: '',
			phone: '',
			categoryId: '',
			descriptionEn: '',
			descriptionAr: '',
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.service) return

		setValues({
			image: data.service.image,
			nameEn: data.service.nameEn,
			nameAr: data.service.nameAr,
			phone: data.service.phone,
			categoryId: data.service.category?.id,
			descriptionEn: data.service.descriptionEn,
			descriptionAr: data.service.descriptionAr,
		})
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Service - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Service ' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data =>
							updateService({
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
								<div className='flex gap-4'>
									<TextInput
										disabled={mutationsLoading}
										label='Name En'
										required
										{...getInputProps('nameEn')}
									/>

									<TextInput
										disabled={mutationsLoading}
										label='Name Ar'
										required
										{...getInputProps('nameAr')}
									/>
								</div>

								<TextArea
									disabled={mutationsLoading}
									label='Description En'
									required
									{...getInputProps('descriptionEn')}
								/>

								<TextArea
									disabled={mutationsLoading}
									label='Description Ar'
									required
									{...getInputProps('descriptionAr')}
								/>

								<Select
									disabled={mutationsLoading}
									label='Category'
									options={data?.serviceCategories.map(({ id, title }) => ({
										label: title,
										value: id,
									}))}
									required
									{...getInputProps('categoryId')}
								/>

								<PhoneNumberInput
									disabled={mutationsLoading}
									label='Phone'
									required
									{...getInputProps('phone')}
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
								title='Delete Service?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this service?
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
												deleteService({ variables: { where: { id } } })
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
