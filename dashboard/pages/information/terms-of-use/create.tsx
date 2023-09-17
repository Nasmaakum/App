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

	const [createTermsOfUse, { loading }] = useTypedMutation(
		{
			createTermsOfUse: [
				{ data: $('data', 'TermsOfUseCreateInput!') },
				{ id: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ createTermsOfUse: { id } }) => {
					toast.success('TermsOfUse has been created')
					allowNavigation()
					router.replace(`/admin/terms-of-use/edit/?id=${id}`)
				},
			},
		},
	)

	const { onSubmit, getInputProps, allowNavigation } = useForm<
		GraphQLTypes['TermsOfUseCreateInput']
	>({
		initialValues: {
			contentEn: '',
			contentAr: '',
		},
	})

	return (
		<>
			<Head>
				<title>Create Terms of Use - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader title='Create Terms of Use' />

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data => createTermsOfUse({ variables: { data } }))}
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
