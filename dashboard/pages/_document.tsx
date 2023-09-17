import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<link
					crossOrigin='anonymous'
					href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
					integrity='sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=='
					referrerPolicy='no-referrer'
					rel='stylesheet'
				/>
				<link href='/images/favicon.png' rel='icon' />

				<meta content='nasmaakum' name='description' />
				<meta content='#946FD6' name='theme-color' />
			</Head>
			<body>
				<Main />
				<div id='portal' />
				<NextScript />
			</body>
		</Html>
	)
}
