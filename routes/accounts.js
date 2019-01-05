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
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('appaccounts', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('appaccount', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus,
        instance: req.params.instance,
        uid : req.params.id
    });
});
module.exports = router;
