import { ApolloError } from '../../functions/errors'
import { Resolvers } from '../../gql-types'
import dayjs from 'dayjs'

export default {
	InterpreterUser: {
		fullName({ firstName, lastName }) {
			return `${firstName} ${lastName}`
		},
	},

	Interpreter: {
		async online({ online, userId }, _, { database }) {
			const user = await database.user.findUniqueOrThrow({
				where: { id: userId },
			})

			const isActive = dayjs().diff(dayjs(user.lastSeen), 'minute') < 5

			return online && isActive
		},

		async isBusy({ id }, _, { database }) {
			const interpreter = await database.interpreter.findFirstOrThrow({
				where: { id },
				include: {
					calls: { where: { status: { in: ['CALLING', 'ANSWERED'] } } },
				},
			})

			return interpreter.calls.length !== 0
		},

		async user({ userId }, _, { database }) {
			return await database.user.findUniqueOrThrow({
				where: { id: userId },
				select: {
					id: true,
					firstName: true,
					lastName: true,
					image: true,
				},
			})
		},

		async isFavorite({ id }, _, { database, user }) {
			const value = await database.interpreter.findFirst({
				where: { id, favoriteBy: { some: { id: user?.id } } },
			})

			return !!value
		},

		async ratings({ id }, _, { database, isAdmin }) {
			return await database.interpreterRating.findMany({
				where: { interpreterId: id, approved: isAdmin ? undefined : true },
			})
		},

		async rating({ id }, _, { database }) {
			const ratings = await database.interpreterRating.findMany({
				where: { interpreterId: id, approved: true },
				select: { rating: true },
			})

			return (
				Math.round(
					ratings.reduce((acc, { rating }) => acc + rating, 0) / ratings.length,
				) || 3
			)
		},
	},

	Query: {
		async myAvailability(_, __, { user, database, requireAuth }) {
			requireAuth(user?.role === 'INTERPRETER')

			const interpreter = await database.interpreter.findUniqueOrThrow({
				where: { userId: user?.id },
				select: { online: true },
			})

			return interpreter.online
		},

		async interpreter(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.interpreter.findUnique(input)
		},

		async interpreters(_, input, { database, requireAuth, isAdmin }) {
			requireAuth()

			return await database.interpreter.findMany({
				...input,
				where: {
					...input.where,
					status: isAdmin ? undefined : 'APPROVED',
				},
			})
		},

		async interpretersCount(_, input, { database, requireAuth, isAdmin }) {
			requireAuth()

			return await database.interpreter.count({
				...input,
				where: {
					...input.where,
					status: isAdmin ? undefined : 'APPROVED',
				},
			})
		},
	},

	Mutation: {
		async updateMyInterpreter(_, { data }, { database, requireAuth, user }) {
			requireAuth()

			return await database.interpreter.update({
				data,
				where: { userId: user?.id },
			})
		},

		async approveInterpreter(_, { where }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			const interpreter = await database.interpreter.findUniqueOrThrow({
				where,
				select: { status: true },
			})

			if (interpreter.status !== 'PENDING')
				throw ApolloError(
					'MALFORMED_INPUT',
					'Interpreter application is not pending',
				)

			return await database.interpreter.update({
				where,
				data: { status: 'APPROVED' },
			})
		},

		async rejectInterpreter(_, { where }, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			const interpreter = await database.interpreter.findUniqueOrThrow({
				where,
				select: { status: true },
			})

			if (interpreter.status !== 'PENDING')
				throw ApolloError(
					'MALFORMED_INPUT',
					'Interpreter application is not pending',
				)

			return await database.interpreter.update({
				where,
				data: { status: 'REJECTED' },
			})
		},

		async updateInterpreter(
			_,
			{ data, where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			return await database.interpreter.update({ where, data })
		},

		async toggleInterpreterAvailability(
			_,
			__,
			{ database, requireAuth, user },
		) {
			requireAuth()

			const interpreter = await database.interpreter.findUniqueOrThrow({
				where: { userId: user?.id },
				select: { id: true, online: true },
			})

			await database.interpreter.update({
				where: { id: interpreter.id },
				data: { online: !interpreter.online },
			})

			return !interpreter.online
		},

		async toggleFavoriteInterpreter(
			_,
			{ where: { id } },
			{ database, requireAuth, user },
		) {
			requireAuth()

			const isFavorite = await database.interpreter.findFirst({
				where: { id, favoriteBy: { some: { id: user?.id } } },
				select: { id: true },
			})

			await database.interpreter.update({
				where: { id },
				data: {
					favoriteBy: {
						connect: isFavorite ? undefined : { id: user?.id },
						disconnect: isFavorite ? { id: user?.id } : undefined,
					},
				},
			})

			return !isFavorite
		},
	},
} as Resolvers
