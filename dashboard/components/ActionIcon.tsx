import Link from 'next/link'
import React from 'react'

export default function ActionIcon(props: ActionIconProps) {
	const {
		children,
		variant = 'default',
		color = 'default',
		href,
		onClick,
		disabled,
		className: _className,
		target,
		...rest
	} = props

	const pressable = href || onClick
	const childrenIsText =
		typeof children === 'string' || typeof children === 'number'

	const className = (() => {
		let className = `flex h-7 aspect-square items-center justify-center rounded-md border-2 ${
			childrenIsText ? 'text-xs font-semibold truncate' : 'text-xl'
		} `
		switch (variant) {
			case 'outline':
				className += 'border-gray-200 !bg-transparent '
				break
			case 'ghost':
				className += 'border-transparent bg-transparent '
				break
		}

		switch (color) {
			case 'default':
				className += 'border-gray-200 bg-gray-200 '
				pressable && !disabled
					? (className += 'hover:bg-gray-300 hover:border-gray-300 ')
					: null
				break
			case 'gray':
				className += 'border-gray-200 bg-gray-200 '
				pressable && !disabled
					? (className += 'hover:bg-gray-300 hover:border-gray-300 ')
					: null
				break
			case 'red':
				className += 'border-red-500 bg-red-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-red-300 hover:border-red-300 ')
					: null
				break
			case 'blue':
				className += 'border-blue-500 bg-blue-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-blue-300 hover:border-blue-300 ')
					: null
				break
			case 'violet':
				className += 'border-violet-500 bg-violet-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-violet-300 hover:border-violet-300 ')
					: null
				break
			case 'orange':
				className += 'border-orange-500 bg-orange-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-orange-300 hover:border-orange-300 ')
					: null
				break
			case 'teal':
				className += 'border-teal-500 bg-teal-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-teal-300 hover:border-teal-300 ')
					: null
				break
			case 'pink':
				className += 'border-pink-400 bg-pink-400 text-white '
				pressable && !disabled
					? (className += 'hover:bg-pink-300 hover:border-pink-300 ')
					: null
				break
			case 'cyan':
				className += 'border-cyan-500 bg-cyan-500 text-white '
				pressable && !disabled
					? (className += 'hover:bg-cyan-300 hover:border-cyan-300 ')
					: null
				break
		}

		return className
	})()

	const content = <div>{children}</div>

	if (href)
		return (
			<Link
				className={`${className} ${_className || ''}`}
				href={href}
				target={target}
			>
				{content}
			</Link>
		)

	if (onClick)
		return (
			<button
				className={`${className} ${_className || ''}`}
				disabled={disabled}
				type='button'
				onClick={onClick}
				{...rest}
			>
				{content}
			</button>
		)

	return content
}

export interface ActionIconProps
	extends Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		'children' | 'color'
	> {
	children: React.ReactNode
	variant?: 'default' | 'outline' | 'ghost'
	color?:
		| 'default'
		| 'red'
		| 'blue'
		| 'violet'
		| 'orange'
		| 'teal'
		| 'gray'
		| 'pink'
		| 'cyan'
	className?: string
	href?: string
	target?: '_blank' | '_self' | '_parent' | '_top' | string
}
