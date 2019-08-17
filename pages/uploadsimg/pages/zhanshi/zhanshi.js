var app = getApp(),
  s = app.requirejs("core"),
  c = app.requirejs("biz/goodspicker");
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
    allimgnum:0,//已选择照片总数量
    taocanshuliang:0,//套餐数量；
    btndisabled: false //防止上传按钮连续点击两次,点击按钮后，把按钮置为disabled  失败再置会enable

  },

  onLoad: function(opt) {
    let t = this;
    var goodid = wx.getStorageSync('goodsid');
    let pages = wx.getStorageSync('imgUrl');
    var taocan= wx.getStorageSync("taonumbers");
    var ptoption = wx.getStorageSync("photo_goodoption")
    wx.removeStorageSync("imgUrl");
    wx.removeStorageSync("imgList");



    wx.onMemoryWarning(function (res) {
      console.log('微信的内存警告测试点:'+res)
    });


    
    var size = ptoption.size;
    var width = ptoption.width;
    var height = ptoption.hight;
    if (width > 5 && height > 5) {
      var width = width * 0.5;
      var height = height * 0.5;
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






     var allnums = 0;
    for (var a = 0; a < pages.length; a++) {
      allnums = allnums + pages[a].num;
    } 

    t.setData({
      imgList: pages,
      btndisabled: false,
      taocanshuliang: ptoption.taocannum,
      px: ptoption.px,
      allimgnum: allnums
    });

     



/*
    s.get("order/orderdata", "", function(e) {

      console.log("order/orderdata:return:",e)
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



    });*/

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


  onUnload: function() {
    let mm = this;
    var goodid = wx.getStorageSync('goodsid')
    var number = mm.data.number
    var allhistoryimglist = mm.data.imgList
    if (number == 1) {
      //重买
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
    let {
      imgList,
      waitUploadNum
    } = that.data;




    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        let tempFiles = res.tempFiles;
        //that.setData({
        //  waitUploadNum: tempFiles.length
        //});
        //优化移到356行

        for (let index in tempFiles) {
      
          //that.upload_file('', tempFiles[index].path, tempFiles[index].size);   

          imgList.push({
            src: tempFiles[index].path,
            num: 1,
            filesize: tempFiles[index].size
          });  


        }      


        var allnums = 0;
        for (var a = 0; a < that.data.imgList.length; a++) {
          allnums = allnums + that.data.imgList[a].num;        
        };
        //、wx.getStorageSync("");
        wx.setStorageSync("imglength", that.data.imgList.length);
        that.setData({
          allimgnum: allnums,
          imgList:imgList,
          waitUploadNum: tempFiles.length
        })

      }
    })
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
    var taonumbers = wx.getStorageSync('taonumbers');
    var allnum = that.data.allimgnum;
    
    //修改商品数量   
    if (taonumbers==1){
    var ee = wx.getStorageSync("goodsdetail");   
    ee.data.total = that.data.allimgnum;
    wx.setStorageSync("goodsdetail", ee);
    }

    var nowTime = util.formatTime(new Date());
    var name = that.data.username;
    var optionname = that.data.optionname;
    var datas = that.data.orderdata;
    var ordernums = that.data.ordernum;
    var titles = that.data.goodstitle;
    var orderid = that.data.orderid;
    var ednum = that.data.ednum;
    console.log(that)


    //if (taonumbers == 1) {
      wx.setStorageSync("imgList", imgList);
      wx.setStorageSync("imagenum", imagenum);
      wx.setStorageSync("imglengths", imglengths);
      wx.setStorageSync("name", name);
      wx.setStorageSync("optionname", optionname);
      wx.setStorageSync("datas", datas);
      wx.setStorageSync("ordernums", ordernums);
      wx.setStorageSync("titles", titles);

    if ((taonumbers >1)&&(allnum !=taonumbers)) {       
        wx.showModal({
          title: '提示',
          content: '您选择了' + taonumbers + '张的套餐,\r\n请核对选择照片数量。',
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


        var tt = wx.getStorageSync('buybutton');
        var ee = wx.getStorageSync('goodsdetail');
        wx.removeStorageSync("historyimglist");
        wx.removeStorageSync("allhistoryimglist");  
        c.buyNow(tt, ee,"goods_detail");
       // wx.navigateTo({
          //url: "/pages/order/pay/index?id=" + orderid
          
       // })
       
      }



   // }
    /* else {
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
    }*/

  },

  // 二  将所选图片遍历出来
  upload_file: function(url, filePath, ifilesize) {
    let that = this;
    let {
      imgList,
      waitUploadNum
    } = this.data;
    var imglength = 0;  


    //setTimeout(() => { //王  不明白为什么要加延时
      // 模拟网络请求
      imgList.push({
        src: filePath,
        num: 1,
        filesize: ifilesize
      });

      //wx.setStorageSync("imglength", imgList.length);//移到外面 优化

      
    /*移到外面 优化
      this.setData({
        imgList: imgList,
        waitUploadNum: --that.data.waitUploadNum
      });*/
    console.log(" 遍历函数结束");
    //}, 500)

  },
  onImageLoadOk:function(e){
    let that = this;
   console.log("加载完毕"+e.currentTarget.dataset.idx);
    console.log(e.currentTarget);
   // that.data.imgList[e.currentTarget.dataset.idx].ImageLoadOk=1;
   // this.setData({
    //  imgList:that.data.imgList
    //});
  },
})