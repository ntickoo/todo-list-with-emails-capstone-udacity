import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId} from '../utils';
import { createLogger } from '../../utils/logger'
import { TodoService } from '../../helpers/todos'

const logger = createLogger('auth')

const todoSerice = new TodoService()

// TODO: Get all TODO items for a current user
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info(`Get All Todos - Processing event: ${event}`)
    const userId = getUserId(event)
    const todos = await todoSerice.getAllTodos(userId)
    logger.info(`Todos fetched successfully for userId ${userId}`)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
})
handler.use(
  cors({
    credentials: true
  })
)
