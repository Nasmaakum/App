import 'react-phone-number-input/style.css'
import { E164Number } from 'libphonenumber-js/types'
import Input from 'react-phone-number-input'
import Label from './Label'
import React from 'react'

export default function PhoneNumberInput(props: PhoneNumberInputProps) {
	const { label, required, disabled, smallLabel, error, ...rest } = props

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} smallLabel={smallLabel} />

			<Input
				addInternationalOption={false}
				className={`phone-input h-12 rounded-md border-2 ${
					disabled ? 'bg-[#F6F7F7]' : 'bg-white'
				} px-2`}
				defaultCountry='BH'
				disabled={disabled}
				initialValueFormat='national'
				useNationalFormatForDefaultCountryValue
				{...rest}
			/>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

export interface PhoneNumberInputProps {
	smallLabel?: boolean
	label?: string
	error?: string
	required?: boolean
	disabled?: boolean
	onChange: (value?: E164Number | undefined) => void
}
