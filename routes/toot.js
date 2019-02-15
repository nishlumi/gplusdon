'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var router = express.Router();

/* GET users listing. */
router.get('/new', function (req, res) {
    //var lan = req.acceptsLanguages();
    //var trans = ucommon.load_translation(req,lan);
    var info = ucommon.analyze_locale(req);
    res.render('win_toot', {
        sysinfo: info.sysinfo,
        lang: info.lang,
        transjs: info.trans,
        trans: info.realtrans,
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;
