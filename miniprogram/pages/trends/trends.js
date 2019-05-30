const github = require('../../api/github.js')
const moment = require('../../lib/moment.js')
const wxdb = require('../../utils/wxdb.js')
const app = getApp()

const timeRange = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' }
]
const languages = [
  'All',
  'C', 'CSS', 'C#', 'C++',
  'Dart', 'Dockerfile',
  'Erlang',
  'Gradle', 'Go',
  'HTML', 'Haskell',
  'Java', 'JavaScript', 'JSON', 'Julia',
  'Kotlin',
  'MATLAB',
  'Python', 'PHP',
  'R', 'Ruby', 'Rust',
  'Shell', 'SQL', 'Swift',
  'TeX',
  'Vue'
].map(it => ({ label: it, value: it }))

let scrollTop = 0
let lastRefresh = moment().unix()

const sinceCacheKey = 'Trending:Since'
const langCacheKey = 'Trending:Lang'

Page({
  data: {
    since: timeRange[0],
    lang: languages[0],
    selectorValues: [timeRange, languages],
    selectedIndices: [wx.getStorageSync(sinceCacheKey) || 0, wx.getStorageSync(langCacheKey) || 0],
    trends: []
  },


  onLoad: function (options) {

    app.globalData.trendingLoad = true;
    wxdb.getOpenid().then(data => {
      wxdb.updateLastTime(data);
    })
  },

  onShow: function () {
    const lastMoment = moment(lastRefresh)
    if (scrollTop === 0 && moment().diff(lastMoment, 'minutes') >= 5) {
      wx.startPullDownRefresh({})
    }else{
      //同步收藏页面删除收藏项目(首页显示手收藏按钮，该端代码可删除。但是小程序切换打开方式后，首页数据会不加载，所以暂时保留代码
      // 后续需要去除 app.globalData.trendingLoad 属性)
      if (app.globalData.trendingLoad){
        app.globalData.trendingLoad = false;
        wx.startPullDownRefresh({})
      }
    }
  },

  onShareAppMessage: function(options) {
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.reloadData()
  },
  

  //加载热榜数据
  reloadData: function () {
    const [timeIndex, langIndex] = this.data.selectedIndices

    const lang = languages[langIndex] || languages[0]
    const since = timeRange[timeIndex] || timeRange[0]

    this.setData({ lang, since }, () => {
      wx.setStorage({
        key: sinceCacheKey,
        data: timeIndex,
      })
      wx.setStorage({
        key: langCacheKey,
        data: langIndex,
      })
    })

    github.trendings(since.value.toLowerCase(), lang.value.toLowerCase()).then(trends => {
      wx.stopPullDownRefresh()
      this.setData({
        trends: trends,
      })
      this.selectComponent(".addTips").doShowModal();
      //初始化收藏样式
      //this.initStarStyle(trends);
      //更新最后刷新时间
      lastRefresh = moment()
    }).catch(error => wx.stopPullDownRefresh() )
  },

  //快捷搜索
  changeFilter: function (event) {
    const selectedIndices = event.detail.value
    this.setData({ selectedIndices })
    wx.pageScrollTo({
      scrollTop: 0
    })
    wx.startPullDownRefresh({})

  },

  //页面滚动触发事件的处理函数
  onPageScroll (e) {
    scrollTop = e.scrollTop
  },


  //添加收藏样式
  initStarStyle: function (trends){
    //获取我的收藏列表
    if (app.globalData.myStars.length > 0) {
      //对比添加收藏状态
      app.globalData.myStars.forEach(star => {
        trends.forEach(trend => {
          if (trend.url == star.url) {
            trend.star_status = true;
          }
        });
      });
      console.log("Trending 页面执行缓存对比")
      this.setData({
        trends: trends,
      })
    }
  },

  //监听收藏
  onStar: function (event) {
    let repo = event.currentTarget.dataset.repo;
    wxdb.getOpenid().then(data => {
      if (repo.star_status) {
        this.canselStar(data, repo);
      } else {
        this.addStar(data, repo);
      }
    })

  },

  //添加收藏
  addStar: function (openid, repo) {
    let that = this;
    let star = {
      author: repo.author,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.url,
      description: repo.description,
      language: repo.language,
      avatar: repo.builtBy[0] ? repo.builtBy[0].avatar : "",
      
    }
    wxdb.addStar(openid, star).then(data => {
      wx.showToast({
        title: '收藏成功',
      })
      //更新全局变量-我的收藏
      app.globalData.myStars.unshift(star);
      //更新热榜数据
      let trends = this.data.trends;
      trends[repo.item_index - 1].star_status = true;
      this.setData({
        trends
      })

    }).catch(error => wx.stopPullDownRefresh())
  },

  //取消收藏
  canselStar: function (openid, repo) {
    let that = this;
    let stars = new Array();
    //过滤
    stars = app.globalData.myStars.filter((it, index) => {
      return repo.url != it.url
    });
    //重置我的收藏列表
    wxdb.setStar(openid, stars).then(data => {
      wx.showToast({
        title: '取消收藏成功',
      })
      //更新全局变量-我的收藏
      app.globalData.myStars = stars;
      //更新热榜数据
      let trends = this.data.trends;
      trends[repo.item_index - 1].star_status = false;
      this.setData({
        trends
      })
    })
  },

  //跳转项目详情
  toRepoDetail: function (event) {
    let repo = event.currentTarget.dataset.repo;
    var url = `/pages/repo-detail/repo-detail?url=https://api.github.com/repos/${repo.full_name}`
    wx.navigateTo({
      url
    })
  }


})