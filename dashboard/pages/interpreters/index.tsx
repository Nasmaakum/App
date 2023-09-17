import { $, useTypedQuery } from 'api'
import { useDebounce } from 'use-debounce'
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
	const [debouncedSearch] = useDebounce(search, 1000)

	const { skip } = usePagination(search)

	const { data, loading, refetch } = useTypedQuery(
		{
			interpreters: [
				{
					orderBy: $('orderBy', '[InterpreterOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'InterpreterWhereInput!'),
				},
				{
					id: true,
					user: { fullName: true },
					status: true,
					rating: true,
				},
			],
			interpretersCount: [
				{ where: $('where', 'InterpreterWhereInput!') },
				true,
			],
		},
		{
			apolloOptions: {
				variables: {
					orderBy: [{ createdAt: 'desc' }],
					skip,
					take: 10,
					where: {},
				},
			},
		},
	)

	const items = data?.interpreters.map(interpreter => (
		<Table.Tr key={interpreter.id}>
			<Table.Td>{interpreter.user.fullName}</Table.Td>

			<Table.Td>{interpreter.status}</Table.Td>

			<Table.Td>{interpreter.rating}</Table.Td>

			<Table.Td>
				<ActionIcon href={`/interpreters/edit/?id=${interpreter.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Interpreters - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.interpretersCount}
					disabled={loading || !data?.interpretersCount}
					refetch={refetch}
					search={search}
					setSearch={setSearch}
					title='Interpreters'
				/>

				<Loading loading={loading}>
					{data?.interpretersCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Full name</Table.Th>

									<Table.Th>Status</Table.Th>

									<Table.Th>Rating (5)</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='interpreter' />
					)}
				</Loading>

				<Pagination count={data?.interpretersCount} search={search} />
			</main>
		</>
	)
}
