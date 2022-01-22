import { SaveUserInfoRequest } from "../../requests/SaveUserInfoRequest"
import { UserInfo } from "../../models/UserInfo"
import { createLogger } from "../../utils/logger";
import { UserInfoAccess } from "../dao/userInfoAcess";

const logger = createLogger('UserInfoService')

const userInfoAccess = new UserInfoAccess()

export class UserInfoService {
    async save(userId: string, userInfoRequest: SaveUserInfoRequest) : Promise<UserInfo> {
        logger.info(`UserInfoService - save user info for ${userId}', user info ${userInfoRequest}`)

        let usr: UserInfo = {
           userId:  userId,
           email:   userInfoRequest.email
        };
        await userInfoAccess.saveUserInfo(usr);
        return usr;
    }

    async getUserInfo(userId: string) : Promise<UserInfo> {
        logger.info(`UserInfoService - get user info for ${userId}'`)
        return userInfoAccess.getUserInfo(userId)
    }

    async getAllUserInfo() : Promise<UserInfo[]> {
        logger.info(`UserInfoService - get all users and their information.`)
        return userInfoAccess.getAll()
    }

    async deleteUserInfo(userId: string) {
        logger.info(`UserInfoService - get all users and their information.`)
        await userInfoAccess.deleteUserInfo(userId);
    }
}