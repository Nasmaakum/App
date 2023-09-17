import { useDropzone } from 'react-dropzone'
import { useEffect, useState } from 'react'
import Label from './Label'
import Link from 'next/link'

export default function FileInput(props: FileInputProps) {
	const {
		value,
		onChange,
		label,
		required,
		smallLabel,
		className,
		error,
		disabled,
		...rest
	} = props

	const [preview, setPreview] = useState<string | undefined>('')

	useEffect(() => {
		setPreview(
			typeof value === 'string'
				? value.split('/').reverse()[0]
				: value?.name.split('/').reverse()[0],
		)
	}, [value])

	const { getRootProps, getInputProps } = useDropzone({
		maxFiles: 1,
		onDrop: async acceptedFiles => {
			if (acceptedFiles[0]) {
				onChange(acceptedFiles[0])

				setPreview(acceptedFiles[0].name.split('/').reverse()[0])
			}
		},
	})

	return (
		<div className='flex w-full flex-col gap-2'>
			<Label label={label} required={required} smallLabel={smallLabel} />

			<div
				className={`relative flex h-12 flex-1 justify-between rounded-md border-2 p-2 px-2 ${
					disabled ? 'bg-[#F6F7F7]' : 'bg-white'
				} ${className || ''}`}
			>
				<div
					{...getRootProps({
						className: 'flex justify-between flex-1',
					})}
				>
					<div className='relative flex flex-1 items-center truncate'>
						<span
							className={`${preview ? 'text-black' : 'text-gray-500'} absolute`}
						>
							{preview || 'Select file'}
						</span>

						<input
							{...getInputProps({
								className:
									'absolute top-0 left-0 right-0 bottom-0 !block opacity-0',
								disabled,
								multiple: false,
								name: 'file',
								required: required && !preview,
							})}
							{...rest}
						/>
					</div>

					{!preview && (
						<button className='px-2 text-gray-300' type='button'>
							<i className='fas fa-upload'></i>
						</button>
					)}
				</div>

				{!!preview && (
					<div className='flex gap-2 px-2'>
						{typeof value === 'string' && (
							<Link className='text-gray-300' href={value} target='_blank'>
								<i className='fas fa-download'></i>
							</Link>
						)}

						<button
							className='text-gray-300'
							type='button'
							onClick={() => {
								onChange(null)
								setPreview(undefined)
							}}
						>
							<i className='fas fa-xmark'></i>
						</button>
					</div>
				)}
			</div>

			{!!error && <span className='text-sm text-red-500'>{error}</span>}
		</div>
	)
}

interface FileInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		'value' | 'onChange'
	> {
	smallLabel?: boolean
	label?: string
	error?: string
	value: string | File | undefined
	onChange: React.Dispatch<React.SetStateAction<string | File | null>>
}
