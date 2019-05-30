const Towxml = require('lib/towxml/main')

App({
  onLaunch: function (options) {
    let that = this;
    wx.cloud.init({
      // env: 'github-development',
      env: 'passer-8a8afb',
      traceUser: true
    })

    //设置屏幕高度
    wx.getSystemInfo({
      success: (res) => {
        that.globalData.height = res.statusBarHeight
      }
    })
  },
  globalData: {
    //用户信息
    //openid: "o29gu5em62Lc5mdGdYtZv2PkL2nQ",
    openid: null,
    //收藏集合
    myStars:[],
    //Trending页面刷新状态
    trendingLoad:false,
    // 分享默认为false
    share: true,  
    height: 0,
  },
  towxml: new Towxml()
})