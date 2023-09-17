import ActionIcon from './ActionIcon'
import React from 'react'
import usePagination from '@/hooks/usePagination'

export default function Pagination(props: PaginationProps) {
	const { count = 0, search = '' } = props

	const { page, setPage } = usePagination(search)

	const pageSize = 10

	const totalPages = count ? Math.ceil(count / pageSize) : 1

	if (totalPages === 1) return null

	const pageRange = Array.from(
		{ length: Math.min(totalPages, 7) },
		(_, i) => i + Math.max(1, page - 3),
	)

	return (
		<div className='flex justify-center gap-2'>
			{page !== 1 && (
				<ActionIcon variant='outline' onClick={() => setPage(1)}>
					<i className='fa-solid fa-chevron-left' />
				</ActionIcon>
			)}

			{pageRange.map(pageNum => {
				if (pageNum > totalPages) return null
				return (
					<ActionIcon
						key={pageNum}
						variant={pageNum === page ? 'default' : 'outline'}
						onClick={() => setPage(pageNum)}
					>
						{pageNum}
					</ActionIcon>
				)
			})}

			{page !== totalPages && (
				<ActionIcon variant='outline' onClick={() => setPage(totalPages)}>
					<i className='fa-solid fa-chevron-right' />
				</ActionIcon>
			)}
		</div>
	)
}

interface PaginationProps {
	count?: number
	search?: string
}
