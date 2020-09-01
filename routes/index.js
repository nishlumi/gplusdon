'use strict';
var express = require('express');
const path = require("path");
const fs = require("fs");
var cls_mstdn = require("../apps/cls_mstdn");

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
    /*var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(req, lan);
    var js = JSON.parse(trans);
    ucommon.sysinfo.oginfo.description = js.appDescription;*/
    var info = ucommon.analyze_locale(req);
    
    menuStatus.start = "active";
    res.render('appinitial', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        avalangs : JSON.stringify(info.avalable_strings),
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus,
        postarr: [1, 2, 3, 4, 5, 6]
    });
});

router.get('/dashboard', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    
    res.render('appdashboard', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/test', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    menuStatus.dashboard = "active";
    res.render('appmain', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/redirect', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(lan);
    var info = ucommon.analyze_locale(req);

    res.render('redirect', {
        sysinfo: ucommon.sysinfo,
        lang: info.lang
        //transjs: trans

    });
});
router.get('/notifications', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    menuStatus.notifications = "active";
    res.render('appnotifications', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});

router.get('/settings', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    menuStatus.settings = "active";
    res.render('appsettings', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/s', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    res.render('appsearch', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        findtext : "",
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});
router.get('/terms', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    clearStatus();
    res.render('terms', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus

    });
});

router.post('/srv/ogp', function (req, res) {
    //console.log(req.body["url"], req.headers.referer);
    var info = ucommon.analyze_locale(req);
    var text = ucommon.load_website_ogp(req, info, req.body["url"]);
    text.then(result => {
        //console.log("text=", result);
        res.send(JSON.stringify(result));
    })
    .catch(error=>{
        res.send(error);
    });
});
router.get('/srv/iapi', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(lan);
    var text = ucommon.load_instance_search_token(req);
    res.send(text);
    
});
router.get('/srv/geolocation', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(lan);
    console.log(req.query);
    var text = ucommon.get_geolocation(req,req.query);
    text.then(result=>{
        res.send(result);
    });
});
router.post('/srv/outerimage', function (req, res) {
    var info = ucommon.analyze_locale(req);
    var text = ucommon.get_outerimage(req, req.body);
    text.then(result => {
        //console.log("text=", result);
        res.send(result);
    })
    .catch(error => {
        res.send(error);
    });
});
router.get('/srv/accounts/:instance/:id', function (req, res) {
    var api = cls_mstdn.loadAPImaster();
    cls_mstdn.getUser(api, req.params.instance, req.params.id)
        .then(result => {
            res.send(result);
        });
});
router.get('/.well-known/assetlinks.json', function (req, res) {
    var asfile = "/static/well-known/assetlinks.json";
    var fpath = path.join(__user_dirname + "/..", asfile);
    var ret = {};
    if (fs.existsSync(fpath)) {
        ret = fs.readFileSync(fpath, "utf-8");
        res.send(JSON.parse(ret));
    } else {
        res.send(ret);
    }

});
router.get('/srv/ini0ag', function (req, res) {
    var rtn = ucommon.load_gapiInfo(req);
    res.send(rtn);

});

/*
router.get("/srv/test1", function (req, res) {
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=35.6694071,139.88545969999998&radius=1000&";
    cls_mstdn.originalGet(url, { api: {}, app: {}})
    .then(result => {
        res.send(result);
    });
});
*/
router.get('/srv/pleroma/:instance/:version/:endpoint', function (req, res) {
    var v = req.params.version.replace("_","/");
    cls_mstdn.originalGet(`https://${req.params.instance}/${v}/${req.params.endpoint}`, {})
    .then(result => {
        res.send(result);
    });



});
router.post('/srv/pleroma/:instance/:version/:endpoint', function (req, res) {
    var v = req.params.version.replace("_", "/");
    cls_mstdn.originalPost(`https://${req.params.instance}/${v}/${req.params.endpoint}`, {})
        .then(result => {
            res.send(result);
        });
});
module.exports = router;
