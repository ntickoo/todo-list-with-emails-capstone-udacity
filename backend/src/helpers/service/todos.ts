import { TodosAccess } from '../dao/todosAcess'
import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const logger = createLogger('TodosAccess')
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export class TodoService {

    async deleteTodoItem(userId: string, todoId: string) {
      await todosAccess.deleteTodo(userId,todoId)
    }
    
    async getAllTodos(userId: string) : Promise<TodoItem[]> {
        logger.info(`TodoService - getAllTodos for userid ${userId}`)
        return todosAccess.getAllTodos(userId)
    }

    async createTodo(userId: string, todoDto:CreateTodoRequest) : Promise<TodoItem> {
        logger.info(`TodoService - createTodo for ${userId}', create dto ${todoDto}`)
        const todoId = uuid.v4()

        let todoItem: TodoItem = {
            createdAt: new Date().toISOString(),
            done: false,
            dueDate: todoDto.dueDate,
            name: todoDto.name,
            userId: userId,
            todoId: todoId
        }
        return todosAccess.createTodo(todoItem)
    }
    async todoItemExistsForUser(todoId: string, userId: string): Promise<boolean> {
        const todoItem:TodoItem = await todosAccess.getTodoItem(userId, todoId)
        return !!todoItem
    }
    async updateTodoItem(userId: string, todoId: string, updatedTodo: UpdateTodoRequest){
        logger.info(`TodoService - updateTodoItem for ${userId}', updatedTodo dto ${updatedTodo}, todoId ${todoId}`)
        await todosAccess.updateTodo(userId, todoId, updatedTodo)
    }

    async updateImageUrlForTodoItem(todoId: string, userId: string, imageId: string){
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
        await todosAccess.updateImageUrl(todoId, userId, imageUrl)
    }
}

