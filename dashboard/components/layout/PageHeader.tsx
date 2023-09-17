import ActionIcon from '../ActionIcon'
import React from 'react'

export default function PageHeader(props: PageHeaderProps) {
	const {
		title,
		create,
		refetch,
		search,
		setSearch,
		count,
		disabled,
		className,
		children,
		extraPosition = 'right',
		actionIcon,
		exportexcel,
	} = props

	return (
		<div
			className={`flex flex-col justify-between gap-4 md:flex-row md:items-center ${
				className || ''
			}`}
		>
			<h1 className='flex items-center gap-2 text-3xl font-bold'>
				{title} {!!count && ` (${count})`}
			</h1>

			<div className='flex h-full items-center gap-4'>
				{extraPosition === 'left' && children}

				{setSearch && (
					<div
						className={`flex flex-1 items-center gap-2 rounded-md border-2 border-gray-200 md:flex-auto ${
							disabled ? 'bg-gray-200' : 'bg-white'
						} px-2`}
					>
						<i className='fa-solid fa-search text-xl text-gray-400' />
						<input
							className='h-7 focus:outline-none active:outline-none'
							disabled={disabled}
							placeholder='Search...'
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>
				)}

				{refetch && (
					<ActionIcon
						className={actionIcon?.className}
						disabled={disabled}
						onClick={() => refetch()}
					>
						<i className='fa-solid fa-sync' />
					</ActionIcon>
				)}

				{create && (
					<ActionIcon className={actionIcon?.className} href={create}>
						<i className='fa-solid fa-plus' />
					</ActionIcon>
				)}
				{exportexcel && (
					<ActionIcon
						className={actionIcon?.className}
						disabled={disabled}
						onClick={() => exportexcel()}
					>
						<i className='fa fa-file-excel' />
					</ActionIcon>
				)}

				{extraPosition === 'right' && children}
			</div>
		</div>
	)
}

interface PageHeaderProps {
	title: React.ReactNode
	count?: number
	create?: string
	search?: string
	setSearch?: React.Dispatch<React.SetStateAction<string>>
	refetch?: () => void
	disabled?: boolean
	className?: string
	children?: React.ReactNode
	extraPosition?: 'left' | 'right'
	actionIcon?: {
		className?: string
	}
	exportexcel?: () => void
}
