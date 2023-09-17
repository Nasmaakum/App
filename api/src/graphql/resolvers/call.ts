import { ApolloError } from '../../functions/errors'
import { createEnablexRoom, createEnablexToken } from '../../functions/enablex'
import { Resolvers } from '../../gql-types'

export default {
	Call: {
		async from({ fromId }, _, { database }) {
			return await database.user.findUniqueOrThrow({
				where: { id: fromId },
			})
		},

		async to({ toId }, _, { database }) {
			return await database.interpreter.findUniqueOrThrow({
				where: { id: toId },
			})
		},

		async service({ serviceId }, _, { database }) {
			if (!serviceId) return null

			return await database.service.findUniqueOrThrow({
				where: { id: serviceId },
			})
		},
	},

	Query: {
		async call(_, { where }, { database, requireAuth, user }) {
			requireAuth()

			return await database.call.findFirst({
				where: {
					...where,
					OR: [{ from: { id: user?.id } }, { to: { userId: user?.id } }],
				},
			})
		},

		async calls(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.call.findMany(input)
		},

		async callsCount(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.call.count(input)
		},

		async outboundNumber(_, __, { database, requireAuth }) {
			requireAuth()

			// const config = await database.config.findFirstOrThrow()

			// if (!config.outboundNumber)
			// 	throw ApolloError('INTERNAL_ERROR', 'Outbound number not configured')

			// return config.outboundNumber
			return '17084143848'
		},
	},

	Mutation: {
		async activeCall(_, __, { database, requireAuth, user }) {
			requireAuth()

			return await database.call.findFirst({
				where: {
					to: { userId: user?.id },
					status: { in: ['CALLING'] },
				},
			})
		},

		async startCall(_, { where: { id } }, { database, requireAuth, user }) {
			requireAuth()

			const interpreter = await database.interpreter.findFirstOrThrow({
				where: { id, status: 'APPROVED', online: true },
				include: {
					calls: { where: { status: { in: ['CALLING', 'ANSWERED'] } } },
				},
			})

			const canCall = interpreter.calls.length === 0

			if (!canCall) throw ApolloError('INTERPRETER_BUSY')

			return await database.call.create({
				data: {
					from: { connect: { id: user?.id } },
					to: { connect: { id } },
				},
			})
		},

		async endCall(_, __, { database, requireAuth, user }) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					OR: [{ from: { id: user?.id } }, { to: { userId: user?.id } }],
					status: { in: ['ANSWERED', 'CALLING'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			return await database.call.update({
				where: { id: call.id },
				data: {
					status: call.status === 'ANSWERED' ? 'ENDED' : 'FAILED',
					endedAt: call.status === 'ANSWERED' ? new Date() : undefined,
				},
			})
		},

		async connectService(_, { data: { id } }, { database, requireAuth, user }) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					OR: [{ from: { id: user?.id } }, { to: { userId: user?.id } }],
					status: { in: ['ANSWERED'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			return await database.call.update({
				where: { id: call.id },
				data: { service: { connect: { id } }, serviceCalledAt: new Date() },
			})
		},

		async disconnectService(_, __, { database, requireAuth, user }) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					OR: [{ from: { id: user?.id } }, { to: { userId: user?.id } }],
					status: { in: ['ANSWERED'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			return await database.call.update({
				where: { id: call.id },
				data: { serviceEndedAt: new Date() },
			})
		},

		async keepCallAlive(
			_,
			{ where: { id }, data: { getToken } },
			{ database, requireAuth, user },
		) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					id,
					OR: [{ from: { id: user?.id } }, { to: { userId: user?.id } }],
					status: { in: ['CALLING', 'ANSWERED'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			const updatedCall = await database.call.update({
				where: { id },
				data: { updatedAt: new Date() },
			})

			if (getToken && updatedCall.roomID) {
				const myUser = await database.user.findUniqueOrThrow({
					where: { id: user?.id },
				})

				const { token } = await createEnablexToken(updatedCall.roomID, {
					name: `${myUser.firstName} ${myUser.lastName}`,
					role: 'moderator',
					user_ref: myUser.id,
				})

				return {
					token,
					...updatedCall,
				}
			}

			return updatedCall
		},

		async answerCall(_, __, { database, requireAuth, user }) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					to: { userId: user?.id },
					status: { in: ['CALLING'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			const myUser = await database.user.findUniqueOrThrow({
				where: { id: user?.id },
			})

			const { room } = await createEnablexRoom({
				name: call.id,
				owner_ref: call.fromId,
				enabled: true,
				settings: {
					mode: 'group',
					moderators: '2',
					auto_recording: true,
					participants: '2',
					duration: 30,
					scheduled: false,
					scheduled_time: '',
					// live_recording:
					// 	process.env.NODE_ENV !== 'development' ? true : undefined,
				},
			})

			const { token } = await createEnablexToken(room.room_id, {
				name: `${myUser.firstName} ${myUser.lastName}`,
				role: 'moderator',
				user_ref: myUser.id,
			})

			const updatedCall = await database.call.update({
				where: { id: call.id },
				data: {
					status: 'ANSWERED',
					startedAt: new Date(),
					roomID: room.room_id,
				},
			})

			return {
				token,
				...updatedCall,
			}
		},

		async rejectCall(_, __, { database, requireAuth, user }) {
			requireAuth()

			const call = await database.call.findFirst({
				where: {
					to: { userId: user?.id },
					status: { in: ['CALLING'] },
				},
			})

			if (!call) throw ApolloError('UNAUTHORIZED')

			return await database.call.update({
				where: { id: call.id },
				data: { status: 'REJECTED' },
			})
		},
	},
} as Resolvers
