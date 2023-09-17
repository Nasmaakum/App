import React from 'react'

export default function Loading(props: LoadingProps) {
	const { loading, children } = props

	if (loading)
		return (
			<div className='flex flex-1 items-center justify-center'>
				<i className='fa-solid fa-spinner animate-spin text-6xl text-gray-700' />
			</div>
		)

	return children
}

interface LoadingProps {
	loading: boolean
	children: JSX.Element
}
