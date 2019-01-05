'use strict';
var express = require('express');
var ucommon = require('../apps/ucommon');
var router = express.Router();

/* GET users listing. */
router.get('/new', function (req, res) {
    var lan = req.acceptsLanguages();
    var trans = ucommon.load_translation(lan);
    res.render('win_toot', {
        sysinfo: ucommon.sysinfo,
        transjs: trans,
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;
