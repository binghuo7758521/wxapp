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
    optionname: "",
    px: "",
    number: "",
    ednum: "",
    edmoney: "",
    imgs: "",
    isShow: "true",
    isupload: "",
    sussnum: 0,
    btndisabled: false //防止上传按钮连续点击两次,点击按钮后，把按钮置为disabled  失败再置会enable

  },

  onLoad: function (opt) {
    let t = this;
    console.log(t)
    let pages = wx.getStorageSync('imgUrl');
    t.setData({
      imgList: pages,
      btndisabled: false
    });



    s.get("order/orderdata", "", function (e) {

      console.log(e)
      t.setData({
        username: e.nickname.nickname,
        orderdata: e.data,
        ordernum: e.ordersn,
        goodstitle: e.title.title,
        orderid: e.orderid,
        number: e.number,
        px: e.px,
        optionname: e.optionname
      });

      var size = e.size;
      var width = e.width;
      var height = e.hight;

      if (width > 5 && height > 5) {
        var width = e.width * 0.5;
        var height = e.hight * 0.5;
      }
      wx.getSystemInfo({
        success(res) {
          var winWidth = res.windowWidth;
          var winHeight = res.windowHeight;

          var imgwidth = 100 * width;
          var imgheight = 100 * height;

          if (imgwidth >= winWidth * 0.85 || imgheight >= winHeight * 0.7) {
            var imgwidth = 60 * width;
            var imgheight = 60 * height;

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

    s.get("order/ordertotal", "", function (e) {

      t.setData({
        total: e.total
      });
    });

    var goodid = wx.getStorageSync('goodsid');

    s.get("order/isupload", {
      goodsid: goodid
    }, function (a) {
      t.setData({
        isupload: a.isupload.isupload,
        ednum: a.isupload.ednum,
        edmoney: a.isupload.edmoney,
      });
    });


  },
  // 增加数量
  addCount(e) {
    console.log(this.data.imgList)
    console.log(1111111111)
    const index = e.currentTarget.dataset.index;
    console.log(index)
    let carts = this.data.imgList;
    let num = carts[index].num;
    num = num + 1;
    carts[index].num = num;
    this.setData({
      imgList: carts
    });

  },
  bind_num: function (e) {
    console.log(this.data.imgList)
    console.log(1111111111)
    var val = parseInt(e.detail.value);
    const index = e.currentTarget.dataset.index;
    console.log(index)
    console.log(val)
    let carts = this.data.imgList;
    let num = carts[index].num;
    carts[index].num = val;
    console.log(index)
    this.setData({
      imgList: carts
    });
  }, 
  // 减少数量
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.imgList;
    let num = carts[index].num;
    if (num <= 1) {
      return false;
    }
    num = num - 1;
    carts[index].num = num;
    this.setData({
      imgList: carts
    });

  },
  
  onShow: function () {
    let mm = this;
    let cropperImg = app.globalData.cropperImg;
    if (cropperImg) { } else { }


  },

  // 三 进入所点图片
  goCropperImg: function (e) {
    let {
      idx,
      num
    } = e.currentTarget.dataset;
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
    var imgpx = that.data.px;
    console.log(imgpx);
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        let tempFiles = res.tempFiles;
        that.setData({
          waitUploadNum: tempFiles.length
        });

        for (let index in tempFiles) {
          that.upload_file('', tempFiles[index].path);
          wx.getImageInfo({
            src: tempFiles[index].path,
            success(res) {
              console.log(res.width)
              console.log(res.height)
              var onewidth = res.width;
              var oneheight = res.height;
              console.log(onewidth)
              console.log(oneheight)
              console.log(11111)
              var onesize = onewidth * oneheight;
              if (onesize < imgpx) {
                console.log("照片像素太低")
              }

            }
          })
        }
      }
    })
    // let allnum = that.data.total;



  },


  // 上传
  choose: function () {
    var that = this;
    var imgList = that.data.imgList;
    var imagenum = that.data.imagenum;
    var imglengths = parseInt(that.data.imgList.length) + 1;
    var total = that.data.total;
    var number = that.data.number;
    var goodid = wx.getStorageSync('goodsid');

    console.log(goodid)

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
    var optionname = that.data.optionname;
    var datas = that.data.orderdata;
    var ordernums = that.data.ordernum;
    var titles = that.data.goodstitle;
    var orderid = that.data.orderid;
    var ednum = that.data.ednum;
    console.log(that)
    console.log(allnum)
    console.log(imgList.length)

    if (allnum <= total) {
      wx.setStorageSync("imgList", imgList);
      wx.setStorageSync("imagenum", imagenum);
      wx.setStorageSync("imglengths", imglengths);
      wx.setStorageSync("name", name);
      wx.setStorageSync("optionname", optionname);
      wx.setStorageSync("datas", datas);
      wx.setStorageSync("ordernums", ordernums);
      wx.setStorageSync("titles", titles);
      
        if (allnum < total) {
          console.log('张数少了')
          wx.showModal({
            title: '提示',
            content: '您选择的照片数量：' + allnum + ',您选择购买的照片数量：' + total + ';确认付款？',
            cancelText: '继续选图',
            confirmText: '去付款',
            success(res) {
              if (res.confirm) {
              wx.navigateTo({
                url: "/pages/order/pay/index?id=" + orderid
              })
              }
            }
          })
        }else{
          console.log(orderid)
          console.log('orderid')
          wx.navigateTo({
            url: "/pages/order/pay/index?id=" + orderid
          })
        }
        
      
      
    } else {
      if (number == 1) {
        var historyimglist = that.data.imgList;
        console.log('张数过多购买')
        console.log(historyimglist)
        wx.setStorageSync("historyimglist", historyimglist);
        wx.setStorageSync("gid", goodid);
        wx.showModal({
          title: '提示',
          content: '您选择的照片数量：' + allnum + ';您选择购买的照片数量：' + total + '是否重新购买？',
          cancelText: '去删图',
          confirmText: '重新购买',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/goods/detail/index?id=" + goodid,
              })

            }
          }
        })
      } else {
        console.log('张数过多')
      wx.showModal({
        title: '提示',
        content: '您上传的照片数超过购买的图片张数，去删几张吧'
      })
      }
    }

  },

  // 二  将所选图片遍历出来
  upload_file: function (url, filePath, res) {
    let that = this;
    let {
      imgList,
      waitUploadNum
    } = this.data;
    var imglength = 0;
    setTimeout(() => {
      // 模拟网络请求
      imgList.push({
        src: filePath,
        num: 1
      });

      wx.setStorageSync(imglength, imgList.length);

      this.setData({
        imgList: imgList
      });

      this.setData({
        waitUploadNum: --that.data.waitUploadNum
      });
    }, 500)
  },

})