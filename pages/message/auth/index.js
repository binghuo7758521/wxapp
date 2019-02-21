var t = getApp();

Page({
    data: {
        close: 0,
        text: ""
    },
    onLoad: function(t) {
        console.log(t), this.setData({
            close: t.close,
            text: t.text
        });
    },
    onShow: function() {
        var e = t.getCache("sysset").shopname;
        wx.setNavigationBarTitle({
            title: e || "提示"
        });
    },
    bind: function() {
        var that = this,c=t.getCache("usermid").mid, e = setInterval(function() {
            wx.getSetting({
                success: function(n) {
                  console.log("getSetting:sucess");                  
                    var a = n.authSetting["scope.userInfo"];                    
                    a && (wx.reLaunch({
                        url: "/pages/index/index"+"?mid="+c
                    }), clearInterval(e), that.setData({
                        userInfo: a
                      }), t.getUserInfo(function (e) { }, function (aa, bb) { }));
                  ;
                }
            });
        }, 1e3);
    }
});