var e = require("utils/core.js");

App({
  onShow: function() {
    this.onLaunch();
  },
  onLaunch: function() {


    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    });
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '检测到有更新的版本，请更新小程序',
        confirmText: '更新',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    });

    var e = this;
    wx.getSystemInfo({
      success: function(t) {
        "0" == t.model.indexOf("iPhone X") ? e.setCache("isIpx", t.model) : e.setCache("isIpx", "");
      }
    });
    var t = this;
    wx.getSystemInfo({
      success: function(e) {
        wx.setStorageSync("systemInfo", e);
        var n = e.windowWidth,
          o = e.windowHeight;
        t.globalData.ww = n, t.globalData.hh = o;
      }
    }), this.getConfig();
    this.getUserInfo(function(e) {}, function(e, t) {
      var t = t ? 1 : 0,
        e = e || "";
      t && wx.redirectTo({
        url: "/pages/message/auth/index?close=" + t + "&text=" + e
      });
    });
  },
  requirejs: function(e) {
    return require("utils/" + e + ".js");
  },
  getConfig: function() {
    if (null !== this.globalData.api) return {
      api: this.globalData.api,
      approot: this.globalData.approot,
      appid: this.globalData.appid
    };
    var e = wx.getExtConfigSync();
    return console.log(e), this.globalData.api = e.config.api, this.globalData.approot = e.config.approot,
      this.globalData.appid = e.config.appid, e.config;
  },
  getCache: function(e, t) {
    var n = +new Date() / 1e3,
      o = "";
    n = parseInt(n);
    try {
      (o = wx.getStorageSync(e + this.globalData.appid)).expire > n || 0 == o.expire ? o = o.value : (o = "",
        this.removeCache(e));

    } catch (e) {
      o = void 0 === t ? "" : t;
    }
    return o = o || "";
  },
  setCache: function(e, t, n) {
    var o = +new Date() / 1e3,
      i = !0,
      a = {
        expire: n ? o + parseInt(n) : 0,
        value: t
      };
    try {
      wx.setStorageSync(e + this.globalData.appid, a);
    } catch (e) {
      i = !1;
    }
    return i;
  },
  removeCache: function(e) {
    var t = !0;
    try {
      wx.removeStorageSync(e + this.globalData.appid);
    } catch (e) {
      t = !1;
    }
    return t;
  },
  getUserInfo: function(t, n) {
    var o = this,
      i = {};
    !(i = o.getCache("userinfo")) || i.needauth ? wx.login({
      success: function(a) {
        console.log("wx.login:success:a");
        console.log(a);
        a.code ? e.post("wxapp/login", {
          code: a.code
        }, function(a) {
          a.error ? e.alert("获取用户登录态失败1:" + a.message) : a.isclose && n && "function" == typeof n ? n(a.closetext, !0) : wx.getUserInfo({
            success: function(n) {
              i = n.userInfo, e.get("wxapp/auth", {
                data: n.encryptedData,
                iv: n.iv,
                sessionKey: a.session_key
              }, function(e) {
                1 == e.isblack && wx.showModal({
                    title: "无法访问",
                    content: "您在商城的黑名单中，无权访问！",
                    success: function(e) {
                      e.confirm && o.close(), e.cancel && o.close();
                    }
                  }), n.userInfo.openid = e.openId, n.userInfo.id = e.id, n.userInfo.uniacid = e.uniacid,
                  n.needauth = 0,
                  //o.setCache("userinfo", n.userInfo, 7200), 
                  o.setCache("userinfo", n.userInfo),
                  o.setCache("userinfo_openid", n.userInfo.openid),
                  o.setCache("userinfo_id", e.id), o.getSet(), t && "function" == typeof t && t(i);
              });
            },
            fail: function(ree) {
              console.log(ree), e.get("wxapp/check", {
                openid: a.openid
              }, function(e) {
                console.log(e), 1 == e.isblack && wx.showModal({
                    title: "无法访问",
                    content: "您在商城的黑名单中，无权访问！",
                    success: function(e) {
                      e.confirm && o.close(), e.cancel && o.close();
                    }
                  }), e.needauth = 1,
                  //o.setCache("userinfo", e, 7200),
                  o.setCache("userinfo", e),
                  o.setCache("userinfo_openid", a.openid),
                  o.setCache("userinfo_id", a.id), o.getSet(), t && "function" == typeof t && t(i);
              });
            }
          });
        }) : e.alert("获取用户登录态失败2:" + a.errMsg);
      },
      fail: function() {
        e.alert("获取用户信息失败!");
      }
    }) : t && "function" == typeof t && t(i);
  },
  close: function() {
    this.globalDataClose.flag = !0, wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  getSet: function() {
    var t = this;
    "" == t.getCache("cacheset") && setTimeout(function() {
      var n = t.getCache("cacheset");
      e.get("cacheset", {
        version: n.version
      }, function(e) {
        e.update && t.setCache("cacheset", e.data);
      });
    }, 10);
  },
  url: function(e) {
    e = e || {};
    var t = {},
      n = "",
      o = "",
      i = this.getCache("usermid");
    n = e.mid || "", o = e.merchid || "", "" != i ? ("" != i.mid && void 0 !== i.mid || (t.mid = n),
        "" != i.merchid && void 0 !== i.merchid || (t.merchid = o)) : (t.mid = n, t.merchid = o),
      //this.setCache("usermid", t, 7200);
      this.setCache("usermid", t);
  },
  impower: function(e, t, n) {
    wx.getSetting({
      success: function(o) {
        console.log(o), o.authSetting["scope." + e] || wx.showModal({
          title: "用户未授权",
          content: "您点击了拒绝授权，暂时无法" + t + "，点击去设置可重新获取授权喔~",
          confirmText: "去设置",
          success: function(e) {
            e.confirm ? wx.openSetting({
              success: function(e) {}
            }) : "route" == n ? wx.switchTab({
              url: "/pages/index/index"
            }) : "details" == n || wx.navigateTo({
              url: "/pages/index/index"
            });
          }
        });
      }
    });
  },
  globalDataClose: {
    flag: !1
  },
  globalData: {


     appid: "wx176d614a68387fbb",
     api: "https://secai.ahjcg.com/app/ewei_shopv2_api.php?i=2",
     approot: "https://secai.ahjcg.com/addons/ewei_shopv2/",
    //appid: "wxa954c9edf8a55134",
   // api: "https://xcxtest.ahjcg.com/app/ewei_shopv2_api.php?i=1",
   // approot: "https://xcxtest.ahjcg.com/addons/ewei_shopv2/",
    userInfo: null
  },
  speclist: [
    {
      "spec_id": 11,    //编号
      "spec_title": "一寸", //尺寸名称
      "photo_width": 23,  //相片宽度，单位mm
      "photo_height": 35,  //相片高度，单位mm
      "print_width": 89,  //相纸宽度，单位mm
      "print_height": 127,  //相纸高度，单位mm
      "print_num": 8,  //打印张数
      "bg_color": [   // 背景可选颜色，chosen为1则为默认颜色
        {
          "title": "白",
          "color": "#ffffff",
          "chosen": 1
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0"
        }
      ]
    },
    {
      "spec_id": 12,
      "spec_title": "二寸",
      "photo_width": 35,
      "photo_height": 52,
      "print_width": 89,
      "print_height": 127,
      "print_num": 4,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff",
          "chosen": 1
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0"
        }
      ]
    },
    {
      "spec_id": 13,
      "spec_title": "小二寸",
      "photo_width": 33,
      "photo_height": 48,
      "print_width": 89,
      "print_height": 127,
      "print_num": 4,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff",
          "chosen": 1
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0"
        }
      ]
    },
    /*{
      "spec_id": 15,
      "spec_title": "小一寸",
      "photo_width": 22,
      "photo_height": 32,
      "print_width": 89,
      "print_height": 127,
      "print_num": 8,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff",
          "chosen": 1
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0"
        }
      ]
    },*/
    {
      "spec_id": 16,
      "spec_title": "欧洲签",
      "photo_width": 35,
      "photo_height": 45,
      "print_width": 89,
      "print_height": 127,
      "print_num": 4,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff",
          "chosen": 1
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0"
        }
      ]
    },
    {
      "spec_id": 17,
      "spec_title": "日签",
      "photo_width": 45,
      "photo_height": 45,
      "print_width": 89,
      "print_height": 127,
      "print_num": 2,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff"
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0",
          "chosen": 1
        }
      ]
    },
    {
      "spec_id": 18,
      "spec_title": "美签",
      "photo_width": 51,
      "photo_height": 51,
      "print_width": 89,
      "print_height": 127,
      "print_num": 2,
      "bg_color": [
        {
          "title": "白",
          "color": "#ffffff"
        },
        {
          "title": "红",
          "color": "#ff0000"
        },
        {
          "title": "蓝",
          "color": "#458fd0",
          "chosen": 1
        }
      ]
    },
  ]
});