import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import APIProvider from '@/providers/APIProvider'
import AuthProvider, { useAuth } from '@/contexts/AuthContext'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
	const { isLoggedIn, authLoading } = useAuth()
	const router = useRouter()

	const [showSidebar, setShowSidebar] = useState(false)

	useEffect(() => {
		setShowSidebar(false)
	}, [router.pathname])

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 text-gray-900'>
			<Header setShowSidebar={setShowSidebar} showSidebar={showSidebar} />

			<div className='mt-16 flex flex-1 md:mt-12 '>
				{isLoggedIn && (
					<Sidebar setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
				)}

				<div className='flex flex-1 justify-center'>
					<div className='flex max-w-7xl flex-1 p-4'>
						{authLoading ? null : <Component pageProps={pageProps} />}

						<ToastContainer position='bottom-right' />
					</div>
				</div>
			</div>

			<Footer />
		</div>
	)
}

function withProviders(
	App: ({ Component, pageProps }: AppProps) => JSX.Element,
) {
	return (props: AppProps) => (
		<AuthProvider>
			<APIProvider>
				<App {...props} />
			</APIProvider>
		</AuthProvider>
	)
}

export default withProviders(App)
