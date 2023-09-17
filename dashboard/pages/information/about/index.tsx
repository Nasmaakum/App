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
			abouts: [
				{
					orderBy: $('orderBy', '[AboutOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{ id: true, version: true },
			],
			aboutsCount: [{}, true],
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

	const items = data?.abouts.map(about => (
		<Table.Tr key={about.id}>
			<Table.Td>V {about.version}</Table.Td>

			<Table.Td>
				<ActionIcon href={`/information/about/edit/?id=${about.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Abouts - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.aboutsCount}
					create='/information/about/create'
					disabled={loading || !data?.aboutsCount}
					refetch={refetch}
					setSearch={setSearch}
					title='About'
				/>

				<Loading loading={loading}>
					{data?.aboutsCount ? (
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
						<Empty name='about' />
					)}
				</Loading>

				<Pagination count={data?.aboutsCount} search={search} />
			</main>
		</>
	)
}
