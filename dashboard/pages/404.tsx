import Head from 'next/head'
import React from 'react'

export default function Page() {
	return (
		<>
			<Head>
				<title>Page Not Found - Nasmaakum</title>
			</Head>

			<main className='flex flex-1 flex-col items-center justify-center gap-8'>
				<img
					alt='Not Found'
					className='px-4 md:max-w-md'
					src='/illustrations/not-found.svg'
				/>

				<div className='text-center'>
					<h2 className='text-2xl font-bold'>Wrong place, wrong time...</h2>
					<p className='text-gray-500'>
						The page you're looking for does not exist!
					</p>
				</div>
			</main>
		</>
	)
}
