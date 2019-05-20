const github = require('../../api/github.js')
const app = getApp()

Page({
  data: {
    q: '',
    repos: [],
    users: [],
    repoUrl: '',
    userUrl: '',
    activeTab: 'repos',
    hasMore: false,
    searching: {
      repos: false,
      users: false
    },
    // 组件所需的参数
    nvabarData: {
      title: '', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20, 
  },

  onLoad: function(options) {
    const { q } = options
    this.setData({ 
      q,
      "nvabarData.title": q
    })
    this.performSearch()
  },

  onReachBottom: function() {
    this.loadMore()
  },

  onShareAppMessage: function() {
    const {
      q
    } = this.data
    return {
      title: `GitHub Search: ${q}`,
      path: `/pages/search/search?q=${q}`
    }
  },

  loadMore() {
    const { activeTab, repoUrl, userUrl, searching, q } = this.data
    if (activeTab === 'repos') {
      if (!repoUrl) {
        return wx.showToast({ title: 'No more results' })
      }
      this.setData({ loadingMore: true })
      if (searching.repos) {
        console.log('searching repos, returning')
        return
      }
      searching.repos = true
      this.setData({ searching })
      wx.showNavigationBarLoading({})
      github.searchRepos(this.data.repoUrl, q).then(res => {
        let { repos, links } = res
        const repoUrl = links['rel="next"'] || ''
        const hasMore = repoUrl !== ''
        searching.repos = false
        repos = [...this.data.repos, ...repos]
        this.setData({
          repos,
          repoUrl,
          hasMore,
          searching
        })
        wx.hideNavigationBarLoading({})
      }).catch(error => {
        searching.repos = false
        this.setData({ searching })
        wx.hideNavigationBarLoading({})
      })
    }
    if (activeTab === 'users') {
      if (!userUrl) {
        return wx.showToast({ title: 'No more results' })
      }
      this.setData({ loadingMore: true })
      if (searching.users) {
        console.log('searching users, returning')
        return
      }
      searching.users = true
      this.setData({ searching })
      wx.showNavigationBarLoading({})
      github.searchUsers(this.data.userUrl, q).then(res => {
        let { users, links } = res
        const userUrl = links['rel="next"'] || ''
        const hasMore = userUrl !== ''
        searching.users = false
        users = [...this.data.users, ...users]
        this.setData({
          users,
          userUrl,
          hasMore,
          searching
        })
        wx.hideNavigationBarLoading({})
      }).catch(error => {
        searching.users = false
        this.setData({ searching })
        wx.hideNavigationBarLoading({})
      })
    }
  },

  performSearch: function () {
    const { q, searching } = this.data
    if (this.data.activeTab === 'repos') {
      if (searching.repos) {
        console.log('searching repos, returning')
        return
      }
      searching.repos = true
      this.setData({ searching })
      wx.showNavigationBarLoading({})
      github.searchRepos(this.data.repoUrl, q).then(res => {
        let { repos, links } = res
        const repoUrl = links['rel="next"'] || ''
        const hasMore = repoUrl !== ''
        searching.repos = false
        this.setData({
          repos,
          repoUrl,
          hasMore,
          searching
        })
        wx.hideNavigationBarLoading({})
      }).catch(error => {
        searching.repos = false
        this.setData({ searching })
        wx.hideNavigationBarLoading({})
      })
    } else if (this.data.activeTab === 'users') {
      if (searching.users) {
        console.log('searching users, returning')
        return
      }
      searching.users = true
      this.setData({ searching })
      wx.showNavigationBarLoading({})
      github.searchUsers(this.data.userUrl, q).then(res => {
        let { users, links } = res
        const userUrl = links['rel="next"'] || ''
        const hasMore = userUrl !== ''
        searching.users = false
        this.setData({
          users,
          userUrl,
          hasMore,
          searching
        })
        wx.hideNavigationBarLoading({})
      }).catch(error => {
        searching.users = false
        this.setData({ searching })
        wx.hideNavigationBarLoading({})
      })
    }
  },

  onSearch: function(e) {
    this.setData({
      q: e.detail,
      userUrl: '',
      repoUrl: '',
      repos: [],
      users: [],
      "nvabarData.title": e.detail
    })
    this.performSearch()
  },

  changeTab: function(e) {
    const oldTab = this.data.activeTab
    switch (e.detail.index) {
      case 0:
        this.setData({
          activeTab: 'repos'
        })
        if (this.data.repos.length > 0) {
          return
        }
        break
      case 1:
        this.setData({
          activeTab: 'users'
        })
        if (this.data.users.length > 0) {
          return
        }
        break
    }
    if (oldTab !== this.data.activeTab) {
      this.performSearch()
    }
  }
})