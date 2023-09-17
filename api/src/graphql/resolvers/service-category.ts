import { deleteFile, uploadFile } from '@404-software/s3-upload'
import { Prisma } from '@prisma/client'
import { Resolvers } from '../../gql-types'

export default {
	ServiceCategory: {
		async services({ id }, _, { database }) {
			return await database.service.findMany({
				where: { categoryId: id },
			})
		},

		async title({ titleEn, titleAr }, _, { language }) {
			return language === 'ar' ? titleAr : titleEn
		},
	},

	Query: {
		async serviceCategory(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.serviceCategory.findUnique(input)
		},

		async serviceCategories(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.serviceCategory.findMany(input)
		},

		async serviceCategoriesCount(_, input, { database, requireAuth }) {
			requireAuth()

			return await database.serviceCategory.count(input)
		},
	},

	Mutation: {
		async createServiceCategory(
			_,
			{ data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.ServiceCategoryCreateInput = {
				...rest,
				image: await uploadFile({
					folder: 'service-categories',
					file: image,
				}),
			}

			return await database.serviceCategory.create({ data })
		},

		async updateServiceCategory(
			_,
			{ where, data: { image, ...rest } },
			{ database, requireAuth, isAdmin },
		) {
			requireAuth(isAdmin)

			const data: Prisma.ServiceCategoryUpdateInput = rest

			if (image && typeof image !== 'string') {
				const serviceCategory =
					await database.serviceCategory.findUniqueOrThrow({
						where,
					})

				data.image = await uploadFile({
					folder: 'service-categories',
					file: image,
				})

				await deleteFile({ file: serviceCategory.image })
			}

			return await database.serviceCategory.update({ where, data })
		},

		async deleteServiceCategory(_, input, { database, requireAuth, isAdmin }) {
			requireAuth(isAdmin)

			return await database.serviceCategory.delete(input)
		},
	},
} as Resolvers
