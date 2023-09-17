import React from 'react'

export default function Divider(props: DividerProps) {
	const { className } = props

	return (
		<div className={`border-gray-200 ${className || ''}`}>
			<div className='border-t' />
		</div>
	)
}

interface DividerProps {
	className?: string
}
