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
			advertisements: [
				{
					orderBy: $('orderBy', '[AdvertisementOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{ id: true, title: true, active: true, views: true },
			],
			advertisementsCount: [{}, true],
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

	const items = data?.advertisements.map(advertisement => (
		<Table.Tr key={advertisement.id}>
			<Table.Td>{advertisement.title}</Table.Td>

			<Table.Td>{advertisement.views}</Table.Td>

			<Table.Td>
				<ActionIcon>
					<i
						className={`fa-solid ${
							advertisement.active ? 'fa-check' : 'fa-xmark'
						}`}
					/>
				</ActionIcon>
			</Table.Td>

			<Table.Td>
				<ActionIcon href={`/advertisements/edit/?id=${advertisement.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Advertisements - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.advertisementsCount}
					create='/advertisements/create'
					disabled={loading || !data?.advertisementsCount}
					refetch={refetch}
					setSearch={setSearch}
					title='Advertisement'
				/>

				<Loading loading={loading}>
					{data?.advertisementsCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Title</Table.Th>

									<Table.Th>Views</Table.Th>

									<Table.Th>Active</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='advertisement' />
					)}
				</Loading>

				<Pagination count={data?.advertisementsCount} search={search} />
			</main>
		</>
	)
}
