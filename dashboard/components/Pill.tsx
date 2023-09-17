import React from 'react'

export default function Pill(props: PillProps) {
	const {
		children,
		onClick,
		color = 'blue',
		variant = 'solid',
		className: classNameProp,
		...rest
	} = props

	const className = (() => {
		let className = 'px-1 rounded-md border-2 text-xs '
		switch (variant) {
			case 'outline':
				className += 'border-gray-200 !bg-transparent '
				break
		}

		switch (color) {
			case 'red':
				className += 'border-red-500 bg-red-500 text-white '
				onClick ? (className += 'hover:bg-red-300 hover:border-red-300 ') : null
				break
			case 'blue':
				className += 'border-blue-500 bg-blue-500 text-white '
				onClick
					? (className += 'hover:bg-blue-300 hover:border-blue-300 ')
					: null
				break
			case 'green':
				className += 'border-green-600 bg-green-600 text-white '
				onClick
					? (className += 'hover:bg-green-400 hover:border-green-400 ')
					: null
				break
			case 'purple':
				className += 'border-purple-500 bg-purple-500 text-white '
				onClick
					? (className += 'hover:bg-purple-300 hover:border-purple-300 ')
					: null
				break
		}

		return `${className} ${classNameProp || ''}`
	})()

	if (onClick)
		return (
			<button className={className} type='button' onClick={onClick} {...rest}>
				{children}
			</button>
		)

	return (
		<span className={className} {...rest}>
			{children}
		</span>
	)
}

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
	color?: 'blue' | 'red' | 'green' | 'purple'
	variant?: 'solid' | 'outline'
}
