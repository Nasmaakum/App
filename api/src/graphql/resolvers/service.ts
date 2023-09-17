import { deleteFile, uploadFile } from '@404-software/s3-upload'
import { Prisma } from '@prisma/client'
import { Resolvers } from '../../gql-types'

export default {
	Service: {
		async category({ categoryId }, _, { database }) {
			if (!categoryId) return null

			return await database.serviceCategory.findUniqueOrThrow({
				where: { id: categoryId },
			})
		},

		async name({ nameEn, nameAr }, _, { language }) {
			return language === 'ar' ? nameAr : nameEn
		},

		async description({ descriptionEn, descriptionAr }, _, { language }) {
			return language === 'ar' ? descriptionAr : descriptionEn
		},
	},

	Query: {
		async service(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.service.findUnique(input)
		},

		async services(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.service.findMany(input)
		},

		async servicesCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.service.count(input)
		},
	},

	Mutation: {
		async createService(
			_,
			{ data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.ServiceCreateInput = {
				...rest,
				image: await uploadFile({ folder: 'services', file: image }),
			}

			return await database.service.create({ data })
		},

		async updateService(
			_,
			{ where, data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.ServiceUpdateInput = rest

			if (image && typeof image !== 'string') {
				const service = await database.service.findUniqueOrThrow({
					where,
				})

				data.image = await uploadFile({
					folder: 'services',
					file: image,
				})

				await deleteFile({ file: service.image })
			}

			return await database.service.update({ where, data })
		},

		async deleteService(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.service.delete(input)
		},
	},
} as Resolvers
