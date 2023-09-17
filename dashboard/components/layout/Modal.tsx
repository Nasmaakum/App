import { createPortal } from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'
import React, { useEffect, useRef, useState } from 'react'

function ModalProvider(props: ModalProviderProps) {
	const { title, children, isOpen, onClose } = props

	const ref = useRef<Element | null>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		ref.current = document.querySelector<HTMLElement>('#portal')
		setMounted(true)
	}, [])

	if (!mounted || !ref.current) return null

	return createPortal(
		<>
			{isOpen && (
				<RemoveScroll>
					<div className='fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
						<div className='relative max-h-screen w-full rounded-md bg-white shadow-2xl md:w-96'>
							<div className='flex items-center justify-between p-4'>
								<span className='text-lg font-bold'>{title}</span>

								{onClose && (
									<button type='button' onClick={() => onClose()}>
										<i className='fa-solid fa-xmark text-2xl' />
									</button>
								)}
							</div>

							<div className='p-4'>{children}</div>
						</div>
					</div>
				</RemoveScroll>
			)}
		</>,
		ref.current,
	)
}

interface ModalProviderProps {
	title?: string
	isOpen: boolean
	onClose?: () => void
	children: React.ReactNode
}

export default function Modal(props: ModalProps) {
	const { children, button, ...rest } = props

	return (
		<>
			<ModalProvider {...rest}>{children}</ModalProvider>

			{button}
		</>
	)
}

interface ModalProps extends ModalProviderProps {
	button?: React.ReactNode
}
