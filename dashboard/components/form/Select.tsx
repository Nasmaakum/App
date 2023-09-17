import Label from './Label'
import RCSelect, { Props } from 'react-select'
import React from 'react'

export default function Select(props: SelectProps) {
	const {
		label,
		error,
		value,
		options = [],
		placeholder,
		required,
		className,
		onChange,
		searchValue,
		onSearchChange,
		disabled,
		...rest
	} = props

	const valueWithLabel = (() => {
		if (!value) return undefined

		const option = options.find(o => o.value === value)

		return option ? { label: option.label, value: value } : undefined
	})()

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} />

			<div
				className={`flex h-12 items-center rounded-md border-2 ${
					disabled ? 'bg-[#F6F7F7]' : 'bg-white'
				}  ${className || ''}`}
			>
				<RCSelect
					className='flex-1'
					inputValue={searchValue}
					isDisabled={disabled}
					options={options}
					required={required}
					styles={{ control: () => ({ display: 'flex', flex: 1 }) }}
					value={valueWithLabel}
					onChange={val => {
						const selectedValue = val as { label: string; value: string }

						onChange?.(selectedValue.value)
					}}
					onInputChange={onSearchChange}
					{...rest}
				/>
			</div>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface SelectProps extends Omit<Props, 'onChange' | 'isMulti' | 'value'> {
	label?: string
	value?: string
	options?: Array<{ label: string; value: string }>
	error?: string
	disabled?: boolean
	onChange?: (value: string) => void
	searchValue?: string
	onSearchChange?: (value: string) => void
}
