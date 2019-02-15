'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var router = express.Router();

var menuStatus = {
    start: "",
    dashboard: "",
    timeline: "",
    accounts: "",
    connections: "active",
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
    var tabcss = {
        "finder": "",
        "list": "",
        "frequest": "",
        "following": "",
        "follower": ""
    };
    tabcss["following"] = "active";

    res.render('appconnections', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        page : "following",
        "tabstates": tabcss,
       csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:page', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    var tabcss = {
        "finder": "",
        "list": "",
        "frequest": "",
        "following": "",
        "follower": ""
    };
    tabcss[req.params.page] = "active";
    res.render('appconnections', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        page: req.params.page,
        "tabstates": tabcss,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
module.exports = router;
