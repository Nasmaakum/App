import Link from 'next/link'
import React from 'react'

export default function Footer(props: FooterProps) {
	const {} = props

	const DEVELOPER_URL = process.env.DEVELOPER_URL
	if (!DEVELOPER_URL) throw new Error('DEVELOPER_URL is not defined')
	const APP_VERSION = process.env.APP_VERSION
	if (!APP_VERSION) throw new Error('APP_VERSION is not defined')

	return (
		<div className='flex h-12 items-center justify-between bg-gray-200 px-4 text-xs text-gray-900'>
			<span className='font-bold'>
				&copy;{new Date().getFullYear()} Nasmaakum - <span>v{APP_VERSION}</span>
			</span>

			<div className='flex gap-1'>
				<span className='hidden md:inline-block'>Made with ❤️ by</span>

				<Link
					className='flex items-center font-bold hover:underline'
					href={DEVELOPER_URL}
					rel='noreferrer'
					target='_blank'
				>
					<span className='hidden md:inline-block'>404 Software</span>
					<img
						className='inline-block h-8 w-8 md:hidden'
						src='/images/404.png'
					/>
				</Link>
			</div>
		</div>
	)
}

interface FooterProps {}
