'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var router = express.Router();

var menuStatus = {
    start: "",
    dashboard: "",
    timeline: "active",
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
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('apptimeline', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        "timelinetype": "home",
        timelinetypeid: "",
        csrfToken: req.csrfToken(),
        onetoote : "",
        menustat: menuStatus
    });
});
router.get('/:type', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('apptimeline', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        "timelinetype": req.params.type,
        timelinetypeid: "",
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});
router.get('/lists/:type', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('apptimeline', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        "timelinetype": "list",
        timelinetypeid: req.params.type,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});
router.get('/tags/:type', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('apphashtag', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        "timelinetype": "tags",
        timelinetypeid: req.params.type,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});

module.exports = router;
