import { globalUser } from './global'

const BASE = import.meta.env.VITE_BASE_URL;

function requestWithToken(options, retry = true, noRefresh = false) {
  return new Promise((resolve, reject) => {
    uni.request({
      //永不超时
      timeout:600000, //600秒
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: globalUser.token || uni.getStorageSync('token') || '',
        refreshToken: globalUser.refreshToken || uni.getStorageSync('refreshToken') || ''
      },
      success: (res) => {
        console.log("res",res);
        if (res.data.code === 401 && retry && !noRefresh) {
          console.log("requestWithToken 重新请求");
          // token 失效，自动刷新
          refreshTokenApi().then(({ token: newToken, refreshToken: newRefreshToken }) => {
            globalUser.token = newToken;
            globalUser.refreshToken = newRefreshToken;
            uni.setStorageSync('token', newToken);
            uni.setStorageSync('refreshToken', newRefreshToken);
            // 重试原请求
            requestWithToken(options, false).then(resolve).catch(reject)
          }).catch(() => {
            // 刷新失败，清理token并提示
            globalUser.token = '';
            globalUser.refreshToken = '';
            uni.setStorageSync('token', '');
            uni.setStorageSync('refreshToken', '');
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            reject(res.data)
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

// 实现对uni.uploadFile的统一封装
/**
 * 封装上传文件请求，自动带token，返回Promise
 * @param {Object} options uni.uploadFile参数，url为相对路径
 * @returns {Promise}
 */
export function uploadFileWithToken(options) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: globalUser.token || uni.getStorageSync('token') || ''
      },
      success: (res) => {
        console.log("res data", res.data);
        let data;
        try {
          data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (e) {
          uni.showToast({ title: '返回数据格式错误', icon: 'none' });
          return reject(res);
        }

        console.log("data ==== ",data);
        if (data.code === 401) {
			console.log("uploadFileWithToken 重新请求");
          // token失效，自动刷新
          refreshTokenApi().then(newToken => {
            globalUser.token = newToken;
            uni.setStorageSync('token', newToken);
            // 重试原请求
            uploadFileWithToken(options).then(resolve).catch(reject);
          }).catch(err => {
            uni.showToast({ title: 'token刷新失败', icon: 'none' });
            reject(err);
          });
        } else if (data.code !== 0) {
          uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
          reject(data);
        } else {
          resolve(data.data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}



export function getUserApi(openid) {
  return requestWithToken({
    url: '/api/user/' + openid,
    method: 'GET'
  })
}
export function refreshTokenApi() {
  return requestWithToken({
    url: '/api/token/refresh',
    method: 'POST',
    data: {
      refreshToken: globalUser.refreshToken || uni.getStorageSync('refreshToken') || ''
    }
  }, true, true).then(res => ({ token: res.token, refreshToken: res.refreshToken }))
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