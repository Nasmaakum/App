import React from 'react'

export default function Button(props: ButtonProps) {
	const {
		children,
		color = 'blue',
		variant = 'solid',
		loading,
		disabled,
		className: classNameProp,
		compact,
		...rest
	} = props

	const className = (() => {
		let className = `${compact ? 'px-1' : 'px-4 py-2'} rounded-md border-2 `

		switch (variant) {
			case 'outline':
				className += '!bg-transparent !text-black '
				break
		}

		switch (color) {
			case 'blue':
				className +=
					'bg-blue-500 border-blue-500 hover:bg-blue-300 hover:border-blue-300 text-white '
				break
			case 'red':
				className +=
					'bg-red-500 border-red-500 hover:bg-red-300 hover:border-red-300 text-white '
				break
			case 'green':
				className +=
					'bg-green-600 border-green-600 hover:bg-green-400 hover:border-green-400 text-white '
				break
			case 'purple':
				className +=
					'bg-purple-500 border-purple-500 hover:bg-purple-300 hover:border-purple-300 text-white '
				break
			case 'violet':
				className +=
					'bg-violet-500 border-violet-500 hover:bg-violet-300 hover:border-violet-300 text-white '
				break
			case 'orange':
				className +=
					'bg-orange-500 border-orange-500 hover:bg-orange-300 hover:border-orange-300 text-white '
				break
			case 'teal':
				className +=
					'bg-teal-500 border-teal-500 hover:bg-teal-300 hover:border-teal-300 text-white '
				break
			case 'gray':
				className +=
					'bg-gray-200 border-gray-200 hover:bg-gray-300 hover:border-gray-300 '
				break
			case 'pink':
				className +=
					'bg-pink-400 border-pink-400 hover:bg-pink-300 hover:border-pink-300 text-white '
				break
			case 'cyan':
				className +=
					'bg-cyan-500 border-cyan-500 hover:bg-cyan-300 hover:border-cyan-300 text-white '
				break
			case 'black':
				className +=
					'bg-black border-black hover:bg-gray-300 hover:border-gray-300 text-white '
				break
		}

		return `${className || ''} ${classNameProp}`
	})()

	return (
		// eslint-disable-next-line react/button-has-type
		<button
			className={` ${className || ''} ${loading ? '!text-transparent' : ''}`}
			disabled={disabled || loading}
			{...rest}
		>
			{loading && (
				<div className='relative h-full'>
					<div className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center'>
						<i
							className={`fa-solid fa-spinner ${
								className || ''
							} animate-spin !border-0 !bg-transparent`}
						></i>
					</div>
				</div>
			)}

			{children}
		</button>
	)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
	color?:
		| 'blue'
		| 'red'
		| 'green'
		| 'purple'
		| 'violet'
		| 'orange'
		| 'teal'
		| 'gray'
		| 'pink'
		| 'black'
		| 'cyan'
	variant?: 'solid' | 'outline'
	loading?: boolean
	compact?: boolean
}
