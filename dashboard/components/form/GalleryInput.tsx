import ImageInput from './ImageInput'
import Label from './Label'

export default function GalleryInput(props: Props) {
	const {
		label,
		required = false,
		error,
		value,
		onChange,
		disabled,
		variant,
	} = props

	const handleOnChange = (index: number) => (image?: File | string | null) => {
		if (!image) onChange(value.filter((_, i) => i !== index))
		else
			onChange(
				value[index]
					? value.map((currentImage, i) => (i === index ? image : currentImage))
					: [...value, image],
			)
	}

	// return null

	return (
		<div className='flex flex-col gap-2'>
			<Label label={label} required={required} />

			<div className='flex flex-col items-stretch gap-4 md:flex-row'>
				{Array(4)
					.fill(0)
					.map((_, i) => (
						<ImageInput
							key={`GalleryInput-${i}`}
							disabled={disabled}
							required={required}
							value={value[i]}
							variant={variant}
							compact
							onChange={handleOnChange(i)}
						/>
					))}
			</div>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface Props {
	label?: string
	required?: boolean
	disabled?: boolean
	error?: string
	value: Array<string | File>
	variant?: 'square' | 'rectangle'
	onChange: (images: Array<string | File>) => void
}
