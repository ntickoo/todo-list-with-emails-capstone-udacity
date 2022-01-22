import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { TodoService } from '../../helpers/service/todos'

const logger = createLogger('auth')

const todoSerice = new TodoService()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Remove a TODO item by id
    
    logger.info(`delete todos - Processing event: ${event}`)

    const todoId                          = event.pathParameters.todoId
    const userId                          = getUserId(event)
    logger.info(`Processing delete todo request for ${userId} for todo id ${todoId}`)

    const found:boolean = await todoSerice.todoItemExistsForUser(todoId, userId)
    if(!found) {
      logger.info(`No todo id ${todoId} exists for ${userId}. Rejecting request`)
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "TodoId does not exist for this user.",
        }),
      };
    }
    
    await todoSerice.deleteTodoItem(userId, todoId)
    logger.info(`Todo id ${todoId}  for ${userId} deleted successfully.`)
    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
