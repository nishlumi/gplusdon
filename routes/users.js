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
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appusers', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id', function (req, res) {
        if (req.params.id == ucommon.swjs) return;
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    var api = cls_mstdn.loadAPImaster(req.params.instance);
    var userdata = {};
        /*res.render('appuser', {
            sysinfo: info.sysinfo,
            lang: info.lang,
            transjs: info.trans,
            trans : info.realtrans,
            instance: req.params.instance,
            uid: req.params.id,
            id : "",
            page: "home",
            userdata: JSON.stringify(userdata),
            csrfToken: req.csrfToken(),
            menustat: menuStatus
        });
    }else{*/
        cls_mstdn.getUser(api,req.params.instance,req.params.id)
        //api.getUser(req.params.instance, req.params.id)
        //userdata = api.originalGet(`https://${req.params.instance}/api/v1/accounts/${tmpuser.id}`);
        .then(result=>{
            console.log(req,result);
            //---set up og:
            if ((result) && ("id" in result)) {
                var name = (result.display_name.trim() == "" ? result.username : result.display_name);
                info.sysinfo.oginfo.title = ucommon._T(info.realtrans, "lab_profile", [`${name}@${result.instance}`]);
                info.sysinfo.oginfo.description = result.text;
                info.sysinfo.oginfo.type = "profile";
                info.sysinfo.oginfo.url = `https://${req.hostname}/users/${req.params.instance}/${req.params.id}`;
                info.sysinfo.oginfo.image = result.avatar;

            }
            var realid = "";
            if ("_gp_logined" in req.cookies) {
                userdata = {};
                //realid = result.id;
                //userdata = result;
            } else {
                realid = result.id;
                userdata = result;
            }

            res.render('appuser', {
                sysinfo: info.sysinfo,
                lang: info.lang,
                transjs: info.trans,
                trans : info.realtrans,
                instance: req.params.instance,
                uid: req.params.id,
                realid : realid,
                page: "home",
                userdata: JSON.stringify(userdata),
                csrfToken: req.csrfToken(),
                menustat: menuStatus
            });
            
            
            
        });
    //}
});
router.get('/:instance/:id/:page', function (req, res) {
    //var lan = req.acceptsLanguages();   
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('appuser', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans : info.realtrans,
        instance: req.params.instance,
        uid: req.params.id,
        page: req.params.page,
        csrfToken: req.csrfToken(),
        menustat: menuStatus
    });
});
router.get('/:instance/:id/toots/:tootid', function (req, res) {
    //if (req.params.tootid == ucommon.swjs) return;
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    var api = cls_mstdn.loadAPImaster(req.params.instance);

    var userdata = {};
    var pro = [];
    var opt = {
        api : {},
        app : {}
    };
    var targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}`;
    pro.push(api.originalGet(targeturl, opt));

    targeturl = `https://${req.params.instance}/api/v1/statuses/${req.params.tootid}/context`;
    pro.push(api.originalGet(targeturl, opt));

    pro.push(cls_mstdn.getUser(api, req.params.instance, req.params.id));

    Promise.all(pro)
        .then(result => {
            var fnldata = {
                toot: result[0],
                context: result[1]
            };
            userdata = result[2];

            res.render('appuser', {
                sysinfo: info.sysinfo,
                lang: info.lang,
                transjs: info.trans,
                trans: info.realtrans,
                instance: req.params.instance,
                uid: req.params.id,
                page: "home",
                onetoote: JSON.stringify(fnldata),
                userdata: JSON.stringify(userdata),
                csrfToken: req.csrfToken(),
                menustat: menuStatus
            });
        })
        .catch(error => {
            var fnldata = {
                toot: {},
                context: {}
            };
            res.render('appuser', {
                sysinfo: info.sysinfo,
                lang: info.lang,
                transjs: info.trans,
                trans: info.realtrans,
                instance: req.params.instance,
                uid: req.params.id,
                page: "home",
                onetoote: JSON.stringify(fnldata),
                userdata: JSON.stringify(userdata),
                csrfToken: req.csrfToken(),
                menustat: menuStatus
            });
        });
});

module.exports = router;
