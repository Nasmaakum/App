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
			serviceCategories: [
				{
					orderBy: $('orderBy', '[ServiceCategoryOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'ServiceCategoryWhereInput!'),
				},
				{ id: true, title: true },
			],
			serviceCategoriesCount: [
				{ where: $('where', 'ServiceCategoryWhereInput!') },
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

	const items = data?.serviceCategories.map(category => (
		<Table.Tr key={category.id}>
			<Table.Td>{category.title}</Table.Td>

			<Table.Td>
				<ActionIcon href={`/services/categories/edit/?id=${category.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Service Categories - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.serviceCategoriesCount}
					create='/services/categories/create'
					disabled={loading || !data?.serviceCategoriesCount}
					refetch={refetch}
					title='Service Categories'
				/>

				<Loading loading={loading}>
					{data?.serviceCategoriesCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Title</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='service category' />
					)}
				</Loading>

				<Pagination count={data?.serviceCategoriesCount} />
			</main>
		</>
	)
}
