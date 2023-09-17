import React from 'react'
import TextInput, { TextInputProps } from './TextInput'

export default function NumberInput(props: NumberInputProps) {
	const { value, onChange, ...rest } = props

	return (
		<TextInput
			type='number'
			value={value?.toString()}
			onChange={e => onChange?.(+e.target.value)}
			{...rest}
		/>
	)
}

interface NumberInputProps extends Omit<TextInputProps, 'type' | 'onChange'> {
	onChange?: (value: number) => void
}
