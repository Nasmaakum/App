import 'react-image-crop/dist/ReactCrop.css'
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { useEffect, useRef, useState } from 'react'
import ActionIcon from '../ActionIcon'
import Button from './Button'
import imageCompression from 'browser-image-compression'
import Label from './Label'
import Modal from '../layout/Modal'
import ReactCrop, { Crop, makeAspectCrop, PixelCrop } from 'react-image-crop'

function CropImage(props: CropImageProps) {
	const { src, onCompleted, onClose, show, variant } = props

	const [imageLoaded, setImageLoaded] = useState(false)
	const [crop, setCrop] = useState<Crop>({
		height: 100,
		unit: '%',
		width: 100,
		x: 0,
		y: 0,
	})
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>({
		height: 100,
		unit: 'px',
		width: 100,
		x: 0,
		y: 0,
	})
	const [cropLoading, setCropLoading] = useState(false)

	const imgRef = useRef<HTMLImageElement>(null)
	const previewCanvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!imageLoaded || !imgRef.current) return

		const width = imgRef.current.clientWidth
		const height = imgRef.current.clientHeight
		const aspectRatio = variant === 'square' ? 1 : 9 / 16

		const cropWidth = Math.min(width, height * aspectRatio)
		const cropHeight = cropWidth / aspectRatio

		setCompletedCrop({
			height: cropHeight,
			unit: 'px',
			width: cropWidth,
			x: 0,
			y: 0,
		})

		setCrop(
			makeAspectCrop(
				{
					height: cropHeight / height,
					unit: '%',
					width: cropWidth / width,
					x: 0,
					y: 0,
				},
				aspectRatio,
				width,
				height,
			),
		)
	}, [imageLoaded, variant])

	useEffect(() => {
		if (
			!completedCrop?.width ||
			!completedCrop?.height ||
			!imgRef.current ||
			!previewCanvasRef.current
		)
			return

		canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
	}, [completedCrop, crop])

	async function handleCropImage() {
		setCropLoading(true)

		const canvas = previewCanvasRef.current

		if (!canvas) {
			throw new Error('Crop canvas does not exist')
		}
		const dataURL = previewCanvasRef.current.toDataURL('image/jpeg', 0.8)
		const file = dataURLtoFile(dataURL, 'crop.jpg')

		function dataURLtoFile(dataURL: string, filename: string) {
			const arr = dataURL.split(',')
			const mime = arr[0].match(/:(.*?);/)?.[1]
			const bstr = atob(arr[1])
			let n = bstr.length
			const u8arr = new Uint8Array(n)
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n)
			}
			return new File([u8arr], filename, { type: mime })
		}

		const compressedImage = await imageCompression(file, {
			maxSizeMB: 0.7,
			maxWidthOrHeight: 1200,
		})

		onCompleted(compressedImage)

		handleCloseModal()
		setCropLoading(false)
	}

	const handleCloseModal = () => {
		setImageLoaded(false)
		onClose()
	}

	return (
		<Modal
			isOpen={show}
			title={`Crop Image - ${
				variant === 'square' ? 'Aspect 1' : 'Aspect 9/16'
			}`}
		>
			<div className='flex flex-col gap-12'>
				<div
					ref={containerRef}
					className={`flex ${
						variant === 'square' ? 'aspect-square' : 'aspect-[9 / 16]'
					} items-center justify-center overflow-hidden`}
					style={{ height: containerRef.current?.clientWidth }}
				>
					<ReactCrop
						aspect={variant === 'square' ? 1 : 9 / 16}
						crop={crop}
						minHeight={100}
						minWidth={100}
						style={{ maxHeight: containerRef.current?.clientWidth }}
						ruleOfThirds
						onChange={(c, percentCrop) => {
							setCompletedCrop(c)
							setCrop(percentCrop)
						}}
					>
						<img ref={imgRef} src={src} onLoad={() => setImageLoaded(true)} />
					</ReactCrop>
				</div>

				<div className='flex gap-4'>
					<Button
						className='flex-1'
						color='red'
						disabled={!imageLoaded}
						loading={cropLoading}
						type='button'
						onClick={handleCloseModal}
					>
						Cancel
					</Button>

					<Button
						className='flex-1'
						color='blue'
						disabled={!imageLoaded}
						loading={cropLoading}
						type='button'
						onClick={handleCropImage}
					>
						Crop
					</Button>
				</div>

				<canvas ref={previewCanvasRef} className='hidden' />
			</div>
		</Modal>
	)
}

interface CropImageProps {
	src: string
	onCompleted: (img: File) => void
	show: boolean
	onClose: () => void
	variant: 'square' | 'rectangle'
}

async function canvasPreview(
	image: HTMLImageElement,
	canvas: HTMLCanvasElement,
	crop: PixelCrop,
	scale = 1,
	rotate = 0,
) {
	const ctx = canvas.getContext('2d')

	if (!ctx) {
		throw new Error('No 2d context')
	}

	const scaleX = image.naturalWidth / image.width
	const scaleY = image.naturalHeight / image.height
	const pixelRatio = window.devicePixelRatio

	canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
	canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

	ctx.scale(pixelRatio, pixelRatio)
	ctx.imageSmoothingQuality = 'low'

	const cropX = crop.x * scaleX
	const cropY = crop.y * scaleY

	const cropWidth = crop.width * scaleX
	const cropHeight = crop.height * scaleY

	ctx.save()
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.rotate((rotate * Math.PI) / 180)
	ctx.translate(-canvas.width / 2, -canvas.height / 2)
	ctx.drawImage(
		image,
		cropX,
		cropY,
		cropWidth,
		cropHeight,
		0,
		0,
		cropWidth * scale,
		cropHeight * scale,
	)
	ctx.restore()
}

export default function ImageInput(props: Props) {
	const {
		label,
		required = false,
		compact = false,
		disabled,
		value,
		onChange,
		error,
		variant = 'square',
	} = props

	const [cropSrc, setCropSrc] = useState('')
	const [preview, setPreview] = useState<string | null>(null)

	useEffect(() => {
		if (!value) {
			setPreview(null)
			return
		}
		setPreview(typeof value === 'string' ? value : URL.createObjectURL(value))
	}, [value])

	const [inputKey, setInputKey] = useState(0)

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/*': ['.jpeg', '.png'],
		},
		maxFiles: 1,
		onDrop: async acceptedFiles => {
			if (!acceptedFiles[0]) return

			const file = await imageCompression(acceptedFiles[0], {
				maxSizeMB: 10,
				maxWidthOrHeight: 1200,
			})

			setCropSrc(URL.createObjectURL(file))

			setInputKey(prev => prev + 1)
		},
		onDropRejected: () => toast.error('File type not supported'),
	})

	return (
		<>
			<div className='flex flex-1 flex-col gap-2'>
				<Label label={label} required={required} />

				<div
					className={`relative ${
						variant === 'square' ? 'aspect-square' : 'aspect-[9/16]'
					} w-full rounded-md border-2 bg-white`}
				>
					<div
						{...getRootProps({
							className:
								'overflow-hidden h-full flex justify-center items-center',
						})}
					>
						<input
							{...getInputProps({
								className:
									'absolute top-0 left-0 right-0 bottom-0 !block opacity-0',
								disabled,
								key: inputKey,
								multiple: false,
								required: required && !preview,
							})}
						/>

						{preview ? (
							<div className='h-full w-full overflow-hidden rounded-sm'>
								<img
									alt='Image'
									className='aspect-square h-full w-full overflow-hidden rounded-sm object-contain'
									src={preview || undefined}
								/>

								{compact ? (
									<ActionIcon
										className='absolute bottom-4 left-4 text-sm'
										color='blue'
									>
										<i className='fa-solid fa-shuffle'></i>
									</ActionIcon>
								) : (
									<Button
										className='absolute bottom-4 left-4 text-sm'
										type='button'
										compact
									>
										CHANGE IMAGE
									</Button>
								)}
							</div>
						) : (
							<div className='flex items-center justify-center'>
								<i className='fa-solid fa-image text-9xl opacity-10' />

								<Button
									className='absolute bottom-4 left-4 text-sm'
									type='button'
									compact
								>
									ADD IMAGE
								</Button>
							</div>
						)}
					</div>

					{preview && (
						<ActionIcon
							className='absolute right-2 top-2'
							color='cyan'
							href={preview}
							target='_blank'
						>
							<i className='fa-solid fa-external-link' />
						</ActionIcon>
					)}

					{preview &&
						(compact ? (
							<ActionIcon
								className='absolute bottom-2 right-2 text-sm'
								color='red'
								onClick={() => {
									onChange(null)
									setPreview(null)
								}}
							>
								<i className='fa-solid fa-trash' />
							</ActionIcon>
						) : (
							<Button
								className='absolute bottom-4 right-4 text-sm'
								color='red'
								compact
								onClick={() => {
									onChange(null)
									setPreview(null)
								}}
							>
								DELETE IMAGE
							</Button>
						))}
				</div>

				{!!error && <span className='text-smtext-red-500'>{error}</span>}
			</div>

			<CropImage
				show={!!cropSrc}
				src={cropSrc}
				variant={variant}
				onClose={() => setCropSrc('')}
				onCompleted={onChange}
			/>
		</>
	)
}

interface Props {
	label?: string
	required?: boolean
	disabled?: boolean
	compact?: boolean
	error?: string
	value: string | File
	variant?: 'square' | 'rectangle'
	onChange: (image?: string | File | null) => void
}
