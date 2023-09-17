import { $, useTypedQuery } from 'api'
import { useState } from 'react'
import ActionIcon from '@/components/ActionIcon'
import Empty from '@/components/layout/Empty'
import Head from 'next/head'
import Loading from '@/components/layout/Loading'
import PageHeader from '@/components/layout/PageHeader'
import Pagination from '@/components/Pagination'
import Table from '@/components/layout/Table'
import usePagination from '@/hooks/usePagination'

export default function Page() {
	const [search, setSearch] = useState('')

	const { skip } = usePagination(search)

	const { data, loading, refetch } = useTypedQuery(
		{
			termsOfUses: [
				{
					orderBy: $('orderBy', '[TermsOfUseOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{ id: true, version: true },
			],
			termsOfUsesCount: [{}, true],
		},
		{
			apolloOptions: {
				variables: {
					orderBy: [{ createdAt: 'desc' }],
					skip,
					take: 10,
				},
			},
		},
	)

	const items = data?.termsOfUses.map(tos => (
		<Table.Tr key={tos.id}>
			<Table.Td>V {tos.version}.0</Table.Td>

			<Table.Td>
				<ActionIcon href={`/information/terms-of-use/edit/?id=${tos.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>TermsOfUses - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.termsOfUsesCount}
					create='/information/terms-of-use/create'
					disabled={loading || !data?.termsOfUsesCount}
					refetch={refetch}
					setSearch={setSearch}
					title='Terms of Use'
				/>

				<Loading loading={loading}>
					{data?.termsOfUsesCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Version</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='terms of use' />
					)}
				</Loading>

				<Pagination count={data?.termsOfUsesCount} search={search} />
			</main>
		</>
	)
}
