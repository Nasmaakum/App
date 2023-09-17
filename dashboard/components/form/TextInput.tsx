import Label from './Label'
import React from 'react'

export default function TextInput(props: TextInputProps) {
	const {
		label,
		error,
		required,
		value,
		className,
		smallLabel,
		type,
		...rest
	} = props

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} smallLabel={smallLabel} />

			<input
				className={`h-12 rounded-md border-2 bg-white px-2 ${className || ''}`}
				required={required}
				type={type}
				value={
					type === 'date' && typeof value === 'string'
						? new Date(value).toISOString().slice(0, 10)
						: value
				}
				{...rest}
			/>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

export interface TextInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	smallLabel?: boolean
	label?: string
	error?: string
}
