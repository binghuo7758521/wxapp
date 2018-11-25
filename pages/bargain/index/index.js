var t = getApp(), a = t.requirejs("core");

t.requirejs("jquery"), t.requirejs("foxui");

Page({
    data: {
        list: {},
        emptyHint: !1,
        label: "/static/images/label.png"
    },
    onLoad: function() {
        var e = this;
        a.get("bargain/get_list", {}, function(t) {
            console.log(t), e.setData({
                list: t.list
            });
        }), t.getCache("isIpx") ? e.setData({
            isIpx: !0,
            iphonexnavbar: "fui-iphonex-navbar"
        }) : e.setData({
            isIpx: !1,
            iphonexnavbar: ""
        });
    },
    bindFocus: function() {
        this.setData({
            fromsearch: !0
        });
    },
    bindback: function() {
        this.setData({
            fromsearch: !1
        }), this.onLoad();
    },
    bindSearch: function(t) {
        console.log(t.detail);
        var e = this, i = t.detail.value;
        a.get("bargain/get_list", {
            keywords: i
        }, function(t) {
            console.log(t.list.length), t.list.length <= 0 ? e.setData({
                emptyHint: !0
            }) : e.setData({
                emptyHint: !1
            }), e.setData({
                list: t.list
            });
        });
    }
});