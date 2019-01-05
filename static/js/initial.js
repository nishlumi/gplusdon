var MYAPP;
var vue_initial;

function btn_reg_account_clicked(e) {
    console.log(ID("txt_initial_instance").value);
    MYAPP.acman.addInstance(ID("txt_initial_instance").value);
}
document.addEventListener('DOMContentLoaded', function () {
    console.log("2");

    
});
(function () {
    MYAPP = new Gplusdon();
    console.log("1");

    vue_initial = new Vue({
        el : "#initialpanel",
        delimiters : ["{?","?}"],
        data :  {
            is_use : false,
        },
        methods : {

        }
    });

    console.log(location.search);
    ID("btn_reg_account").addEventListener("click", btn_reg_account_clicked, false);
    ID("txt_initial_instance").addEventListener("keydown", function (e) {
        //console.log(e.keyCode);
        if ((e.keyCode == 13) ) {
            btn_reg_account_clicked();
        }
    });
    var search = location.search.replace("?","");
    if (search != "") {
        var ret = MUtility.extractPathParams(search);
        if ("in" in ret) {
            MYAPP.acman.addInstance(ret["in"]);
        }
    }
    MYAPP.acman.load().then(function (data) {
        vue_initial.is_use = true;
    }, function (flag) {
    });

})();
