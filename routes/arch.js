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
    directmsg: "active",
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
    res.render('apparchmain', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});


module.exports = router;
