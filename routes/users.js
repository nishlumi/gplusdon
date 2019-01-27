'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var cls_mstdn = require("../apps/cls_mstdn");
var router = express.Router();

var menuStatus = {
    start: "",
    dashboard: "",
    timeline: "",
    accounts: "",
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
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(req,lan);
    res.render('appusers', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(req,lan);
    var api = cls_mstdn.loadAPI(req.params.instance);
    var userdata = {};
    /*api.getUser(req.params.instance, req.params.id)
    .then(result => {
        userdata = result;
    })
    .finally(() => {*/
    res.render('appuser', {
        sysinfo: ucommon.sysinfo,
            instance: req.params.instance,
            uid: req.params.id,
            page: "home",
            userdata: JSON.stringify(userdata),
            transjs: trans,
            csrfToken: req.csrfToken(),
            menustat: menuStatus
        });
    //});
});
router.get('/:instance/:id/:page', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(req,lan);
    res.render('appuser', {
        sysinfo: ucommon.sysinfo,
        instance: req.params.instance,
        uid: req.params.id,
        page: req.params.page,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id/toots/:tootid', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(req,lan);
    var api = cls_mstdn.loadAPI();

    var userdata = {};
    var pro = [];
    var targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}`;
    pro.push(api.originalGet(targeturl, {}));

    targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}/context`;
    pro.push(api.originalGet(targeturl, {}));

    Promise.all(pro)
    .then(result => {
        var fnldata = {
            toot: result[0],
            context : result[1]
        };
        res.render('appuser', {
            sysinfo: ucommon.sysinfo,
            instance: req.params.instance,
            uid: req.params.id,
            page: "home",
            onetoote: JSON.stringify(fnldata),
            userdata: JSON.stringify(userdata),
            transjs: trans,
            csrfToken: req.csrfToken(),
            menustat: menuStatus
        });
    });
});

module.exports = router;
