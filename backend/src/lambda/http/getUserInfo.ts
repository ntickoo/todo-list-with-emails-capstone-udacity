import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId} from '../utils';
import { createLogger } from '../../utils/logger'
import { UserInfoService } from '../../helpers/userInfoService';
import { UserInfo } from '../../models/UserInfo';

const logger = createLogger('getUserInfoLambda')

const userInfoService = new UserInfoService()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info(`Get UserInfo - Processing event: ${event}`)
    const userId    = getUserId(event)
    let userInfo : UserInfo  = await userInfoService.getUserInfo(userId)

    if(!Boolean(userInfo) || Object.keys(userInfo).length === 0 || !('email' in userInfo) ) {
      userInfo = {
        userId: userId,
        email: ''
      }
      logger.info(`User with id ${userId} has not user info in the system.`)
    }

    const res = {
      items: userInfo
    }

    logger.info(`User Info fetched successfully for userId ${userId}, info  ${JSON.stringify(res)}`)

    return {
      statusCode: 200,
      body: JSON.stringify(res)
    }
})
handler.use(
  cors({
    credentials: true
  })
)
