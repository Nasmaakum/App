import { $, GraphQLTypes, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import ImageInput from '@/components/form/ImageInput'
import PageHeader from '@/components/layout/PageHeader'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createServiceCategory, { loading }] = useTypedMutation(
		{
			createServiceCategory: [
				{ data: $('data', 'ServiceCategoryCreateInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ createServiceCategory: { id } }) => {
					toast.success('Service Category has been created')
					allowNavigation()
					router.replace(`/services/categories/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['ServiceCategoryCreateInput']
	>({
		initialValues: {
			image: '',
			titleEn: '',
			titleAr: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create Service Category - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create Service Category' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data =>
						createServiceCategory({ variables: { data } }),
					)}
				>
					<div className='flex gap-4'>
						<ImageInput
							label='Image'
							variant='square'
							disabled={loading}
							required
							{...getInputProps('image')}
						/>

						<div className='flex flex-1 flex-col gap-4'>
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
						</div>
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
