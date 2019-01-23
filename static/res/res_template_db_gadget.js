const CONS_TEMPLATE_DASHBOARD_GADGET = `
<div>
<template v-if="type=='text'">
    <div v-html="body"></div>
</template>
<template v-else-if="type=='img'">
    <v-img :bind="src"></v-img>
</template>
<template v-else-if="type=='btn'">
    <template v-if="icon!= ''">
        <v-btn flat icon dark :color="userstyle.color">
            <v-icon>{{icon}}</v-icon>
        </v-btn>
    </template>
    <template v-else>
        <v-btn :color="userstyle.color">{{label}}</v-btn>
    </template>
</template>
<template v-else-if="type=='timeline'">
    <div class="timelinebody toot_timeline_grid " v-bind:class="timeline.timeline_gridstyle">
        <timeline-toot 
            v-bind:translation="translations"
            v-bind:toote="status"
            v-bind:key="status.id"
            v-bind:globalinfo="globalInfo"
            v-for="(status,index) in timeline.statuses"
            v-on:replied_post="onreplied_children(status,index)"
            v-on:delete_toot="ondelete_toot_children"
        ></timeline-toot>

    </div>
</template>
<template v-else-if="type=='toot'">
    <timeline-toot 
        v-bind:translation="translations"
        v-bind:toote="toot.status"
        v-bind:popuping="toot.popuping"
        v-bind:datastyle="toot.datastyle"
        v-bind:comment_viewstyle="toot.comment_viewstyle"
        v-bind:comment_list_area_viewstyle="toot.comment_list_area_viewstyle"
        v-bind:content_body_style="toot.content_body_style"
        v-bind:globalinfo="globalInfo"
    ></timeline-toot>
</template>
<template v-else-if="type=='user'">
    <user-popupcard
        cardtype="user.normal"
        v-bind:translation="translation"
        v-bind:account="user.selected"
        v-bind:relationship="user.relationship"
        v-bind:globalinfo="globalInfo"
    ></user-popupcard>
</template>
<template v-else-if="type=='list'">
    <v-list>
        <v-list-tile v-for="(item,index) in datalist" :key="index">
            <v-list-tile-content>
                <div v-html="item.html"></div>
            </v-list-tile-content>
        </v-list-tile>
    </v-list>
</template>
<template v-else-if="type=='input'">
    <toot-inputbox  ref="inputbox"
        :id="input.eid"
        :visibility="input.tootIB.visibility"
        :translation="translation"
        :globalinfo="globalinfo"
        :first_sharescope="input.tootIB.first_scope"
        :popuping="input.tootIB.popuping"
        :toolbtn="input.tootIB.btns"
        :accounts="input.accounts"
        :selaccounts="input.selaccounts"
        v-on:close="onclick_close"
        v-on:send="onclick_send"
    ></toot-inputbox>
</template>
    

</div>
`;
