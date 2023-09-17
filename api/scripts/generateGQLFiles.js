/* eslint-disable no-console */
const { prompt } = require('enquirer')
const fs = require('fs')
const pluralize = require('pluralize')

const createResolver = ({ singular, plural }) => {
	const upperSingular = singular.charAt(0).toUpperCase() + singular.slice(1)

	return `
  import { Resolvers } from '../../gql-types'

  export default {
    Query: {
      async ${singular}(_, input, { database, requireAuth }) {
        requireAuth()

        return await database.${singular}.findUnique(input)
      },

      async ${plural}(_, input, { database, requireAuth }) {
        requireAuth()

        return await database.${singular}.findMany(input)
      },

      async ${plural}Count(_, input, { database, requireAuth }) {
        requireAuth()

        return await database.${singular}.count(input)
      },
    },

    Mutation: {
      async create${upperSingular}(_, { data }, { database, requireAuth, isAdmin }) {
        requireAuth(isAdmin)

        return await database.${singular}.create({ data })
      },

      async update${upperSingular}(_, { data, where }, { database, requireAuth, isAdmin }) {
        requireAuth(isAdmin)

        return await database.${singular}.update({ where, data })
      },

      async delete${upperSingular}(_, input, { database, requireAuth, isAdmin }) {
        requireAuth(isAdmin)

        return await database.${singular}.delete(input)
      },
    },
  } as Resolvers
  `
}

const createSchema = ({ singular, plural }) => {
	const upperSingular = singular.charAt(0).toUpperCase() + singular.slice(1)

	return `
  extend type Query {
    ${singular}(where: ${upperSingular}WhereUniqueInput!): ${upperSingular}!
    ${plural}(
      where: ${upperSingular}WhereInput = {}
      orderBy: [${upperSingular}OrderByInput!] = [{ createdAt: "desc" }]
      take: Int = 10
      skip: Int = 0
    ): [${upperSingular}!]!
    ${plural}Count(where: ${upperSingular}WhereInput = {}): Int!
  }
  
  extend type Mutation {
    create${upperSingular}(data: ${upperSingular}CreateInput!): ${upperSingular}!
    update${upperSingular}(where: ${upperSingular}WhereUniqueInput!, data: ${upperSingular}UpdateInput!): ${upperSingular}!
    delete${upperSingular}(where: ${upperSingular}WhereUniqueInput!): ${upperSingular}!
  }
  
  
  type ${upperSingular} {
    id: ID!
  
    createdAt: Date!
    updatedAt: Date!
  }
  
  input ${upperSingular}WhereUniqueInput {
    id: ID
  }
  
  input ${upperSingular}WhereInput {
    AND: [${upperSingular}WhereInput!]
    OR: [${upperSingular}WhereInput!]
    NOT: [${upperSingular}WhereInput!]
    id: IDFilter
  }
  
  input ${upperSingular}CreateInput {
    
  }
  
  input ${upperSingular}UpdateInput {

  }
  
  
  input ${upperSingular}OrderByInput {
    id: OrderDirection
  
    createdAt: OrderDirection
}  
  `
}

const run = async () => {
	try {
		const { singular } = await prompt([
			{
				type: 'input',
				name: 'singular',
				message: 'What is the singular name in camelCase? (e.g. userAddress)',
			},
		])

		if (!singular) return console.error('Please provide a name')

		const fileName = singular
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.replace(/\s+/g, '-')
			.toLowerCase()

		const plural = pluralize.plural(singular)

		const path = `./src/graphql`

		const resolver = fs.createWriteStream(`${path}/resolvers/${fileName}.ts`)
		resolver.write(createResolver({ singular, plural }))
		resolver.end()

		const schema = fs.createWriteStream(`${path}/schemas/${fileName}.graphql`)
		schema.write(createSchema({ singular, plural }))
		schema.end()
	} catch (error) {
		console.log(error)
	}
}

run()
