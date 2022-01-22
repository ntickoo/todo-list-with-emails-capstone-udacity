import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { TodoService } from '../../helpers/todos'

const logger = createLogger('auth')

const todoSerice = new TodoService()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`update todos - Processing event: ${event}`)

    const todoId                          = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest  = JSON.parse(event.body)
    const userId                          = getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const found:boolean = await todoSerice.todoItemExistsForUser(todoId, userId)

    if(!found) {
      logger.info(`No todo item ${todoId} exists for user ${userId}. Rejecting update request`)

      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "TodoId does not exist for this user.",
        }),
      };
    }

    await todoSerice.updateTodoItem(userId, todoId, updatedTodo)
    return {
      statusCode: 204,
      body: ''
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
