import { ApolloError } from './functions/errors'
import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'

export const database = new PrismaClient()

type Request = {
	headers: {
		Authorization?: string
		authorization?: string
		'User-Agent'?: string
		'user-agent'?: string
		Language?: 'ar' | 'en'
		language?: 'ar' | 'en'
	}
	requestContext?: {
		identity?: {
			sourceIp?: string
		}
	}
	socket?: {
		remoteAddress?: string
	}
}

export default async function ContextSetup({
	headers,
	requestContext,
	socket,
}: Request) {
	const API_SECRET = process.env.API_SECRET

	if (!API_SECRET)
		throw new Error('The API_SECRET environment variable must be set')

	const config = await database.config.findFirst()
	if (!config)
		await database.config.create({
			data: {
				maintenanceMode: false,
				outboundNumber: process.env.ENABLEX_OUTBOUND_CALLER_ID,
			},
		})

	const token = headers.Authorization || headers.authorization
	const ip =
		requestContext?.identity?.sourceIp || socket?.remoteAddress || 'unknown'
	const userAgent = headers['User-Agent'] || headers['user-agent']
	const language = headers['Language'] || headers['language'] || 'en'

	if (!token) {
		if (config?.maintenanceMode) throw ApolloError('MAINTENANCE_ACTIVE')

		return {
			database,
			isAdmin: false,
			requireAuth() {
				throw ApolloError('NO_TOKEN')
			},
			ip,
			userAgent,
			language,
		}
	}

	const trimmedToken = token.replace(/^Bearer /i, '')

	const { id } = verify(trimmedToken, API_SECRET, (err, decoded) => {
		if (err) throw ApolloError('INVALID_TOKEN')

		return decoded
	}) as unknown as { id: string }

	const user = await database.user.update({
		where: { id },
		data: { lastSeen: new Date() },
		select: {
			id: true,
			role: true,
			authTokens: {
				orderBy: { createdAt: 'desc' },
				take: 1,
				select: { token: true },
			},
		},
	})

	const authToken = user.authTokens[0]

	if (!authToken || authToken.token !== trimmedToken)
		throw ApolloError('INVALID_TOKEN')

	if (config?.maintenanceMode && user.role !== 'ADMIN')
		throw ApolloError('MAINTENANCE_ACTIVE')

	return {
		database,
		user,
		isAdmin: user.role === 'ADMIN',
		requireAuth(authorization = true) {
			if (!authorization) throw ApolloError('UNAUTHORIZED')
		},
		ip,
		userAgent,
		language,
	}
}

export type Context = Awaited<ReturnType<typeof ContextSetup>>
