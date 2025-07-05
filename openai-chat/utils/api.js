import { globalUser } from './global'

const BASE = import.meta.env.VITE_BASE_URL;

function requestWithToken(options, retry = true) {
  return new Promise((resolve, reject) => {
    uni.request({
      //永不超时
      timeout:600000, //600秒
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: globalUser.token || uni.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.data.code === 401 && retry) {
          // token 失效，自动刷新
          refreshTokenApi().then(newToken => {
            globalUser.token = newToken
            uni.setStorageSync('token', newToken)
            // 重试原请求
            requestWithToken(options, false).then(resolve).catch(reject)
          })
        } else if (res.data.code !== 0) {
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
          reject(res.data)
        } else {
          resolve(res.data.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export function getUserApi(openid) {
  return requestWithToken({
    url: '/api/user/' + openid,
    method: 'GET'
  })
}
export function refreshTokenApi() {
  return requestWithToken({
    url: '/api/token',
    method: 'POST'
  }).then(res => res.token)
}
export function chatApi(openid, messages) {
  return requestWithToken({
    url: '/api/chat',
    method: 'POST',
    data: { openid, messages }
  })
}
export function imageApi(data) {
  return requestWithToken({
    url: '/api/image',
    method: 'POST',
    data
  })
}
export function getHistoryApi(openid) {
  return requestWithToken({ 
    url: '/api/history/' + openid,
    method: 'GET'
  })
} 