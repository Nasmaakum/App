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
			users: [
				{
					orderBy: $('orderBy', '[UserOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'UserWhereInput!'),
				},
				{ email: true, fullName: true, id: true, role: true },
			],
			usersCount: [{ where: $('where', 'UserWhereInput!') }, true],
		},
		{
			apolloOptions: {
				variables: {
					orderBy: [{ createdAt: 'desc' }],
					skip,
					take: 10,
					where: {
						OR: [
							{ firstName: { contains: debouncedSearch, mode: 'insensitive' } },
							{ lastName: { contains: debouncedSearch, mode: 'insensitive' } },
						],
					},
				},
			},
		},
	)

	const items = data?.users.map(user => {
		const icon = (() => {
			switch (user.role) {
				case 'USER':
					return 'fa-user'
				case 'ADMIN':
					return 'fa-lock'
				case 'INTERPRETER':
					return 'fa-headset'
				default:
					break
			}
		})()

		return (
			<Table.Tr key={user.id}>
				<Table.Td>{user.fullName}</Table.Td>

				<Table.Td>{user.email}</Table.Td>

				<Table.Td>
					<ActionIcon>
						<i className={`fa-solid ${icon}`} />
					</ActionIcon>
				</Table.Td>

				<Table.Td>
					<ActionIcon href={`/users/edit/?id=${user.id}`}>
						<i className='fa-solid fa-pen' />
					</ActionIcon>
				</Table.Td>
			</Table.Tr>
		)
	})

	return (
		<>
			<Head>
				<title>Users - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.usersCount}
					create='/users/create'
					disabled={loading || !data?.usersCount}
					refetch={refetch}
					search={search}
					setSearch={setSearch}
					title='Users'
				/>

				<Loading loading={loading}>
					{data?.usersCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Full name</Table.Th>

									<Table.Th>Email</Table.Th>

									<Table.Th>Role</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='user' />
					)}
				</Loading>

				<Pagination count={data?.usersCount} search={search} />
			</main>
		</>
	)
}
