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
			termsOfUse: [
				{ where: $('where', 'TermsOfUseWhereUniqueInput!') },
				{
					version: true,
					contentEn: true,
					contentAr: true,
				},
			],
		},
		{
			apolloOptions: { variables: { where: { id } } },
		},
	)

	const [updateTermsOfUse, { loading: createLoading }] = useTypedMutation(
		{
			updateTermsOfUse: [
				{
					data: $('data', 'TermsOfUseUpdateInput!'),
					where: $('where', 'TermsOfUseWhereUniqueInput!'),
				},
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('TermsOfUse has been updated')
					allowNavigation()
					refetch()
				},
			},
		},
	)

	const [deleteTermsOfUse, { loading: deleteLoading }] = useTypedMutation(
		{
			deleteTermsOfUse: [
				{ where: $('where', 'TermsOfUseWhereUniqueInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: () => {
					toast.success('TermsOfUse has been deleted')
					setShowDeleteModal(false)
					allowNavigation()
					router.push('/admin/termsofuses')
				},
			},
		},
	)

	const { onSubmit, getInputProps, setValues, allowNavigation } = useForm<
		GraphQLTypes['TermsOfUseUpdateInput']
	>({
		initialValues: {
			contentAr: '',
			contentEn: '',
		},
	})

	useEffect(() => {
		if (dataLoading || !data?.termsOfUse) return

		setValues(data.termsOfUse)
	}, [dataLoading])

	const mutationsLoading = createLoading || deleteLoading

	return (
		<>
			<Head>
				<title>Update Terms of Use - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Update Terms of Use' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(({ contentAr, contentEn }) =>
							updateTermsOfUse({
								variables: { data: { contentAr, contentEn }, where: { id } },
							}),
						)}
					>
						<TextInput
							label='Version'
							value={`${data?.termsOfUse?.version}.0`}
							disabled
							required
						/>

						<TextArea
							disabled={mutationsLoading}
							label='Content En'
							required
							{...getInputProps('contentEn')}
						/>

						<TextArea
							disabled={mutationsLoading}
							label='Content Ar'
							required
							{...getInputProps('contentAr')}
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
								title='Delete TermsOfUse?'
								onClose={() => setShowDeleteModal(false)}
							>
								<div className='flex flex-col gap-8'>
									<span>
										This action cannot be undone. Are you sure you want to
										delete this terms of use?
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
												deleteTermsOfUse({ variables: { where: { id } } })
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
