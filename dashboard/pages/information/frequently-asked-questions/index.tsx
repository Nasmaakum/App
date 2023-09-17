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
			frequentlyAskedQuestions: [
				{
					orderBy: $('orderBy', '[FrequentlyAskedQuestionOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{ id: true, question: true },
			],
			frequentlyAskedQuestionsCount: [{}, true],
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

	const items = data?.frequentlyAskedQuestions.map(faq => (
		<Table.Tr key={faq.id}>
			<Table.Td>{faq.question}</Table.Td>

			<Table.Td>
				<ActionIcon
					href={`/information/frequently-asked-questions/edit/?id=${faq.id}`}
				>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Frequently Asked Questions - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.frequentlyAskedQuestionsCount}
					create='/information/frequently-asked-questions/create'
					disabled={loading || !data?.frequentlyAskedQuestionsCount}
					refetch={refetch}
					setSearch={setSearch}
					title='Frequently Asked Question'
				/>

				<Loading loading={loading}>
					{data?.frequentlyAskedQuestionsCount ? (
						<Table className='w-full'>
							<Table.Head>
								<Table.Tr>
									<Table.Th>Question</Table.Th>

									<Table.Th>Edit</Table.Th>
								</Table.Tr>
							</Table.Head>

							<Table.Body>{items}</Table.Body>
						</Table>
					) : (
						<Empty name='frequently asked question' />
					)}
				</Loading>

				<Pagination
					count={data?.frequentlyAskedQuestionsCount}
					search={search}
				/>
			</main>
		</>
	)
}
