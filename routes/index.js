'use strict';
var express = require('express');
const fs = require("fs");

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
    instances: "",
    notifications: "",
    settings: ""
};
const __user_dirname = __dirname.replace("apps", "");

function clearStatus() {
    for (var obj in menuStatus) {
        menuStatus[obj] = "";
    }
}
/* GET home page. */
router.get('/', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    var author = ucommon.load_author();
    menuStatus.start = "active";
    res.render('appinitial', {
        sysinfo : ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus,
        ainfos : author,
        postarr: [1, 2, 3, 4, 5, 6]
    });
});

router.get('/test', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    clearStatus();
    menuStatus.dashboard = "active";
    res.render('appmain', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/redirect', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(lan);
    res.render('redirect', {
        sysinfo: ucommon.sysinfo,
        //transjs: trans

    });
});
router.get('/notifications', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    clearStatus();
    menuStatus.notifications = "active";
    res.render('appnotifications', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});

router.get('/settings', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    clearStatus();
    menuStatus.settings = "active";
    res.render('appsettings', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/s/:findtext', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    clearStatus();
    res.render('appsearch', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        findtext : req.params.findtext,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});

router.post('/srv/ogp', function (req, res) {
    //console.log(req.body["url"], req.headers.referer);
    var text = ucommon.load_website_ogp(req, req.body["url"]);
    text.then(result => {
        //console.log("text=", result);
        res.send(result);
    });
});
router.get('/srv/iapi', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(lan);
    var text = ucommon.load_instance_search_token(req);
    res.send(text);
    
});
router.get('/sw-reg.js', function (req, res) {
    var lofile = path.join(__user_dirname, `../pwabuilder-sw-register.js`);
    var ret = "";
    if (fs.existsSync(lofile)) {
        ret = fs.readFileSync(lofile, "utf-8");
    }
    res.format({
        "application/javascript": function () {
            res.send(ret);
        }
    });
    

});
router.get('/sw.js', function (req, res) {
    var lofile = path.join(__user_dirname, `../pwabuilder-sw.js`);
    var ret = "";
    if (fs.existsSync(lofile)) {
        ret = fs.readFileSync(lofile, "utf-8");
    }
    res.format({
        "application/javascript": function () {
            res.send(ret);
        }
    });

});

module.exports = router;
