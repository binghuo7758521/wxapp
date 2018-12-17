var app = getApp(), s = app.requirejs("core");
var util = require('../../utils/util.js');
Page({
  data: {
    waitUploadNum: 0,
    imgList: [],
    total: "",
    allnum: "",
    imgnum: "",
    imagenum: 0,
    username: "",
    orderdata: "",
    ordernum: "",
    goodstitle: "",
    imgs:"",
    isShow:"true"
  },
  
  onLoad: function (opt) {
    let t = this;
    console.log(t)
    let pages = wx.getStorageSync('imgUrl');
    t.setData({
      imgList: pages
    });
    
    s.get("order/ordertotal", "", function (e) {

      t.setData({
        total: e.order_goods.total
      });
    });

    s.get("order/orderdata", "", function (e) {
      console.log(45454545)
      console.log(e)
      t.setData({
        username: e.nickname.nickname,
        orderdata: e.data,
        ordernum: e.ordersn,
        goodstitle: e.title.title,
        orderid:e.orderid
      });

      let size = e.size;
      let width = e.width;
      let height = e.hight;

      wx.getSystemInfo({
        success(res) {
          var winWidth = res.windowWidth;
          var winHeight = res.windowHeight;

          let imgwidth = 100 * width;
          let imgheight = 100 * height;
          if (imgwidth >= winWidth * 0.85 || imgheight >= winHeight * 0.7) {
            let imgwidth = 60 * width;
            let imgheight = 60 * height;

            t.setData({
              Width: imgwidth,
              Height: imgheight,
              size: size
            })
            wx.setStorageSync('Width', imgwidth)
            wx.setStorageSync('Height', imgheight)
            wx.setStorageSync('Size', size)
          } else {
            t.setData({
              Width: imgwidth,
              Height: imgheight,
              size: size,
            })
            wx.setStorageSync('Width', imgwidth)
            wx.setStorageSync('Height', imgheight)
            wx.setStorageSync('Size', size)
          }

        }
      })



    });

  },
  onShow: function () {
    let mm = this;
    let cropperImg = app.globalData.cropperImg;
    if ( cropperImg ) {} else {}
  },

  // 三 进入所点图片
  goCropperImg: function (e) {
    let { idx, num } = e.currentTarget.dataset;
    let goCropperImg = this.data.imgList[idx];
    wx.navigateTo({
      url: '../index/index?idx=' + idx + '&src=' + goCropperImg.src + '&num=' + num
    });
  },

 
  deleteImg: function (e) {
    var imgs = this.data.imgList;
    var index = e.currentTarget.dataset.index; 
    imgs.splice(index, 1); 
    this.setData({ 
      imgList: imgs,
      
    });
  },


  // 一 弹出选择图片
  onChooseImg: function () {
    let that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success (res) {
        let tempFiles = res.tempFiles;
        that.setData({
          waitUploadNum: tempFiles.length
        });

        for (let index in tempFiles) {
          that.upload_file('', tempFiles[index].path);
        }
      }
    })
    let allnum = that.data.total;

  },

  // 上传
  choose: function (url, filePath) {
    var that = this
    var imgList = that.data.imgList;
    var imagenum = that.data.imagenum;
    var imglengths = parseInt(that.data.imgList.length) + 1;
    var total = that.data.total;

    that.setData({
      imgList: imgList
    })

    var allnum = 0;
    for (var a = 0; a < imgList.length; a++) {
      allnum = allnum + imgList[a].num;
    }
    that.setData({
      allimgnum: allnum
    })

    var nowTime = util.formatTime(new Date());
    var name = that.data.username;
    var datas = that.data.orderdata;
    var ordernums = that.data.ordernum;
    var titles = that.data.goodstitle;
    var orderid = that.data.orderid;

    if (allnum <= total) {
      wx.setStorageSync("imgList", imgList);
      wx.setStorageSync("imagenum", imagenum);
      wx.setStorageSync("imglengths", imglengths);
      wx.setStorageSync("name", name);
      wx.setStorageSync("datas", datas);
      wx.setStorageSync("ordernums", ordernums);
      wx.setStorageSync("titles", titles);
      wx.navigateTo({
        url: "/pages/order/pay/index?id=" + orderid
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您上传的照片数超过购买的图片张数，去删几张吧'
      })
    }
  },
 
  // 二  将所选图片遍历出来
  upload_file: function (url, filePath,res) {
    let that = this;
    let { imgList, waitUploadNum } = this.data;
    var imglength=0;
    setTimeout(() => {
      // 模拟网络请求
      imgList.push({ src: filePath, num: 1 });
     
      wx.setStorageSync(imglength, imgList.length);
         
      this.setData({imgList:imgList });
     
      this.setData({ waitUploadNum: --that.data.waitUploadNum });
    }, 500)
  },
  
})
