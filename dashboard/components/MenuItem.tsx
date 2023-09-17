import { useRouter } from 'next/router'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const MenuSubItem = (props: MenuSubItemProps) => {
	const { title, active, href, onClick, disabled } = props

	const className = `w-full px-4 py-1 text-left text-sm ${
		active ? 'font-bold' : 'text-gray-700 hover:text-gray-600'
	}`

	if (active || disabled) return <span className={className}>{title}</span>

	if (href)
		return (
			<Link className={className} href={href}>
				{title}
			</Link>
		)

	return (
		<button className={className} type='button' onClick={onClick}>
			{title}
		</button>
	)
}

interface MenuSubItemProps {
	title: string
	href?: string
	active: boolean
	onClick?: () => void
	disabled?: boolean
}

export default function MenuItem(props: MenuItemProps) {
	const { title, icon, children, onClick, href, active, disabled } = props

	const router = useRouter()

	const [isOpen, setIsOpen] = useState(active)

	useEffect(() => {
		setIsOpen(active)
	}, [router.pathname])

	return (
		<div className='flex flex-col'>
			{(() => {
				const content = (
					<div
						className={`flex w-full items-center gap-2 px-4 py-1 transition-all duration-500 ${
							disabled
								? 'bg-gray-300 text-gray-400'
								: isOpen || active
								? 'bg-gray-500 text-white'
								: 'bg-gray-200'
						}`}
					>
						<i className={icon} />

						{title}
					</div>
				)

				if (disabled) return content

				if (active) return content

				if (href) return <Link href={href}>{content}</Link>

				return (
					<button
						type='button'
						onClick={() => {
							onClick ? onClick() : setIsOpen(val => !val)
						}}
					>
						{content}
					</button>
				)
			})()}

			{!!children && !disabled && (
				<div
					className={`h-full min-h-max w-full overflow-hidden bg-gray-300 transition-all duration-500 ${
						isOpen ? 'max-h-96' : 'max-h-0'
					}`}
				>
					<div className='flex flex-col py-2'>{children}</div>
				</div>
			)}
		</div>
	)
}

MenuItem.SubItem = MenuSubItem

interface MenuItemProps {
	title: string
	icon: string
	children?: React.ReactNode
	onClick?: () => void
	href?: string
	active: boolean
	disabled?: boolean
}
