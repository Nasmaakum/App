import Label from './Label'
import React from 'react'

export default function TextArea(props: TextAreaProps) {
	const { label, error, required, className, ...rest } = props

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} />

			<textarea
				className={`min-h-24 rounded-md border-2 p-2 ${className || ''}`}
				required={required}
				{...rest}
			/>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface TextAreaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
}
