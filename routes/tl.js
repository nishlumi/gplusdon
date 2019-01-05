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
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('apptimeline', {
        sysinfo: ucommon.sysinfo,
        "timelinetype": "home",
        timelinetypeid: "",
        transjs: trans,
        csrfToken: req.csrfToken(),
        onetoote : "",
        menustat: menuStatus
    });
});
router.get('/:type', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('apptimeline', {
        sysinfo : ucommon.sysinfo,
        "timelinetype": req.params.type,
        timelinetypeid: "",
        transjs: trans,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});
router.get('/lists/:type', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('apptimeline', {
        sysinfo: ucommon.sysinfo,
        "timelinetype": "list",
        timelinetypeid: req.params.type,
        transjs: trans,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});
router.get('/tags/:type', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('apphashtag', {
        sysinfo: ucommon.sysinfo,
        "timelinetype": "tags",
        timelinetypeid: req.params.type,
        transjs: trans,
        csrfToken: req.csrfToken(),
        onetoote: "",
        menustat: menuStatus
    });
});

module.exports = router;
