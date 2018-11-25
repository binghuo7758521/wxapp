var a = getApp(), e = a.requirejs("core");

a.requirejs("jquery"), a.requirejs("foxui");

Page({
    data: {
        goods: {},
        mid: ""
    },
    onLoad: function(i) {
        var o = this;
        e.get("bargain/purchase", i, function(a) {
            console.log(a), o.setData({
                goods: a.goods,
                mid: a.mid
            });
        }), a.getCache("isIpx") ? o.setData({
            isIpx: !0,
            iphonexnavbar: "fui-iphonex-navbar"
        }) : o.setData({
            isIpx: !1,
            iphonexnavbar: ""
        });
    }
});