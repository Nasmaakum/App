import { useEffect, useState } from 'react'

export default function useForceUpdate() {
	const [updateCount, setUpdateCount] = useState(0)

	function forceUpdate() {
		setUpdateCount(updateCount + 1)
	}

	useEffect(() => {
		forceUpdate()
	}, [])

	return forceUpdate
}
