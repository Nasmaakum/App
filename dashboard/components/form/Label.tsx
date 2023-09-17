import React from 'react'

export default function Label(props: LabelProps) {
	const { label, required, className, smallLabel, ...rest } = props

	if (!label) return null

	return (
		<div
			className={`flex gap-1 ${
				smallLabel ? 'text-xs' : 'text-sm'
			} ${className}`}
		>
			<label className='font-semibold' {...rest}>
				{label}
			</label>

			{required && <span className='text-red-500'>*</span>}
		</div>
	)
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	label?: string
	required?: boolean
	smallLabel?: boolean
}
