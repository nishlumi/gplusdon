# G+Don

G+Don は Mastodon のためのウェブアプリです。
利用するにはどこかのMastodonインスタンスにユーザー登録している必要があります。

## As user

**[こちら]()**

もしドメインにアクセス出来ない場合、次をご利用ください。

**[あるいはここ]()**


説明書はGoogle ドキュメントで用意してあります。

[G+Don簡易説明書](https://docs.google.com/document/d/1mJbQYGxaCfe4Ly86_Su1vseZ9yfoT3rm8n4R8mR3oxA/edit?usp=sharing)




## Development setup


```npm install```


```npm run dev```


**Using library**

***Server side***

 * Node.js
 * express
 * nunjucks

 
***Client side***

 * Vue.js
 * Vuetify
 * vue-carousel
 * Materialize
 * jQuery
 * jquery-timeago
 * lodash
 * alertify
 * paste
 * mastodon
 * twitter-text.js -> modified to mastodon-text.js


***Eternal TODO***

iOS 対応できない！(テスト端末：iPhone 7 plus, iOS 12.1.2(16C101) )

 * iOS, Chrome(Safari), Vue.js & Vuetify がまったく機能しない。Vueがピクリとも動いていない。
iOSでvueのためにはes5が必要という噂を聞いて試すも意味なし。

https://github.com/es-shims/es5-shim

 * clickイベントが効かないと話を聞き試すも（そもそもcursor:pointerはそれ以前にしている、document, bodyにclickなんぞ設定していない、というかvueのv-on:click等でやっているため数多くの記事に相当する問題から外れている）効果なし。

https://www.terakoya.work/ios-iphone-safari-click-none-howto/

 * Vueの本来の作法にはずれている＆import文が必要と思い参考にするも、意味なし。

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import

https://vuetifyjs.com/ja/getting-started/quick-start

　PC、Androidでは素直に動作するHTML, javascript, その他関連ライブラリが動かない独特な挙動をするiOS & Chrome(実態はSafari? 上っ面だけの偽Chrome)　に対応するくらいなら、それ以外の環境で存分に使ってもらうための開発を続けたほうが五千万倍マシと乱暴ではあるが感じる。

　iOSユーザーという超膨大な人的価値を泣く泣く除外することになるが、しばらくiOS環境は無視したほうが精神的に健全に生活＆開発＆運用できるだろうと判断した次第である。

　Safariには腸煮えくり返りそうである。


