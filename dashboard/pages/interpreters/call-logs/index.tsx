import { $, useTypedQuery } from 'api'
import { useState } from 'react'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Empty from '@/components/layout/Empty'
import Head from 'next/head'
import Link from 'next/link'
import Loading from '@/components/layout/Loading'
import PageHeader from '@/components/layout/PageHeader'
import Pagination from '@/components/Pagination'
import Table from '@/components/layout/Table'
import usePagination from '@/hooks/usePagination'

dayjs.extend(duration)
dayjs.extend(advancedFormat)

export default function Page() {
	const [search, setSearch] = useState('')

	const { skip } = usePagination(search)

	const { data, loading, refetch } = useTypedQuery(
		{
			calls: [
				{
					orderBy: $('orderBy', '[CallOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{
					id: true,
					from: { fullName: true, id: true },
					to: { user: { id: true, fullName: true } },
					createdAt: true,
					updatedAt: true,
					status: true,
					service: { id: true, name: true },
					serviceCalledAt: true,
					serviceEndedAt: true,
					endedAt: true,
				},
			],
			callsCount: [{}, true],
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

	const items = data?.calls.map(call => {
		const clientDuration = call.service
			? dayjs
					.duration({
						hours: dayjs(call.serviceEndedAt || call.endedAt).diff(
							call.serviceCalledAt,
							'hours',
						),
						minutes:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'minutes',
							) % 60,
						seconds:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'seconds',
							) % 60,
					})
					.format('HH:mm:ss')
			: 'N/A'
		const totalDuration = dayjs
			.duration({
				hours: dayjs(call.endedAt).diff(call.createdAt, 'hours'),
				minutes: dayjs(call.endedAt).diff(call.createdAt, 'minutes') % 60,
				seconds: dayjs(call.endedAt).diff(call.createdAt, 'seconds') % 60,
			})
			.format('HH:mm:ss')
		const interpreterDuration = dayjs
			.duration({
				hours: dayjs(call.endedAt).diff(call.createdAt, 'hours'),
				minutes: dayjs(call.endedAt).diff(call.createdAt, 'minutes') % 60,
				seconds: dayjs(call.endedAt).diff(call.createdAt, 'seconds') % 60,
			})
			.subtract(
				dayjs
					.duration({
						hours: dayjs(call.serviceEndedAt || call.endedAt).diff(
							call.serviceCalledAt,
							'hours',
						),
						minutes:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'minutes',
							) % 60,
						seconds:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'seconds',
							) % 60,
					})
					.get('h') || 0,
				'h',
			)
			.subtract(
				dayjs
					.duration({
						hours: dayjs(call.serviceEndedAt || call.endedAt).diff(
							call.serviceCalledAt,
							'hours',
						),
						minutes:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'minutes',
							) % 60,
						seconds:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'seconds',
							) % 60,
					})
					.get('m') || 0,
				'm',
			)
			.subtract(
				dayjs
					.duration({
						hours: dayjs(call.serviceEndedAt || call.endedAt).diff(
							call.serviceCalledAt,
							'hours',
						),
						minutes:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'minutes',
							) % 60,
						seconds:
							dayjs(call.serviceEndedAt || call.endedAt).diff(
								call.serviceCalledAt,
								'seconds',
							) % 60,
					})
					.get('s') || 0,
				's',
			)
			.format('HH:mm:ss')

		return (
			<Table.Tr key={call.id}>
				<Table.Td>{dayjs(call.createdAt).format('Do-MMM-YYYY')}</Table.Td>

				<Table.Td>{dayjs(call.createdAt).format('hh:mm:ss A')}</Table.Td>

				<Table.Td>
					<Link
						className='underline'
						target='_blank'
						href={`/users/edit/?id=${call.from.id}`}
					>
						{call.from.fullName}
					</Link>
				</Table.Td>

				<Table.Td>
					<Link
						className='underline'
						href={`/users/edit/?id=${call.to.user.id}`}
						target='_blank'
					>
						{call.to.user.fullName}
					</Link>
				</Table.Td>

				<Table.Td>{interpreterDuration}</Table.Td>

				<Table.Td>
					{call.service ? (
						<Link
							className='underline'
							href={`/services/edit/?id=${call.service?.id}`}
							target='_blank'
						>
							{call.service?.name}
						</Link>
					) : (
						'N/A'
					)}
				</Table.Td>

				<Table.Td>{clientDuration}</Table.Td>

				<Table.Td>{dayjs(call.endedAt).format('hh:mm:ss A')}</Table.Td>

				<Table.Td>{totalDuration}</Table.Td>
			</Table.Tr>
		)
	})

	return (
		<>
			<Head>
				<title>Calls - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.callsCount}
					create='/calls/create'
					disabled={loading || !data?.callsCount}
					refetch={refetch}
					setSearch={setSearch}
					title='Call'
					exportexcel={refetch}
				/>

				<Loading loading={loading}>
					{data?.callsCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Date</Table.Th>

									<Table.Th>Start Time</Table.Th>

									<Table.Th>From User</Table.Th>

									<Table.Th>To Interpreter</Table.Th>

									<Table.Th>Duration</Table.Th>

									<Table.Th>To Client</Table.Th>

									<Table.Th>Duration</Table.Th>

									<Table.Th>End Time</Table.Th>

									<Table.Th>Total Duration</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='call' />
					)}
				</Loading>

				<Pagination count={data?.callsCount} search={search} />
			</main>
		</>
	)
}
