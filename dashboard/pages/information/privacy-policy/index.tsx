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
			privacyPolicies: [
				{
					orderBy: $('orderBy', '[PrivacyPolicyOrderByInput!]'),
					skip: $('skip', 'Int'),
					take: $('take', 'Int'),
				},
				{ id: true, version: true },
			],
			privacyPoliciesCount: [{}, true],
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

	const items = data?.privacyPolicies.map(pp => (
		<Table.Tr key={pp.id}>
			<Table.Td>V {pp.version}.0</Table.Td>

			<Table.Td>
				<ActionIcon href={`/information/privacy-policy/edit/?id=${pp.id}`}>
					<i className='fa-solid fa-pen' />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	))

	return (
		<>
			<Head>
				<title>Privacy Policies - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col gap-8'>
				<PageHeader
					count={data?.privacyPoliciesCount}
					create='/information/privacy-policy/create'
					disabled={loading || !data?.privacyPoliciesCount}
					refetch={refetch}
					setSearch={setSearch}
					title='Privacy Policy'
				/>

				<Loading loading={loading}>
					{data?.privacyPoliciesCount ? (
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
						<Empty name='privacy policy' />
					)}
				</Loading>

				<Pagination count={data?.privacyPoliciesCount} search={search} />
			</main>
		</>
	)
}
