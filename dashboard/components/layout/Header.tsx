import { $, GraphQLTypes, useTypedMutation, useTypedQuery } from 'api'
import { toast } from 'react-toastify'
import { useAuth } from '@/contexts/AuthContext'
import Button from '../form/Button'
import Modal from './Modal'
import React, { useState } from 'react'
import TextArea from '../form/TextArea'
import TextInput from '../form/TextInput'
import useForm from '@/hooks/useForm'

function MaintenanceMode(props: MaintenanceModeProps) {
	const { ...rest } = props

	const [showMaintenanceModePopup, setShowMaintenanceModePopup] =
		useState(false)

	const {
		data,
		loading: maintenanceModeLoading,
		refetch,
	} = useTypedQuery({
		maintenanceMode: { message: true },
	})

	const [toggleMaintenanceMode, { loading: toggleMaintenanceModeLoading }] =
		useTypedMutation(
			{ toggleMaintenanceMode: { message: true } },
			{
				apolloOptions: {
					onCompleted: ({ toggleMaintenanceMode }) => {
						refetch()
						setShowMaintenanceModePopup(false)
						if (toggleMaintenanceMode.message === 'Maintenance enabled')
							toast.warn('ENABLED MAINTENANCE MODE')
						else toast.warn('DISABLED MAINTENANCE MODE')
					},
				},
			},
		)

	const maintenanceModeActive =
		data?.maintenanceMode?.message === 'Maintenance enabled'

	const loading = maintenanceModeLoading || toggleMaintenanceModeLoading

	return (
		<Modal
			button={
				<button
					type='button'
					onClick={() => setShowMaintenanceModePopup(true)}
					{...rest}
				>
					<i
						className={`fa-solid fa-triangle-exclamation text-2xl ${
							maintenanceModeActive ? 'maintenance-mode-active' : ''
						} `}
					/>
				</button>
			}
			isOpen={showMaintenanceModePopup}
			title={
				maintenanceModeActive
					? 'Disable maintenance mode?'
					: 'Enable maintenance mode'
			}
			onClose={() => setShowMaintenanceModePopup(false)}
		>
			<div className='flex gap-4'>
				<Button
					className='flex-1'
					color={maintenanceModeActive ? 'green' : 'red'}
					loading={loading}
					type='button'
					onClick={() => toggleMaintenanceMode()}
				>
					{maintenanceModeActive ? 'DISABLE' : 'ENABLE'}
				</Button>
			</div>
		</Modal>
	)
}

interface MaintenanceModeProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function Notification(props: NotificationProps) {
	const { ...rest } = props

	const [showNotificationsPopup, setShowNotificationsPopup] = useState(false)

	const { onSubmit, getInputProps, reset, values, allowNavigation } = useForm<
		GraphQLTypes['SendNotificationInput']
	>({
		initialValues: {
			body: '',
			test: false,
			title: '',
		},
	})

	const [sendNotification, { loading }] = useTypedMutation(
		{
			sendNotification: [
				{ data: $('data', 'SendNotificationInput!') },
				{ message: true },
			],
		},
		{
			apolloOptions: {
				onCompleted: ({ sendNotification }) => {
					if (sendNotification.message === 'Test notification sent')
						toast.warn(sendNotification.message)
					else toast.success(sendNotification.message)

					allowNavigation()

					if (!values.test) reset()
				},
			},
		},
	)

	return (
		<Modal
			button={
				<button
					type='button'
					onClick={() => setShowNotificationsPopup(true)}
					{...rest}
				>
					<i className='fa-solid fa-bell text-2xl' />
				</button>
			}
			isOpen={showNotificationsPopup}
			title='Send notification'
		>
			<div className='flex flex-col gap-4'>
				<div className='md:text-md relative flex h-20 items-center gap-4 overflow-hidden rounded-3xl bg-[#191d2f] p-4 text-sm text-white'>
					<img
						alt='app icon'
						className='h-full rounded-2xl object-contain'
						src='/images/app-icon.png'
					/>

					<div className='flex flex-1 flex-col truncate'>
						<span
							className={
								values.title ? 'font-bold text-white' : 'text-transparent'
							}
						>
							{values.title || '.'}
						</span>

						<span className={values.body ? 'text-white' : 'text-transparent'}>
							{values.body || '.'}
						</span>
					</div>

					<span className='absolute right-4 top-4 text-sm text-[#9094a9]'>
						5m ago
					</span>
				</div>

				<form
					className='flex flex-1 flex-col gap-4'
					onSubmit={onSubmit(data => sendNotification({ variables: { data } }))}
				>
					<TextInput
						disabled={loading}
						label='Title'
						maxLength={65}
						required
						{...getInputProps('title')}
					/>

					<TextArea
						disabled={loading}
						label='Body'
						maxLength={178}
						required
						{...getInputProps('body')}
					/>

					<div className='mt-4 flex gap-4'>
						<Button
							className='flex-1'
							color='red'
							loading={loading}
							type='button'
							onClick={() => {
								reset()
								allowNavigation()
								setShowNotificationsPopup(false)
							}}
						>
							Cancel
						</Button>

						<Button className='flex-1' loading={loading} type='submit'>
							Send
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	)
}

interface NotificationProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Header(props: HeaderProps) {
	const { showSidebar, setShowSidebar } = props

	const { isLoggedIn, logout } = useAuth()

	return (
		<div className='fixed z-10 flex h-16 w-full items-center justify-between bg-gray-200 px-4 md:h-12'>
			{isLoggedIn ? (
				<>
					<div className='flex items-center gap-2'>
						<button
							className='md:hidden'
							type='button'
							onClick={() => setShowSidebar(val => !val)}
						>
							<i
								className={`fa-solid fa-bars text-2xl transition-all duration-200 ${
									showSidebar ? '-rotate-90' : ''
								} `}
							/>
						</button>

						<img
							alt='logo'
							className='h-8 px-2 md:px-0'
							src='/images/logo.png'
						/>
					</div>

					<div className='flex gap-4'>
						<div
							className={`flex gap-4 transition-all duration-300 ${
								showSidebar ? 'opacity-0' : ''
							}`}
						>
							<MaintenanceMode disabled={showSidebar} />
							<Notification disabled={showSidebar} />
						</div>

						<button type='button' onClick={() => logout()}>
							<i className='fa-solid fa-arrow-right-from-bracket text-2xl' />
						</button>
					</div>
				</>
			) : (
				<div className='flex flex-1 items-center justify-center'>
					<img alt='logo' className='h-12 md:h-8' src='/images/logo.png' />
				</div>
			)}
		</div>
	)
}

interface HeaderProps {
	showSidebar: boolean
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
}
