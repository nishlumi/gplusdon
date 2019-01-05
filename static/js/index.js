var MYAPP;

var vue_ovuser;
var popup_ovuser;
var vue_cards = [];


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    console.log(ID("lm_dashboard"));
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    //MYAPP.setupCommonTranslate();

    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, {});
    ID("btn_post_toote").classList.toggle("common_ui_off");


    
    
    

    var es = Qs(".carousel");
    for (var i = 0; i < es.length; i++) {
        M.Carousel.init(es[i],{
            dist : 0,
            fullWidth: true,
            indicators: true
        });
    }
    es = document.querySelectorAll('.modal');
    var instances = M.Modal.init(es, {
        startingTop : '2%',
        endingTop : '2%'
    });
    es = Qs(".image-popup-btn");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            var target = e.currentTarget.nextElementSibling;
            var tmp = target.cloneNode();
            if (Q("#ov_image .modal-content *")) Q("#ov_image .modal-content *").remove();
            Q("#ov_image .modal-content").appendChild(tmp);
            M.Modal.getInstance(ID("ov_image")).open();
        });
    }
    es = Qs("span.button_spoiler");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            var target = e.currentTarget.previousElementSibling;
            if (target.classList.contains("toote_main")) {
                target.classList.toggle("user-slideOutBottom");
                target.classList.toggle("user-slideInBottom");
                e.currentTarget.textContent = e.currentTarget.textContent == "..." ? "^" : "...";
            }
        });
    }
    es = Qs("button.ttbtn_reply");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            var target = e.currentTarget.parentElement.nextElementSibling;
            target.classList.toggle("mini");
            if (!target.classList.contains("full")) {
                target.classList.toggle("open");
            }

            e.currentTarget.classList.toggle("lighten-3");
            target.querySelector("div.template_reply_box").classList.toggle("common_ui_off");
        });
    }
    es = Qs("a.tt_datetime");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            var target = e.currentTarget.parentElement.parentElement.parentElement;
            if (target.parentElement.classList.contains("onetoote_area")) {
                return;
            }
            MYAPP.session.status.pickupToote = target.nextElementSibling;
            
            var dest = Q("div.onetoote_area");
            dest.appendChild(target);
            Q("div.onetoote_screen").classList.toggle("common_ui_off");
            //dest.classList.toggle("common_ui_off");
            console.log(target.querySelector(".card-comment"));
            if (target.querySelector(".card-comment")) {
                target.querySelector(".card-comment").classList.toggle("full");
                target.querySelector(".card-comment").classList.remove("open");
                target.querySelector(".card-comment").classList.remove("mini");
                target.querySelector(".card-comment .collection").classList.toggle("sizing");
            }
        });
    }
    
    /*Q(".onetoote_overlay").addEventListener("click",function(e){
        var q = Q(".onetoote_area *");
        q.querySelector(".card-comment").classList.remove("full");
        q.querySelector(".card-comment").classList.toggle("mini");
        q.querySelector(".card-comment").classList.remove("open");
        q.querySelector(".card-comment .collection").classList.toggle("sizing");
        MYAPP.session.status.pickupToote.parentElement.insertBefore(q,MYAPP.session.status.pickupToote);
        Q(".onetoote_screen").classList.toggle("common_ui_off");
        //Q(".onetoote_area").classList.toggle("common_ui_off");
        MYAPP.session.status.pickupToote = null;
        
    },false);
    Q(".onetoote_area").addEventListener("click",function(e){
        e.stopPropagation();
    });
    es = Qs(".dv_inputcontent");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("focus",function(e){
            e.currentTarget.nextElementSibling.classList.remove("common_ui_off");
        },false);
    }
    es = Qs(".btn_reply_cancel");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            e.currentTarget.parentElement.parentElement.classList.add("common_ui_off");
        });
    }
    es = Qs(".btn_reply_each");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("click",function(e){
            var elem_reply_box = e.currentTarget.parentElement.parentElement.previousElementSibling;
            var target = elem_reply_box.querySelector(".dv_inputcontent");
            console.log(elem_reply_box);
            console.log(elem_reply_box);
            target.innerHTML = target.innerHTML + "<a href='#!'>@hoge</a>&nbsp;";
        });
    }*/

    vue_ovuser = new Vue({
        el : "#ov_user",
        delimiters : ["{?", "?}"],
        data : {
            selected : {}
        }
    });
    var elem = Q("#ov_user");
    popup_ovuser = M.Modal.init(elem, {
        opacity : 0.2
    });
    es = Qs("img.toot_prof");
    for (var i = 0; i < es.length; i++) {
        es[i].addEventListener("mouseenter",function(e){
            if (ID("ov_user").classList.contains("common_ui_off")) {
                var rect = e.currentTarget.getBoundingClientRect();
                var us = JSON.stringify(MYAPP.acman.items[0].rawdata);
                vue_ovuser.selected = JSON.parse(us);
                //popup_ovuser.options.startingTop = rect.y;
                ID("ov_user").style.top = rect.y + "px";
                ID("ov_user").style.left = rect.x + "px";
                ID("ov_user").classList.remove("common_ui_off");
                ID("ov_user").classList.add("scale-up-tl");
                //popup_ovuser.open();
            }
        });
        /*es[i].addEventListener("mouseleave",function(e){
            //popup_ovuser.close();
            ID("ov_user").classList.add("common_ui_off");
        });*/
        ID("ov_user").addEventListener("mouseleave",function(e){
            //popup_ovuser.close();
            ID("ov_user").classList.add("common_ui_off");
            ID("ov_user").classList.remove("scale-up-tl");
        });
    }

    /*var grid = Q(".xpost_card_grid");
    var mgrid = new Masonry(grid,{
        itemSelector : ".xpost_card_base",
        columnWidth : ".xpost_card_base_sizer",
        percenPosition : true,
        gutter : 10,
        horizontalOrder : true
    });*/

    //---redirected from Mastodon authorization page
    var istest = localStorage.getItem("callback_code");
    if (istest) {
        var eachload = (data) => {
            istest = JSON.parse(istest);
            var authCode = istest["code"];
            localStorage.removeItem("callback_code");
            MYAPP.acman.afterAddInstance(authCode);
            

            MYAPP.afterLoadAccounts(data);
        };
        MYAPP.acman.load().then(eachload,eachload);
    } else {
        //---if no account register, redirect /start
        MYAPP.acman.load().then(function (data) {
            MYAPP.acman.checkVerify();

            //---account load
            var ac = MYAPP.acman.get({
                "instance":MYAPP.session.status.selectedAccount.instance,
                "idname" : MYAPP.session.status.selectedAccount.idname
            });
            if (!ac) ac = data[0];
            MYAPP.commonvue.leftmenu.applogined = true;
            MYAPP.selectAccount(ac);

            MYAPP.afterLoadAccounts(data);
        }, function (flag) {
            appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
                var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/start";
                window.location.replace(newurl);
            });
        })
        .finally(()=>{
            ID("lm_dashboard").classList.add("active");
            ID("sm_dashboard").classList.add("active");
        
            MYAPP.setupCommonElement();
        
        });
    }
})();
