import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import ImageInput from '@/components/form/ImageInput'
import Loading from '@/components/layout/Loading'
import PageHeader from '@/components/layout/PageHeader'
import PhoneNumberInput from '@/components/form/PhoneNumberInput'
import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import TextInput from '@/components/form/TextInput'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const { data, loading: dataLoading } = useTypedQuery({
		serviceCategories: [
			{ take: 10000 },
			{
				id: true,
				title: true,
			},
		],
	})

	const [createService, { loading }] = useTypedMutation(
		{
			createService: [{ data: $('data', 'ServiceCreateInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: ({ createService: { id } }) => {
					toast.success('Service  has been created')
					allowNavigation()
					router.replace(`/services/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['ServiceCreateInput']
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

	return (
		<>
			<Head>
				<title>Create Service - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create Service' />

				<Loading loading={dataLoading}>
					<form
						className='flex flex-1 flex-col gap-4'
						onSubmit={onSubmit(data => createService({ variables: { data } }))}
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
								<div className='flex gap-4'>
									<TextInput
										disabled={loading}
										label='Name En'
										required
										{...getInputProps('nameEn')}
									/>

									<TextInput
										disabled={loading}
										label='Name Ar'
										required
										{...getInputProps('nameAr')}
									/>
								</div>

								<TextArea
									disabled={loading}
									label='Description En'
									required
									{...getInputProps('descriptionEn')}
								/>

								<TextArea
									disabled={loading}
									label='Description Ar'
									required
									{...getInputProps('descriptionAr')}
								/>

								<Select
									disabled={loading}
									label='Category'
									options={data?.serviceCategories.map(({ id, title }) => ({
										label: title,
										value: id,
									}))}
									required
									{...getInputProps('categoryId')}
								/>

								<PhoneNumberInput
									disabled={loading}
									label='Phone'
									required
									{...getInputProps('phone')}
								/>
							</div>
						</div>

						<div className='mt-4 flex justify-end'>
							<Button loading={loading} type='submit'>
								Create
							</Button>
						</div>
					</form>
				</Loading>
			</main>
		</>
	)
}
