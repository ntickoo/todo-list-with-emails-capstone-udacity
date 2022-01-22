import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { SaveUserInfoRequest } from '../../requests/SaveUserInfoRequest'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { UserInfoService } from '../../helpers/service/userInfoService'
import { UserInfo } from '../../models/UserInfo'

const logger = createLogger('userInfoLambda')

const userInfoService = new UserInfoService()


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Update/Save User Info - ${event}`)

  const userInfoRequest: SaveUserInfoRequest  = JSON.parse(event.body)
  const userId                                = getUserId(event)
  logger.info(`Saving email ${userInfoRequest.email} for userId ${userId}`)

  const userInfo: UserInfo = await userInfoService.save(userId, userInfoRequest)
  
  logger.info(`User Info saved successfully for userId ${userId}`)
  return {
      statusCode: 200,
      body: JSON.stringify({
        item: userInfo
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
