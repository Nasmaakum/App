import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function usePagination(search = '') {
	const router = useRouter()
	const query = router.query
	const page = parseInt((query.page || 1).toString())

	const setPage = (newPage: number) => {
		router.push({ query: { ...query, page: newPage } })
	}

	useEffect(() => {
		if (page !== 1 && search) router.push({ query: { ...query, page: 1 } })
	}, [search])

	return { page, setPage, skip: (page - 1) * 10 }
}
