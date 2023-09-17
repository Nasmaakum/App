import React from 'react'

export default function Empty(props: EmptyProps) {
	const { name } = props

	return (
		<div className='flex flex-col items-center justify-center gap-8'>
			<img
				alt='Empty'
				className='px-4 md:max-w-md'
				src='/illustrations/empty.svg'
			/>

			<div className='text-center'>
				<h2 className='text-2xl font-bold'>Wow, so empty in here!</h2>

				{!!name && (
					<p className='text-gray-500'>Start by creating a new {name}</p>
				)}
			</div>
		</div>
	)
}

interface EmptyProps {
	name?: string
}
