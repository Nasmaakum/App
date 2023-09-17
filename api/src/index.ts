require('dotenv').config()
import { ApolloServer as ApolloDevServer } from 'apollo-server-express'
import { ApolloServer } from 'apollo-server-lambda'
import { graphqlUploadExpress } from 'graphql-upload'
import ContextSetup from './context'
import express from 'express'
import schema from './graphql/mappers'

const app = express()
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))

const server = new ApolloServer({
	schema,
	context: async ({ event }) => await ContextSetup(event),
})

export const serverHandler = server.createHandler({
	expressAppFromMiddleware(middleware) {
		app.use(middleware)

		return app
	},
	expressGetMiddlewareOptions: { cors: { origin: '*', credentials: true } },
})

async function startDevServer() {
	const devServer = new ApolloDevServer({
		schema,
		context: async ({ req }) => await ContextSetup(req),
	})

	await devServer.start()
	devServer.applyMiddleware({ app, path: '/' })

	const PORT = process.env.PORT || 4000
	app.listen({ port: PORT }, () => {
		// eslint-disable-next-line no-console
		console.log(`Listening on port ${PORT}`)
	})
}

if (process.env.NODE_ENV === 'development') startDevServer()
