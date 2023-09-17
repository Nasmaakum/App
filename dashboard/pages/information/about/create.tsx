import { $, GraphQLTypes, useTypedMutation } from 'api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Button from '@/components/form/Button'
import Head from 'next/head'
import PageHeader from '@/components/layout/PageHeader'
import TextArea from '@/components/form/TextArea'
import useForm from '@/hooks/useForm'

export default function Page() {
	const router = useRouter()

	const [createAbout, { loading }] = useTypedMutation(
		{
			createAbout: [{ data: $('data', 'AboutCreateInput!') }, { id: true }],
		},
		{
			apolloOptions: {
				onCompleted: ({ createAbout: { id } }) => {
					toast.success('About has been created')
					allowNavigation()
					router.replace(`/admin/abouts/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['AboutCreateInput']
	>({
		initialValues: {
			contentEn: '',
			contentAr: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create About - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create About' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data => createAbout({ variables: { data } }))}
				>
					<TextArea
						disabled={loading}
						label='Content En'
						required
						{...getInputProps('contentEn')}
					/>

					<TextArea
						disabled={loading}
						label='Content Ar'
						required
						{...getInputProps('contentAr')}
					/>

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
