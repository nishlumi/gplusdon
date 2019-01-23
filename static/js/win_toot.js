var MYAPP;


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");

    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");


    MYAPP.acman.load().then(function (data) {
        //MYAPP.acman.checkVerify();
        
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];

        //---account load
        MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        MYAPP.setupInstanceAdditionalData();
        console.log("ac=",ac);
        var defsel = ac.idname + "@" + ac.instance;
        MYAPP.commonvue.inputtoot.selaccounts.splice(0,MYAPP.commonvue.inputtoot.selaccounts.length);
        MYAPP.commonvue.inputtoot.selaccounts.push(defsel);

        MYAPP.commonvue.inputtoot.show_openInNew = false;
        MYAPP.commonvue.inputtoot.tootIB.btns.open_in_new = false;
        MYAPP.commonvue.inputtoot.otherwindow = true;
        MYAPP.commonvue.inputtoot.translation = curLocale.messages;

        /*var issave = localStorage.getItem(MYAPP.commonvue.inputtoot.CNS_SAVENAME);
        if (issave) {
            var js = JSON.parse(issave);
            console.log(js);
            MYAPP.commonvue.inputtoot.selaccounts = js.accounts;
            MYAPP.commonvue.inputtoot.seltags = js.tags;
            MYAPP.commonvue.inputtoot.selsharescope = js.scope;
            MYAPP.commonvue.inputtoot.mentions = js.mentionlist;
            MYAPP.commonvue.inputtoot.selmentions = js.mentions;
            MYAPP.commonvue.inputtoot.status_text = js.text;
            MYAPP.commonvue.inputtoot.medias = js.medias;
            localStorage.removeItem(MYAPP.commonvue.inputtoot.CNS_SAVENAME);
            ID("dv_inputcontent").textContent = js.text;
            MYAPP.commonvue.inputtoot.ckeditor.setData(js.text.replace(/\n/g,"<br>"));
            console.log("js=",js);
        }*/
        
        
    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/start";
            window.location.replace(newurl);
        });
    });
    location.hash = "";
})();
