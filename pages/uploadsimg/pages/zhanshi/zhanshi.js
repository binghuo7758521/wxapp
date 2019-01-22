var app = getApp(),
  s = app.requirejs("core");
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
    allimgnum:0,
    btndisabled: false //防止上传按钮连续点击两次,点击按钮后，把按钮置为disabled  失败再置会enable

  },

  onLoad: function(opt) {
    let t = this;
    var goodid = wx.getStorageSync('goodsid');
    let pages = wx.getStorageSync('imgUrl');
    wx.removeStorageSync("imgUrl");
    wx.removeStorageSync("imgList");
    t.setData({
      imgList: pages,
      btndisabled: false
    });



    s.get("order/orderdata", "", function(e) {

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

    s.get("order/ordertotal", "", function(e) {

      t.setData({
        total: e.total
      });
    });



    s.get("order/isupload", {
      goodsid: goodid
    }, function(a) {
      t.setData({
        isupload: a.isupload.isupload,
        ednum: a.isupload.ednum,
        edmoney: a.isupload.edmoney,
      });
    });


  },
  // 增加数量
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.imgList;
    let num = carts[index].num;
    num = num + 1;
    carts[index].num = num;
    let allnum=this.data.allimgnum;
    allnum=allnum+1;
    this.setData({
      imgList: carts,
      allimgnum:allnum
    });

  },
  bind_num: function(e) {
    var val = parseInt(e.detail.value);
    const index = e.currentTarget.dataset.index;
    let carts = this.data.imgList;
    let num = carts[index].num;
    carts[index].num = val;

    var allnums = 0;
    for (var a = 0; a < carts.length; a++) {
      allnums = allnums + carts[a].num;
    } 

    this.setData({
      imgList: carts,
      allimgnum: allnums
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
    let allnum = this.data.allimgnum;
    allnum = allnum - 1;
    this.setData({
      imgList: carts,
      allimgnum: allnum
    });

  },
  //获得选择了多少张照片；
  getselectednum: function(list){

    var allnums = 0;
    for (var a = 0; a < list.length; a++) {
      allnums = allnums + list[a].num;
    } 
    //return allnums; 


  },

  onShow: function() {
    let mm = this;
    var goodid = wx.getStorageSync('goodsid');
    let cropperImg = app.globalData.cropperImg;
    if (cropperImg) {} else {}
    console.log(mm);
    console.log(55555);
    
    var allnums = 0;
    for (var a = 0; a < mm.data.imgList.length; a++) {
      allnums = allnums + mm.data.imgList[a].num;
    } 

    mm.setData({
      allimgnum: allnums,
    })


  },
  onUnload: function() {
    let mm = this;
    var goodid = wx.getStorageSync('goodsid');
    var number = mm.data.number;
    var allhistoryimglist = mm.data.imgList;
    console.log(mm)
    console.log(number)
    if (number == 1) {
      console.log('重买')
      console.log(allhistoryimglist)
      var ii = wx.getStorageSync("uploadingnum");
      if (ii > 0){

      }else
      {
      wx.setStorageSync("allhistoryimglist", allhistoryimglist);
      wx.setStorageSync("gid", goodid);}

    }

  },

  // 三 进入所点图片
  goCropperImg: function(e) {
    let {
      idx,
      num
    } = e.currentTarget.dataset;
    let goCropperImg = this.data.imgList[idx];
    wx.navigateTo({
      url: '../index/index?idx=' + idx + '&src=' + goCropperImg.src + '&num=' + num
    });
  },


  deleteImg: function(e) {
    var imgs = this.data.imgList;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);

    var allnums = 0;
    for (var a = 0; a < imgs.length; a++) {
      allnums = allnums + imgs[a].num;
    } 

    this.setData({
      imgList: imgs,
      allimgnum: allnums,

    });
  },


  // 一 弹出选择图片
  onChooseImg: function() {
    let that = this;
    var imgpx = that.data.px;
    var isizeok = true;
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
      
          that.upload_file('', tempFiles[index].path, tempFiles[index].size);       

        }
        var allnums = 0;
        for (var a = 0; a < that.data.imgList.length; a++) {
          allnums = allnums + that.data.imgList[a].num;
        }
        that.setData({
          allimgnum: allnums
        })

      }
    });


    

    console.log("aaaa1111");
    console.log(that.data.imgList);
    /*for (let iii in that.data.imgList) {
      console.log("that.data.imgList：" + that.data.imgList[iii].src);
      wx.getImageInfo({
        src: that.data.imgList[iii].src,
        success(res) {
          var onewidth = res.width;
          var oneheight = res.height;
          var onesize = onewidth * oneheight;
          console.log("照片像素" + onesize);
          if (onesize < imgpx * 1024) {
            console.log("照片像素低");
            //this.data.imgList[ii].sizeok=false;
          } else {
            console.log("照片像素可以");
            //this.data.imgList[ii].sizeok = true;
          }
        }
      });
    }*/



    // let allnum = that.data.total;



  },


  // 上传
  choose: function() {
    var that = this;
    var imgList = that.data.imgList;
    var imagenum = that.data.imagenum;
    var imglengths = parseInt(that.data.imgList.length) + 1;
    var total = that.data.total;
    var number = that.data.number;
    var goodid = wx.getStorageSync('goodsid');


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
          content: '您选择了' + allnum + '张照片,\r\n购买了' + total + '件商品，\r\n亲重新选择。',
          showCancel: false,
          //confirmText: '去付款',
          confirmText: '好的',
          success(res) {
            /* 
             if (res.confirm) {

               wx.navigateTo({
                 url: "/pages/order/pay/index?id=" + orderid
               })
               wx.removeStorageSync("historyimglist");
               wx.removeStorageSync("allhistoryimglist");
             }
             */
          }
        })
      } else {
        console.log(orderid)
        console.log('orderid')
        wx.navigateTo({
          url: "/pages/order/pay/index?id=" + orderid
        })
        wx.removeStorageSync("historyimglist");
        wx.removeStorageSync("allhistoryimglist");
      }



    } else {
      if (number == 1) {
        var historyimglist = that.data.imgList;
        console.log('张数过多购买')
        console.log(historyimglist)
        wx.setStorageSync("historyimglist", historyimglist);
        wx.setStorageSync("gid", goodid);
        wx.setStorageSync("other", 333);
        wx.showModal({
          title: '提示',
          content: '您选择了：' + allnum + '张照片;\r\n您购买的数量是：' + total + ';\r\n请修改数量。',
          showCancel: false,
          confirmText: '知道了',
          success(res) {

          }
        })
      } else {
        console.log('张数过多')
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '您上传的照片数超过购买的图片张数，去删几张吧'
        })
      }
    }

  },

  // 二  将所选图片遍历出来
  upload_file: function(url, filePath, ifilesize) {
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
        num: 1,
        filesize: ifilesize
      });

      wx.setStorageSync(imglength, imgList.length);

      

      this.setData({
        imgList: imgList,
        waitUploadNum: --that.data.waitUploadNum
      });
    }, 500)

  },
})