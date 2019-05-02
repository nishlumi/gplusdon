'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var cls_mstdn = require("../apps/cls_mstdn");

var router = express.Router();

var menuStatus = {
    start: "",
    dashboard: "",
    timeline: "",
    accounts: "active",
    connections: "",
    directmsg: "",
    favourite: "",
    lists: "",
    instances: "",
    notifications: "",
    settings: ""
};
/* GET users listing. */
router.get('/', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appaccounts', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appaccount', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus,
        instance: req.params.instance,
        uid : req.params.id
    });
});
router.get('/:instance/:id/toots/:tootid', function (req, res) {
    //if (req.params.tootid == ucommon.swjs) return;
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    var api = cls_mstdn.loadAPImaster(req.params.instance);

    var userdata = {};
    var pro = [];
    var opt = {
        api: {},
        app: {}
    };
    var targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}`;
    pro.push(api.originalGet(targeturl, opt));

    targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}/context`;
    pro.push(api.originalGet(targeturl, opt));

    Promise.all(pro)
        .then(result => {
            var fnldata = {
                toot: result[0],
                context: result[1]
            };
            res.render('appaccount', {
                sysinfo: info.sysinfo,
                lang: info.lang,
                transjs: info.trans,
                trans: info.realtrans,
                instance: req.params.instance,
                uid: req.params.id,
                page: "home",
                onetoote: JSON.stringify(fnldata),
                userdata: JSON.stringify(userdata),
                csrfToken: req.csrfToken(),
                menustat: menuStatus
            });
        })
        .catch(error => {
            var fnldata = {
                toot: {},
                context: {}
            };
            res.render('appaccount', {
                sysinfo: info.sysinfo,
                lang: info.lang,
                transjs: info.trans,
                trans: info.realtrans,
                instance: req.params.instance,
                uid: req.params.id,
                page: "home",
                onetoote: JSON.stringify(fnldata),
                userdata: JSON.stringify(userdata),
                csrfToken: req.csrfToken(),
                menustat: menuStatus
            });
        });
});
module.exports = router;
