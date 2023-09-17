import Label from './Label'
import React, { useId } from 'react'

export default function Checkbox(props: CheckboxProps) {
	const { label, value, error, required, className, ...rest } = props

	const randomId = useId()

	return (
		<div className='flex w-full flex-col gap-2'>
			<div className='flex items-center gap-2'>
				<input
					checked={value}
					className={`h-4 w-4 rounded-md border-2 px-2 ${className || ''}`}
					id={randomId}
					required={required}
					type='checkbox'
					{...rest}
				/>

				<Label htmlFor={randomId} label={label} required={required} />
			</div>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface CheckboxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
	label?: string
	error?: string
	value?: boolean
}
