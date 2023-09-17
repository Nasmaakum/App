import { $, GraphQLTypes, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Checkbox from '@/components/form/Checkbox'
import Head from 'next/head'
import ImageInput from '@/components/form/ImageInput'
import NumberInput from '@/components/form/NumberInput'
import PageHeader from '@/components/layout/PageHeader'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createAdvertisement, { loading }] = useTypedMutation(
		{
			createAdvertisement: [
				{ data: $('data', 'AdvertisementCreateInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ createAdvertisement: { id } }) => {
					toast.success('Advertisement has been created')
					allowNavigation()
					router.replace(`/admin/advertisements/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['AdvertisementCreateInput']
	>({
		initialValues: {
			active: true,
			duration: 0,
			image: '',
			titleEn: '',
			titleAr: '',
			contentEn: '',
			contentAr: '',
			url: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create Advertisement - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create Advertisement' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data =>
						createAdvertisement({ variables: { data } }),
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

							<TextInput
								disabled={loading}
								label='Content En'
								required
								{...getInputProps('contentEn')}
							/>

							<TextInput
								disabled={loading}
								label='Content Ar'
								required
								{...getInputProps('contentAr')}
							/>

							<TextInput
								disabled={loading}
								label='URL'
								required
								{...getInputProps('url')}
							/>

							<NumberInput
								disabled={loading}
								label='Duration (seconds)'
								required
								{...getInputProps('duration')}
							/>

							<Checkbox
								disabled={loading}
								label='Active'
								{...getInputProps('active')}
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
