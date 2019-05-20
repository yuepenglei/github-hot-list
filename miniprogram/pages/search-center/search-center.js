// pages/search-center/search-center.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    q: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShareAppMessage: function (options) {
  },
  
  onSearch: function (e) {
    const q = e.detail;
    if(q == "" || q == null){
      wx.showToast({
        title: '请输入搜索内容',
        icon:"loading"
      })
    }else{
      wx.navigateTo({
        url: `/pages/search/search?q=${q}`,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

})