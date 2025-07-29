import { globalUser } from './global';

const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'; // 本地开发备用地址

// 用于刷新token的API调用，不使用request封装，避免循环依赖
async function refreshTokenApi() {
  const refreshToken = uni.getStorageSync('refreshToken') || globalUser.refreshToken || '';
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE + '/api/token/refresh',
      method: 'POST',
      data: { refreshToken },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

function request(options, retry = true) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || globalUser.token || '';

    uni.request({
      timeout: 60000, // 60秒
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        'Authorization': `Bearer ${token}`,
      },
      success: async (res) => {
        console.log('API Response:', res); // Add this line for debugging
        if (res.statusCode === 401 && retry) {
          try {
            const { token: newToken, refreshToken: newRefreshToken } = await refreshTokenApi();
            globalUser.token = newToken;
            globalUser.refreshToken = newRefreshToken;
            uni.setStorageSync('token', newToken);
            uni.setStorageSync('refreshToken', newRefreshToken);
            // 重试原请求，不再重试刷新token
            request(options, false).then(resolve).catch(reject);
          } catch (refreshErr) {
            // 刷新失败，清理token并提示
            globalUser.token = '';
            globalUser.refreshToken = '';
            uni.setStorageSync('token', '');
            uni.setStorageSync('refreshToken', '');
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            reject(res.data);
          }
        } else if (res.statusCode >= 400) {
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
          reject(res.data);
        } else {
          resolve(res.data.data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

export function uploadFileWithToken(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || globalUser.token || '';
    uni.uploadFile({
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        'Authorization': `Bearer ${token}`,
      },
      success: async (res) => {
        let data;
        try {
          data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (e) {
          return reject({ msg: '无效的JSON响应' });
        }

        if (res.statusCode === 401) {
          try {
            const { token: newToken, refreshToken: newRefreshToken } = await refreshTokenApi();
            globalUser.token = newToken;
            globalUser.refreshToken = newRefreshToken;
            uni.setStorageSync('token', newToken);
            uni.setStorageSync('refreshToken', newRefreshToken);
            // 重试原请求
            uploadFileWithToken(options).then(resolve).catch(reject);
          } catch (refreshErr) {
            globalUser.token = '';
            globalUser.refreshToken = '';
            uni.setStorageSync('token', '');
            uni.setStorageSync('refreshToken', '');
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            reject(data);
          }
        } else if (res.statusCode >= 400) {
          reject(data);
        } else {
          resolve(data.data);
        }
      },
      fail: (err) => reject(err),
    });
  });
}

// --- API 接口组 ---

export const userApi = {
  wxLogin: (code) => request({ url: '/api/user/wxlogin', method: 'POST', data: { code } }).then(res => {
    globalUser.token = res.token;
    globalUser.refreshToken = res.refreshToken;
    globalUser.nickname = res.nickname; // Store nickname
    globalUser.avatar = res.avatar;     // Store avatar
    uni.setStorageSync('token', res.token);
    uni.setStorageSync('refreshToken', res.refreshToken);
    uni.setStorageSync('nickname', res.nickname); // Persist nickname
    uni.setStorageSync('avatar', res.avatar);     // Persist avatar
    return res;
  }),
  getProfile: () => request({ url: '/api/user/profile', method: 'GET' }),
  checkIn: () => request({ url: '/api/user/check-in', method: 'POST' }),
  getTasks: () => request({ url: '/api/user/tasks', method: 'GET' }),
  updateProfile: (data) => request({ url: '/api/user/updateProfile', method: 'POST', data }),
};

export const imageApi = {
  generate: (data) => request({ url: '/api/image', method: 'POST', data }),
};

export const historyApi = {
  getList: (params) => request({ url: '/api/history', method: 'GET', data: params }),
  getDetail: (id) => request({ url: `/api/history/${id}`, method: 'GET' }),
  delete: (id) => request({ url: `/api/history/${id}`, method: 'DELETE' }),
  updateVisibility: (id, is_public) => request({ url: `/api/history/${id}/visibility`, method: 'PUT', data: { is_public } }),
};

export const galleryApi = {
  getPublic: (params) => request({ url: '/api/gallery/public', method: 'GET', data: params }),
  like: (id) => request({ url: `/api/gallery/like/${id}`, method: 'POST' }),
};

export const balanceApi = {
  getRecords: (params) => request({ url: '/api/balance/records', method: 'GET', data: params }),
  getPackages: () => request({ url: '/api/balance/packages', method: 'GET' }),
};

export const commonApi = {
  submitFeedback: (data) => request({ url: '/api/common/feedback', method: 'POST', data }),
  getLatestNotification: () => request({ url: '/api/common/notifications/latest', method: 'GET' }),
  getAgreement: () => request({ url: '/api/common/content/agreement', method: 'GET' }),
  getPrivacy: () => request({ url: '/api/common/content/privacy', method: 'GET' }),
};