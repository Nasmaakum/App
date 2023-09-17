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
			interpreterRatingOptions: [
				{
					orderBy: $('orderBy', '[InterpreterRatingOptionOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'InterpreterRatingOptionWhereInput!'),
				},
				{
					id: true,
					title: true,
					ratingVisibleFrom: true,
					ratingVisibleTo: true,
				},
			],
			interpreterRatingOptionsCount: [
				{ where: $('where', 'InterpreterRatingOptionWhereInput!') },
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

	const items = data?.interpreterRatingOptions.map(rating => (
		<Table.Tr key={rating.id}>
			<Table.Td>{rating.title}</Table.Td>
			<Table.Td>{rating.ratingVisibleFrom}</Table.Td>
			<Table.Td>{rating.ratingVisibleTo}</Table.Td>

			<Table.Td>
				<ActionIcon href={`/ratings/options/edit/?id=${rating.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Ratings Options - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.interpreterRatingOptionsCount}
					create='/ratings/options/create'
					disabled={loading || !data?.interpreterRatingOptionsCount}
					refetch={refetch}
					title='Rating Options'
				/>

				<Loading loading={loading}>
					{data?.interpreterRatingOptionsCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Title</Table.Th>

									<Table.Th>Visible From</Table.Th>

									<Table.Th>Visible To</Table.Th>

									<Table.Th></Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='service category' />
					)}
				</Loading>

				<Pagination count={data?.interpreterRatingOptionsCount} />
			</main>
		</>
	)
}
