require('dotenv').config()
import { database } from './context'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import Hash from './functions/hash'

const resetDemoAccount = async () => {
	const data: Prisma.UserCreateInput = {
		firstName: 'Demo',
		lastName: 'Account',
		country: 'Bahrain',
		city: 'Manama',
		cpr: '123456789',
		dateOfBirth: dayjs().toDate(),
		gender: 'MALE',
		language: 'ENGLISH',
		mobile: '123456789',
		email: 'demo@example.com',
		password: Hash('11111111'),
		role: 'USER',
		deleted: false,
	}

	await database.user.upsert({
		create: {
			...data,
			preferences: { create: {} },
		},
		update: data,
		where: { email: 'demo@example.com' },
	})
}

export const oneHour = async () => {
	//
}

export const oneDay = async () => {
	await resetDemoAccount()
}

export const tenMinutes = async () => {
	//
}

export const oneMinute = async () => {
	const oneMinuteAgo = dayjs().subtract(1, 'minute').toDate()

	await database.call.updateMany({
		where: { status: 'CALLING', updatedAt: { lte: oneMinuteAgo } },
		data: { status: 'FAILED', endedAt: new Date() },
	})

	await database.call.updateMany({
		where: { status: 'ANSWERED', updatedAt: { lte: oneMinuteAgo } },
		data: { status: 'ENDED', endedAt: new Date() },
	})

	await database.call.updateMany({
		where: { status: { in: ['ENDED', 'FAILED', 'REJECTED'] }, endedAt: null },
		data: { endedAt: new Date() },
	})

	await database.call.updateMany({
		where: {
			status: { in: ['ENDED', 'FAILED', 'REJECTED'] },
			serviceId: { not: null },
			serviceEndedAt: null,
		},
		data: { serviceEndedAt: new Date() },
	})
}
