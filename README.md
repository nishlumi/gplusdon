# G+Don

G+Don は Mastodon のためのウェブアプリです。
利用するにはどこかのMastodonインスタンスにユーザー登録している必要があります。

## As user

**[こちら](https://gplusdon.net)**

もしドメインにアクセス出来ない場合、次をご利用ください。

**[あるいはここ](https://gplusdon.azurewebsites.net)**


説明書はGoogle ドキュメントで用意してあります。

[G+Don簡易説明書](https://docs.google.com/document/d/1mJbQYGxaCfe4Ly86_Su1vseZ9yfoT3rm8n4R8mR3oxA/edit?usp=sharing)


## As supporter

もし翻訳にご協力していただける方は、下記Googleスプレッドシートをコピーの上お使いください。

[Translation-Gplusdon](https://docs.google.com/spreadsheets/d/1m1Tx-q2sFgcM-VJh_eKESbE5ri_gIuw9jvAfJTrtdWg/edit?usp=sharing)

その後そのファイルをお送りいただけると助かります。


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
 * InstanceTicker (developed by weepjp)

***Eternal TODO***

iOS 対応できない！(テスト端末：iPhone 7 plus, iOS 12.1.2(16C101) )

→ 2019/01/27 解決。

　知り合いから譲ってもらったMacbook proにてMacのSafariとiPhoneのSafariでデバッグして原因判明、解決に至った。


