import { deleteFile, uploadFile } from '@404-software/s3-upload'
import { Prisma } from '@prisma/client'
import { Resolvers } from '../../gql-types'

export default {
	Advertisement: {
		async title({ titleEn, titleAr }, _, { language }) {
			return language === 'ar' ? titleAr : titleEn
		},

		async content({ contentEn, contentAr }, _, { language }) {
			return language === 'ar' && contentAr ? contentAr : contentEn
		},

		async views({ views }, _, { isAdmin }) {
			if (!isAdmin) return 0

			return views
		},
	},

	Query: {
		async advertisement(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.advertisement.findUniqueOrThrow(input)
		},

		async advertisements(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.advertisement.findMany(input)
		},

		async advertisementsCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.advertisement.count(input)
		},

		async activeAdvertisements(_, __, { database }) {
			const advertisements = await database.advertisement.findMany({
				where: { active: true },
			})

			await database.advertisement.updateMany({
				where: { id: { in: advertisements.map(({ id }) => id) } },
				data: { views: { increment: 1 } },
			})

			return advertisements
		},
	},

	Mutation: {
		async createAdvertisement(
			_,
			{ data: { image, active, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.AdvertisementCreateInput = {
				...rest,
				active,
				image: await uploadFile({ folder: 'advertisements', file: image }),
			}

			if (active)
				await database.advertisement.updateMany({ data: { active: false } })

			return await database.advertisement.create({ data })
		},

		async updateAdvertisement(
			_,
			{ where, data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.AdvertisementUpdateInput = rest

			if (image && typeof image !== 'string') {
				const advertisement = await database.advertisement.findUniqueOrThrow({
					where,
				})

				data.image = await uploadFile({
					folder: 'advertisement',
					file: image,
				})

				await deleteFile({ file: advertisement.image })
			}

			return await database.advertisement.update({ where, data })
		},

		async deleteAdvertisement(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.advertisement.delete(input)
		},

		async activateAdvertisement(
			_,
			{ where },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			await database.advertisement.updateMany({ data: { active: false } })

			return await database.advertisement.update({
				where,
				data: { active: true },
			})
		},
	},
} as Resolvers
