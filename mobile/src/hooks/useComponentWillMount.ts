import { useRef } from 'react'

export default function useComponentWillMount(cb: () => void) {
	const willMount = useRef(true)

	if (willMount.current) cb()

	willMount.current = false
}
