const github = require('../../utils/github.js')
const util = require('../../utils/util.js')
const wxdb = require('../../utils/wxdb.js')
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    trends:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initMyStars();
  },

  //监听删除
  onDel: function (event) {
    let that = this;
    let repo = event.currentTarget.dataset.repo;
    wxdb.getOpenid().then(openid => {
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
          that.setData({
            trends: stars.map((it, index) => {
              it.stars_time = util.toStarTime(it.create_time);
              return it
            })
          })
        })
    })
  },

  //初始化收藏列表
  initMyStars: function () {
    let that = this;
    //获取openid
    wxdb.getOpenid().then(openid => {
      //获取收藏列表
      wxdb.queryStar(openid).then(stars => {
        app.globalData.myStars = stars;
        that.setData({
          trends: stars.map((it, index) => {
            it.stars_time = util.toStarTime(it.create_time);
            return it
          }),
        })
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