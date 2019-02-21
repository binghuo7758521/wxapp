//获取应用实例
const app = getApp(), s = app.requirejs("core");
Page({
  data: {
    ratio: 102/152,
    originUrl: '',
    idx: '',
    cropperResult: '',
    showImgList: [],
    nowwidth:"",
    nowheight:""
  },
  onLoad: function ( opt ) {
    let t = this
    let { src, idx, num } = opt;
    console.log("index index:opt", opt);
    this.setData({ originUrl: src, idx, num });
  },
  uploadTap() {
    let _this = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        _this.setData({
          originUrl: res.tempFilePaths[0],
          cropperResult: ''
        })
      }
    })
  },
  
  //六 获取图片
  getCropperImg(e) {
    let { idx } = this.data;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let img = prevPage.data.imgList[idx];
    img.src = e.detail.origin;
    img.clipImg = e.detail.url;
    img.num = e.detail.num;
    img.img_isok=true;
    prevPage.setData({ [`imgList[${idx}]`]: img });
    wx.navigateBack({ delta: 1 })
  },
  clickImg: function (e) {
    this.setData({
      originUrl: 'originUrl',
      cropperResult: '',
    })
  },
})
