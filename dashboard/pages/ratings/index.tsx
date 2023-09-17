import { $, useTypedQuery } from 'api'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import dayjs from 'dayjs'
import Empty from '@/components/layout/Empty'
import Head from 'next/head'
import Link from 'next/link'
import Loading from '@/components/layout/Loading'
import PageHeader from '@/components/layout/PageHeader'
import Pagination from '@/components/Pagination'
import Table from '@/components/layout/Table'
import usePagination from '@/hooks/usePagination'

dayjs.extend(advancedFormat)

export default function Page() {
	const { skip } = usePagination()

	const { data, loading, refetch } = useTypedQuery(
		{
			interpreterRatings: [
				{
					orderBy: $('orderBy', '[InterpreterRatingOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
					where: $('where', 'InterpreterRatingWhereInput!'),
				},
				{
					id: true,
					user: { id: true, fullName: true },
					interpreter: { id: true, user: { id: true, fullName: true } },
					rating: true,
					tellUsMore: true,
					createdAt: true,
					ip: true,
					options: {
						id: true,
						title: true,
					},
				},
			],
			interpreterRatingsCount: [
				{ where: $('where', 'InterpreterRatingWhereInput!') },
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

	const items = data?.interpreterRatings.map(rating => (
		<Table.Tr key={rating.id}>
			<Table.Td>{dayjs(rating.createdAt).format('Do MMM YYYY')}</Table.Td>

			<Table.Td>{dayjs(rating.createdAt).format('HH:mm:ss')}</Table.Td>

			<Table.Td>
				<Link
					className='underline'
					href={`/users/edit/?id=${rating.user?.id}`}
					target='_blank'
				>
					{rating.user?.fullName}
				</Link>
			</Table.Td>

			<Table.Td>
				<Link
					className='underline'
					href={`/users/edit/?id=${rating.interpreter.user?.id}`}
					target='_blank'
				>
					{rating.interpreter.user?.fullName}
				</Link>
			</Table.Td>

			<Table.Td>{rating.rating}/5</Table.Td>

			<Table.Td>{rating.options.map(rt => rt.title).join(', ')}</Table.Td>

			<Table.Td>{rating.tellUsMore}</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Ratings - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.interpreterRatingsCount}
					disabled={loading || !data?.interpreterRatingsCount}
					refetch={refetch}
					title='Ratings'
				/>

				<Loading loading={loading}>
					{data?.interpreterRatingsCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Date</Table.Th>

									<Table.Th>Time</Table.Th>

									<Table.Th>From User</Table.Th>

									<Table.Th>To Interpreter</Table.Th>

									<Table.Th>Rating</Table.Th>

									<Table.Th>Options</Table.Th>

									<Table.Th>Tell us more</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='service' />
					)}
				</Loading>

				<Pagination count={data?.interpreterRatingsCount} />
			</main>
		</>
	)
}
