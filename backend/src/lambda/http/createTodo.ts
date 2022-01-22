import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { TodoService } from '../../helpers/todos'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('auth')

const todoSerice = new TodoService()


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Create Todo Handing event - ${event}`)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  logger.info(`Creating todo for userId ${userId}, todo item ${newTodo}`)
  // TODO: Implement creating a new TODO item
  const todoItem: TodoItem = await todoSerice.createTodo(userId, newTodo)
  logger.info(`todo created successfully for userId ${userId}`)
  return {
      statusCode: 200,
      body: JSON.stringify({
        item: todoItem
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
