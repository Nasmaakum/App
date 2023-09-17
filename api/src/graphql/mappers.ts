import 'graphql-import-node'
import { GraphQLSchema } from 'graphql'
import { makeExecutableSchema } from '@graphql-tools/schema'
import merge from 'lodash/merge'

import * as typeDefs from './schemas/schema.graphql'

import about from './resolvers/about'
import advertisement from './resolvers/advertisement'
import authentication from './resolvers/authentication'
import call from './resolvers/call'
import frequentlyAskedQuestion from './resolvers/frequently-asked-question'
import interpreter from './resolvers/interpreter'
import interpreterRating from './resolvers/interpreter-rating'
import interpreterRatingOption from './resolvers/interpreter-rating-option'
import misc from './resolvers/misc'
import notification from './resolvers/notification'
import privacyPolicy from './resolvers/privacy-policy'
import scalars from './resolvers/scalars'
import service from './resolvers/service'
import serviceCategory from './resolvers/service-category'
import termsOfUse from './resolvers/terms-of-use'
import user from './resolvers/user'

const resolvers = merge(
	about,
	call,
	advertisement,
	authentication,
	frequentlyAskedQuestion,
	interpreter,
	interpreterRating,
	interpreterRatingOption,
	misc,
	notification,
	privacyPolicy,
	scalars,
	service,
	serviceCategory,
	termsOfUse,
	user,
)

const schema: GraphQLSchema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
