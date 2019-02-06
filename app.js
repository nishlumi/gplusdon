'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var nunjucks = require("nunjucks");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require("i18n-express");
var fs = require("fs");
var packagejson = require('./package.json');

var session = require("express-session");
var csurf = require('csurf');
var frameguard = require('frameguard')

var routes = require('./routes/index');
var users = require('./routes/users');
var accounts = require('./routes/accounts');
var connections = require('./routes/connections');
var instances = require('./routes/instances');
var tl = require('./routes/tl');
var toot = require('./routes/toot');
var direct = require('./routes/direct');

var app = express();
nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
    watch: true
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//app.set('layout', 'appbase');
app.enable('view cache');
//app.engine("html", require('hogan-xpress'));



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: new Date().valueOf(),
    resave: false,
    saveUninitialized : false
}));
app.use(csurf({
    cookie: true
}));
app.use("/static", express.static(path.join(__dirname, 'static')));
app.use("/pwabuilder-sw-register.js", express.static(path.join(__dirname, 'pwabuilder-sw-register.js')));
app.use("/pwabuilder-sw.js", express.static(path.join(__dirname, 'pwabuilder-sw.js')));

// set up i18n
/*app.use(i18n({
    // available locale
    siteLangs: ['ja', 'en'],
    defaultLang: 'ja',
    // dictionary file path
    translationsPath: path.join(__dirname, "/static/strings"),
    textsVarName : "trans"
}));*/

// Allow from a specific host:
app.use(frameguard({
    action: 'allow-from',
    domain: 'https://google.com'
}));


//app.set("partials", {"transjs":trans});


//---URL router
app.use('/', routes);
app.use('/accounts', accounts);
app.use('/users', users);
app.use('/connections', connections);
app.use('/instances', instances);
app.use('/tl', tl);
app.use('/toot', toot);
app.use('/direct', direct);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const finalport = (process.env.PORT || 3000);
app.set('port', finalport);
console.log(`Node.js + express starting following port: ${finalport} => http://localhost:${finalport}`);
console.log(packagejson.version);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
