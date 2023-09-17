import { $, useTypedQuery } from 'api'
import ActionIcon from '@/components/ActionIcon'
import Empty from '@/components/layout/Empty'
import Head from 'next/head'
import Loading from '@/components/layout/Loading'
import PageHeader from '@/components/layout/PageHeader'
import Pagination from '@/components/Pagination'
import Table from '@/components/layout/Table'
import usePagination from '@/hooks/usePagination'

export default function Page() {
	const { skip } = usePagination()

	const { data, loading, refetch } = useTypedQuery(
		{
			services: [
				{
					orderBy: $('orderBy', '[ServiceOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'ServiceWhereInput!'),
				},
				{ id: true, name: true, phone: true },
			],
			servicesCount: [{ where: $('where', 'ServiceWhereInput!') }, true],
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

	const items = data?.services.map(service => (
		<Table.Tr key={service.id}>
			<Table.Td>{service.name}</Table.Td>

			<Table.Td>{service.phone}</Table.Td>

			<Table.Td>
				<ActionIcon href={`/services/edit/?id=${service.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Services - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.servicesCount}
					create='/services/create'
					disabled={loading || !data?.servicesCount}
					refetch={refetch}
					title='Services'
				/>

				<Loading loading={loading}>
					{data?.servicesCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Title</Table.Th>

									<Table.Th>Phone</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='service' />
					)}
				</Loading>

				<Pagination count={data?.servicesCount} />
			</main>
		</>
	)
}
