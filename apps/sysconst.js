var packagejson = require('../package.json');

var sysconst = {
    server_token: function () {
        return "";
    },
    server_mastodon_cloud: function (type) {
        if (type == 0) { //---mastodon.cloud
            return "";
        }else if(type == 1) {
            return "";
        }
    },
    vap_id: function () {
        return "=";
    },
    yh_id: "-",
    mab_id: "pk..lyMRD6teP7N6Iw4T1H5Aeg",
    package_info: packagejson,
    gdrive: {
        "web": {
            "api_key": '-E',
            "picker_api_key": "",
            "place_api_key": "",
            "photo_api_key" : "",
            "client_id": "-.apps.googleusercontent.com",
            "project_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "",
            "javascript_origins": ["http://localhost:1337", "http://localhost:3000", "https://gplusdon.net", "https://gplusdon.azurewebsites.net", "https://gpdontest.azurewebsites.net"]
        }
    }
};

module.exports = sysconst;