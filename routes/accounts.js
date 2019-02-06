'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
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
module.exports = router;
