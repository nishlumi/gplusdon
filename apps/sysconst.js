var packagejson = require('../package.json');

var sysconst = {
    server_token: function () {
        return "";
    },
    vap_id: function () {
        return "BCGiOKTrNfAFmIPybyacC2UcM2y9zJlDCtacpZoX44U4QjkY1HtaLla0leTn5HWXUevOrSFwb3xunrHHffdPaek=";
    },
    yh_id: "-",
    package_info: packagejson,
    gdrive: {
        "web": {
            "api_key": '',
            "client_id": "",
            "project_id": "gplus-mastodon-webclient",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "",
            "javascript_origins": ["http://localhost:1337", "http://localhost:3000", "https://gplusdon.net", "https://gplusdon.azurewebsites.net", "https://gpdontest.azurewebsites.net"]
        }
    }
};

module.exports = sysconst;