<script>
import { globalUser } from '@/utils/global';
export default {
	onLaunch: function() {
		console.log('App Launch');
		// 小程序静默登录，获取code后请求后端换取openid
		uni.login({
			provider: 'weixin',
			success: (loginRes) => {
				const code = loginRes.code;
				console.log("code",code)
				// 假设后端有/api/wxlogin?code=xxx接口返回openid
				uni.request({
					url: import.meta.env.VITE_BASE_URL+'/api/user/wxlogin',
					method: 'POST',
					data: { code },
					success: (res) => {
						console.log("res",res)
            res = res.data
						globalUser.token = res.data.token;
						//refreshToken
						globalUser.refreshToken = res.data.refreshToken;
						globalUser.info = res.data;
						uni.setStorageSync('token', res.data.token);
						uni.setStorageSync('refreshToken', res.data.refreshToken);
					}
				});
			}
		});
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
