'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
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
    instances: "active",
    notifications: "",
    settings: ""
};

/* GET users listing. */
router.get('/', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appinstances', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        init_instance : "",
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appinstances', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        init_instance: req.params.instance,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
module.exports = router;
