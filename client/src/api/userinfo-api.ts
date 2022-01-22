import { apiEndpoint } from '../config'
import Axios  from 'axios'
import { UserInfo } from '../types/UserInfo';
import { SaveUserInfoRequest } from '../types/SaveUserInfoRequest';

export async function getUserInfo(idToken: string): Promise<UserInfo> {
  console.log('Fetching userinfo')

  const response = await Axios.get(`${apiEndpoint}/userinfo`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('userinfo:', response.data)

  const userInfo : UserInfo = response.data.items;

  return userInfo
}

export async function saveUserInfo(
  idToken: string,
  userInfo: SaveUserInfoRequest
): Promise<UserInfo> {
  const response = await Axios.post(`${apiEndpoint}/userinfo`,  JSON.stringify(userInfo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

