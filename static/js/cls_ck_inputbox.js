var CK_INPUT_TOOTBOX = {
    //skin : "kama",
    exptraPlugins: 'autocomplete,mentions,onchange,basicstyles,undo,link,wysiwygarea,toolbar',
    /*contentsCss: [
        'https://cdn.ckeditor.com/4.11.1/full-all/contents.css',
        'https://sdk.ckeditor.com/samples/assets/mentions/contents.css'
    ],*/
    title : "",
    enterMode : CKEDITOR.ENTER_BR,
    
    toolbar : [
        { name: 'links', items: [ 'EmojiPanel' ] }
    ],
    
    removeDialogTabs: 'image:advanced;link:advanced;link:target',
    mentions: [
        {
            feed: "",
            throttle : 300,
            itemTemplate: 
                `<li data-id="{id}" style="width="99%">
                    <img src="{avatar}" width="32" height="32" style="float:left;line-height:32px">
                    <b>{display_name}</b><br>
                    <span>{acct}</span>
                </li>`
                ,
            outputTemplate: 
            '@<a href="">{acct}</a>&nbsp;',
            minChars: 2
        },
        {
            feed: CK_dataFeed_tag,
            marker: '#',
            itemTemplate: '<li data-id="{text}">{text}</li>',
            outputTemplate: '#{text}&nbsp;',
            minChars: 1
        }
    ]
}
function CK_dataFeed_mention( opts, callback ) {
    console.log(this);
    if (this.selaccounts.length == 0) return;
    var hitac = this.getTextAccount2Object(0);
    if (!hitac) return;

    var backupAC = MYAPP.sns._accounts;
    MYAPP.sns.setAccount(hitac);
    MYAPP.sns.getUserSearch(opts.query,{
        api : {
            limit : 5
        },
        app : {

        }
    })
    .then(result=>{
        var data = [];
        for (var i = 0; i < result.data.length; i++) {
            data.push({
                id : i,
                avatar : result.data[i].avatar,
                acct : `${result.data[i].username}@${result.data[i].instance}`,
                username : result.data[i].username,
                instance : result.data[i].instance,
                display_name : result.data[i].display_name,
            });
        }
        console.log(data);
        callback(data);
    })
    .finally(()=>{
        MYAPP.sns.setAccount(backupAC);
    });   

    /*var matchProperty = 'username';
    var data = users.filter( function( item ) {
            return item[ matchProperty ].indexOf( opts.query.toLowerCase() ) == 0;
        } );

    data = data.sort( function( a, b ) {
        return a[ matchProperty ].localeCompare( b[ matchProperty ], undefined, { sensitivity: 'accent' } );
    } );*/

    //callback( data );
}
function CK_dataFeed_tag( opts, callback ) {
    var tags = MYAPP.session.config.action.tags;
    console.log(tags);
    var matchProperty = 'text';
    var data = tags.filter( function( item ) {
            return item[ matchProperty ].indexOf( opts.query.toLowerCase() ) == 0;
        } );

    data = data.sort( function( a, b ) {
        return a[ matchProperty ].localeCompare( b[ matchProperty ], undefined, { sensitivity: 'accent' } );
    } );

    callback( data );
}