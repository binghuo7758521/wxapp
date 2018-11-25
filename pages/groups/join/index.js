var a = getApp(), o = a.requirejs("core"), t = (a.requirejs("jquery"), a.requirejs("foxui"), 
0);

Page({
    data: {
        layershow: !1,
        chosenum: !1,
        options: !1,
        optionarr: [],
        selectSpecsarr: [],
        goods_id: 0
    },
    onLoad: function(a) {
        var t = this, e = a.id;
        this.setData({
            goods_id: e
        }), o.get("groups.goods.openGroups", {
            id: e
        }, function(a) {
            t.setData({
                data: a.data,
                teams: a.teams,
                ladder: a.ladder
            });
        });
    },
    joinTeam: function(a) {
        var t = this, e = o.pdata(a).type, s = o.pdata(a).op;
        if (t.setData({
            optionarr: [],
            selectSpecsarr: []
        }), "creat" == s ? t.setData({
            op: "creat"
        }) : t.setData({
            op: ""
        }), "ladder" == e) {
            d = t.data.data.id;
            o.get("groups.goods.goodsCheck", {
                id: d,
                type: "group"
            }, function(a) {
                0 == a.error ? t.setData({
                    layershow: !0,
                    chosenum: !0
                }) : wx.showToast({
                    title: a.message,
                    icon: "none",
                    duration: 2e3
                });
            });
        } else if (0 == t.data.data.more_spec) {
            d = t.data.data.id;
            o.get("groups.goods.goodsCheck", {
                id: d,
                type: "group"
            }, function(a) {
                0 == a.error ? "creat" == s ? wx.navigateTo({
                    url: "/pages/groups/confirm/index?type=groups&id=" + d + "&heads=1"
                }) : o.get("groups.goods.check_tuan", {
                    id: d,
                    type: "group"
                }, function(a) {
                    a.data.order_num <= 0 ? o.alert("暂无拼团") : wx.navigateTo({
                        url: "/pages/groups/jointeam/index?id=" + d
                    });
                }) : wx.showToast({
                    title: a.message,
                    icon: "none",
                    duration: 2e3
                });
            });
        } else {
            var d = t.data.data.id;
            o.get("groups.goods.goodsCheck", {
                id: d,
                type: "group"
            }, function(a) {
                0 == a.error ? (o.get("groups.goods.get_spec", {
                    id: d
                }, function(a) {
                    t.setData({
                        spec: a.data
                    });
                }), t.setData({
                    layershow: !0,
                    options: !0
                })) : wx.showToast({
                    title: a.message,
                    icon: "none",
                    duration: 2e3
                });
            });
        }
    },
    chosenum: function(a) {
        var t = o.pdata(a).index, e = o.pdata(a).goodsid, s = o.pdata(a).id, d = o.pdata(a).price;
        console.log(d), this.setData({
            selectindex: t,
            id: e,
            ladder_id: s,
            ladder_price: d
        });
    },
    close: function() {
        this.setData({
            layershow: !1,
            chosenum: !1,
            options: !1
        });
    },
    ladder_buy: function() {
        var a = this;
        a.data.ladder_id ? ("creat" != this.data.op ? o.get("groups.goods.check_tuan", {
            id: a.data.goods_id,
            ladder_id: a.data.ladder_id
        }, function(t) {
            t.data.ladder_num <= 0 ? o.alert("暂无拼团") : wx.navigateTo({
                url: "/pages/groups/jointeam/index?id=" + a.data.goods_id + "&ladder_id=" + a.data.ladder_id,
                success: function() {
                    a.setData({
                        layershow: !1,
                        chosenum: !1,
                        options: !1
                    });
                }
            });
        }) : wx.navigateTo({
            url: "/pages/groups/confirm/index?id=" + a.data.goods_id + "&heads=1&type=groups&ladder_id=" + a.data.ladder_id,
            success: function() {
                a.setData({
                    layershow: !1,
                    chosenum: !1,
                    options: !1
                });
            }
        }), this.close()) : o.alert("请选择拼团人数");
    },
    specsTap: function(a) {
        t++;
        var e = this, s = e.data.spec, d = o.pdata(a).spedid, i = o.pdata(a).id, n = o.pdata(a).specindex;
        o.pdata(a).idx;
        s[n].item.forEach(function(a, o) {
            a.id == i ? s[n].item[o].status = "active" : s[n].item[o].status = "";
        }), e.setData({
            spec: s
        });
        var r = e.data.optionarr, p = e.data.selectSpecsarr;
        1 == t ? (r.push(i), p.push(d)) : p.indexOf(d) > -1 ? r.splice(n, 1, i) : (r.push(i), 
        p.push(d)), e.data.optionarr = r, e.data.selectSpecsarr = p, console.log(e.data.optionarr), 
        o.post("groups.goods.get_option", {
            spec_id: e.data.optionarr,
            groups_goods_id: e.data.goods_id
        }, function(a) {
            console.log(a), e.setData({
                optiondata: a.data
            });
        });
    },
    buy: function(a) {
        var t = this, e = o.pdata(a).op, s = t.data.goods_id, d = t.data.optiondata;
        t.data.optiondata ? "creat" == e ? d.stock > 0 ? wx.navigateTo({
            url: "/pages/groups/confirm/index?id=" + s + "&heads=1&type=groups&option_id=" + d.id,
            success: function() {
                t.setData({
                    layershow: !1,
                    chosenum: !1,
                    options: !1
                });
            }
        }) : wx.showToast({
            title: "库存不足",
            icon: "none",
            duration: 2e3
        }) : d.stock > 0 ? o.get("groups.goods.check_tuan", {
            id: s,
            type: "group"
        }, function(a) {
            a.data.order_num <= 0 ? o.alert("暂无拼团") : wx.navigateTo({
                url: "/pages/groups/jointeam/index?id=" + s + "&option_id=" + d.id,
                success: function() {
                    t.setData({
                        layershow: !1,
                        chosenum: !1,
                        options: !1
                    });
                }
            });
        }) : wx.showToast({
            title: "库存不足",
            icon: "none",
            duration: 2e3
        }) : wx.showToast({
            title: "请选择规格",
            icon: "none",
            duration: 2e3
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});