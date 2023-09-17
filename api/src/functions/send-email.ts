import { ApolloError } from './errors'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = +(process.env.SMTP_PORT || 465)
const SMTP_EMAIL = process.env.SMTP_EMAIL
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const NAME = process.env.NAME
const SLOGAN = process.env.SLOGAN

if (!SMTP_HOST || !SMTP_EMAIL || !SMTP_PASSWORD || !NAME || !SLOGAN)
	throw new Error(
		'The SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD, NAME, and SLOGAN environment variables must be set',
	)

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
})

export default async function (mailOptions: Omit<MailOptions, 'from'>) {
	const options: MailOptions = {
		from: `${NAME} - ${SLOGAN} <${SMTP_EMAIL}>`,
		...mailOptions,
	}

	await new Promise<void>(resolve => {
		transporter.sendMail(options, err => {
			if (err) throw ApolloError('INTERNAL_ERROR')

			resolve()
		})
	})
}
