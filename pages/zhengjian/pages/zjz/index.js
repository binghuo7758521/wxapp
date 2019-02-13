// pages/zjz/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    service: 1,
    speclist: [],
    specId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var speclist = app.speclist;
    var config = wx.getStorageSync("zjz_config");
    var specId = 0;
    var has_chosen = !1;
    for(var i= 0; i<speclist.length; i++){
      if(speclist[i].spec_id === config.Zheng_size){
        speclist[i].chosen = !0;
        has_chosen = !0;
        specId = speclist[i].spec_id;
      }else{
        speclist[i].chosen = !1;
      }
    }
    if(!has_chosen){
      speclist[0].chosen = !0;
      specId = speclist[0].spec_id;
    }
    this.setData({
      speclist: speclist,
      specId: specId
    });
    
  },

  chooseSpec: function (e) {
    for (var i = 0; i < this.data.speclist.length; i++) this.data.speclist[i].chosen = !1;
    this.data.speclist[e.currentTarget.dataset.index].chosen = !0, this.setData({
      speclist: this.data.speclist,
      specId: this.data.speclist[e.currentTarget.dataset.index].spec_id
    });
  },
  choosePhoto: function () {
    wx.navigateTo({
      url: "./camera?specId=" + this.data.specId
    });
  }
})