var packagejson = require('../package.json');

var sysconst = {
    server_token: function () {
        return "FQOBCaZyaA5PC0Tx0QyPjjboGL8qm5dpULnhzUCFDc8q8i1eD2I9Dq4S2NM6GpMVgMrfUF1o8fCBfkt5cUAGjCY2XPwQj2fbGGqFXM02IFIQuSbcbZdNcfE7jxXZ4Zkw";
    },
    vap_id: function () {
        return "BCGiOKTrNfAFmIPybyacC2UcM2y9zJlDCtacpZoX44U4QjkY1HtaLla0leTn5HWXUevOrSFwb3xunrHHffdPaek=";
    },
    package_info: packagejson,
    gdrive: {
        "web": {
            "api_key": 'AIzaSyD_aIoxUlbrEKnuA_PFMLXEKZpIIZBxU-E',
            "client_id": "381240031419-oi971gq2cq6jd4o446o6lvothhesdp84.apps.googleusercontent.com",
            "project_id": "gplus-mastodon-webclient",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "PDp9SXyLAUFDUpKCiAvvw8yx",
            "javascript_origins": ["http://localhost:1337", "http://localhost:3000", "https://gplusdon.net", "https://gplusdon.azurewebsites.net", "https://gpdontest.azurewebsites.net"]
        }
    }
};

module.exports = sysconst;