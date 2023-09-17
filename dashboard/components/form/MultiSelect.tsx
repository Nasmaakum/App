import Label from './Label'
import React from 'react'
import Select, { Props } from 'react-select'

export default function MultiSelect(props: MultiSelectProps) {
	const {
		label,
		error,
		options = [],
		placeholder,
		required,
		className,
		onChange,
		value = [],
		searchValue,
		onSearchChange,
		disabled,
		...rest
	} = props

	const valueWithLabel = value?.map(v => {
		const option = options.find(o => o.value === v)

		return option ? { label: option.label, value: v } : undefined
	})

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} />

			<div
				className={`flex min-h-12 items-center rounded-md border-2 ${
					disabled ? 'bg-[#F6F7F7]' : 'bg-white'
				} ${className || ''}`}
			>
				<Select
					className='flex-1'
					inputValue={searchValue}
					isDisabled={disabled}
					options={options}
					required={required}
					styles={{
						control: () => ({ display: 'flex', flex: 1 }),
						multiValueRemove: disabled
							? () => ({ display: 'none' })
							: undefined,
					}}
					value={valueWithLabel}
					isMulti
					onChange={val => {
						const selectedValue = val as Array<{ label: string; value: string }>

						onChange?.(selectedValue.map(v => v.value))
					}}
					onInputChange={onSearchChange}
					{...rest}
				/>
			</div>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface MultiSelectProps extends Omit<Props, 'onChange' | 'isMulti'> {
	label?: string
	value?: string[]
	options?: Array<{ label: string; value: string }>
	error?: string
	disabled?: boolean
	onChange?: (value: string[]) => void
	searchValue?: string
	onSearchChange?: (value: string) => void
}
