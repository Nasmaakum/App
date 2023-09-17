import { useRouter } from 'next/router'
import MenuItem from '../MenuItem'
import React, { useEffect } from 'react'

export default function Sidebar(props: SidebarProps) {
	const { showSidebar, setShowSidebar } = props

	const { pathname } = useRouter()

	useEffect(() => {
		setShowSidebar(false)
	}, [pathname])

	return (
		<div
			className={`fixed bottom-0 top-16 z-20 flex overflow-hidden transition-width duration-200 md:relative md:top-0 md:z-0 md:w-48 ${
				showSidebar ? 'w-full md:w-48' : 'w-0'
			}`}
		>
			<div className='flex h-full w-5/6 min-w-max flex-col overflow-y-scroll bg-gray-100 py-4 md:w-48'>
				<div className='flex flex-col gap-4'>
					<MenuItem
						active={pathname === '/'}
						icon='fa-solid fa-gauge'
						title='Overview'
						href='/'
					/>

					<MenuItem
						active={pathname.includes('/users')}
						href='/users'
						icon='fa-solid fa-users'
						title='Users'
					/>

					<MenuItem
						title='Interpreters'
						icon='fa-solid fa-user-tie'
						active={pathname.includes('/interpreters')}
					>
						<MenuItem.SubItem
							active={pathname === '/interpreters'}
							href='/interpreters'
							title='Overview'
						/>

						<MenuItem.SubItem
							title='Call logs'
							href='/interpreters/call-logs'
							active={pathname === '/interpreters/call-logs'}
						/>

						<MenuItem.SubItem
							title='Applications'
							href='/interpreters/applications'
							active={pathname === '/interpreters/applications'}
						/>
					</MenuItem>

					<MenuItem
						title='Services'
						icon='fa-solid fa-concierge-bell'
						active={pathname.includes('/services')}
					>
						<MenuItem.SubItem
							title='Overview'
							href='/services'
							active={pathname === '/services'}
						/>

						<MenuItem.SubItem
							title='Categories'
							href='/services/categories'
							active={pathname === '/services/categories'}
						/>
					</MenuItem>

					<MenuItem
						title='Advertisements'
						icon='fa-solid fa-ad'
						href='/advertisements'
						active={pathname.includes('/advertisements')}
					/>

					<MenuItem
						title='Ratings'
						icon='fa-solid fa-star'
						active={pathname.includes('/ratings')}
					>
						<MenuItem.SubItem
							title='Overview'
							href='/ratings'
							active={pathname === '/ratings'}
						/>

						<MenuItem.SubItem
							title='Ratings Options'
							href='/ratings/options'
							active={pathname === '/ratings/options'}
						/>
					</MenuItem>

					<MenuItem
						active={pathname.includes('/information')}
						icon='fa-solid fa-info-circle'
						title='Information'
					>
						<MenuItem.SubItem
							active={pathname === '/information/about'}
							href='/information/about'
							title='About'
						/>

						<MenuItem.SubItem
							active={pathname === '/information/privacy-policy'}
							href='/information/privacy-policy'
							title='Privacy Policy'
						/>

						<MenuItem.SubItem
							active={pathname === '/information/terms-of-use'}
							href='/information/terms-of-use'
							title='Terms of Use'
						/>

						<MenuItem.SubItem
							active={pathname === '/information/frequently-asked-questions'}
							href='/information/frequently-asked-questions'
							title='FAQs'
						/>
					</MenuItem>
				</div>
			</div>

			<div
				className='h-full flex-1 bg-black opacity-70 duration-0 md:hidden'
				onClick={() => setShowSidebar(false)}
			/>
		</div>
	)
}

interface SidebarProps {
	showSidebar: boolean
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
}
