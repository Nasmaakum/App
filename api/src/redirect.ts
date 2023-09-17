import dotenv from 'dotenv'
dotenv.config()

const REDIRECT_URL = process.env.REDIRECT_URL
if (!REDIRECT_URL)
	throw new Error('The REDIRECT_URL environment variable must be set')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const redirectHandler = (event: any, _: void, callback: any) =>
	Promise.resolve(event)
		.then(() =>
			callback(null, {
				statusCode: 302,
				headers: { Location: REDIRECT_URL },
			}),
		)
		.catch(callback)
