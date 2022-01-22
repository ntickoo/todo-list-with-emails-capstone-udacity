import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
  ) {}

  async getTodoItem(userId:string, todoId:string): Promise<TodoItem> {
    logger.info(`Getting TodoItem for todoid ${todoId} for user id ${userId}`)

    const result = await this.docClient
    .get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
    })
    .promise();

    return result.Item as TodoItem
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all TodoItems for userid' ${userId}`)

    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
    .promise();
    return result.Items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info(`Create todo item - ', ${todoItem}`)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async deleteTodo(userId: string, todoId: string) {
    logger.info(`Delete todo item - ${userId}, todoid ${todoId}`)
    await this.docClient
    .delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
    })
    .promise();
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) {
    logger.info(`Update todo ${todoId} with new info ${updatedTodo} for userId ${userId}`)
    var params = {
          TableName: this.todosTable,
          Key: {
            "userId": userId,
            "todoId": todoId
          },
          UpdateExpression: "set #nameAlias = :nm, #dueDateAlias=:ddate, #doneAlias=:dn",
          ExpressionAttributeValues : {
              ":nm":    updatedTodo.name,
              ":ddate": updatedTodo.dueDate,
              ":dn":    updatedTodo.done
          },
          ExpressionAttributeNames : {
            "#nameAlias": "name",
            "#dueDateAlias": "dueDate",
            "#doneAlias": "done"
          },
          ReturnValues:"NONE"
      };
  
      await this.docClient.update(params).promise()
  }

  async updateImageUrl(todoId: string, userId: string, imageUrl: string) {
    logger.info(`Update todo ${todoId} with attachment url ${imageUrl} for userId ${userId}`)
    var params = {
          TableName: this.todosTable,
          Key: {
            "userId": userId,
            "todoId": todoId
          },
          UpdateExpression: "set attachmentUrl = :url",
          ExpressionAttributeValues:{
              ":url":  imageUrl
          },
          ReturnValues:"NONE"
      };
  
      await this.docClient.update(params).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
