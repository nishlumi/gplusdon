/*
    v-bind:adjustable-height="false"
    v-bind:navigation-click-target-size="14"
    v-bind:navigation-enabled="true"
    adjustable-height

*/
const CONS_TEMPLATE_TOOTGALLERY_CAROUSEL = `
<carousel 
    class="tootgallery-carousel" 
    style="min-height:327px"
    v-bind:per-page="1"
    v-bind:loop="true"
>
    <template v-if="sensitive">
        <slide style="position:relative;">
            <div class="grey lighten-4 white-text">
                <img src="/static/images/gp_sensitive_image.png" class="landscape">
                <h4 class="sensitive-image-text"> {{ _T(translation.sensitive_imagetext,[medias.length ]) }}</h4>
            </div>
        </slide>
    </template>
    <template v-for="(item,index) in medias">
        <slide style="position:relative;">
            <template v-if="item.type=='video'">
                <a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                <video controls v-bind:src="item.url" class="landscape" v-if="item.meta.width >= item.meta.height" v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                <video controls v-bind:src="item.url" class="landscape" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
            </template>
            <template v-else-if="item.type=='gifv'">
                <a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
            </template>
            <template v-else>
                <a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                <v-img 
                    v-bind:src="item.url" 
                    v-bind:lazy-src="item.preview_url" 
                    class="landscape" v-if="item.meta.small.width >= item.meta.small.height" v-bind:title="item.description" v-bind:alt="item.description"
                >
                    <v-layout
                        slot="placeholder"
                        fill-height
                        align-center
                        justify-center
                        ma-0
                    >
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                    </v-layout>
                </v-img>
                <v-img 
                    v-bind:src="item.preview_url" 
                    v-bind:lazy-src="item.preview_url" 
                    class="landscape"  v-else v-bind:title="item.description"  v-bind:alt="item.description"
                >
                    <v-layout
                        slot="placeholder"
                        fill-height
                        align-center
                        justify-center
                        ma-0
                    >
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                    </v-layout>
                </v-img>
            </template>
        </slide>
    </template>
</carousel>
`;
