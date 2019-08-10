/*
    v-bind:adjustable-height="false"
    v-bind:navigation-click-target-size="14"
    v-bind:navigation-enabled="true"
    adjustable-height

*/
const CONS_TEMPLATE_TOOTGALLERY_CAROUSEL = `
<div style="position:relative;">
<template v-if="viewmode=='slide'">
    <carousel 
        class="tootgallery-carousel" 
        style="min-height:327px"
        v-bind:adjustableHeight="options.carousel.adjustableHeight"
        v-bind:per-page="local_options.carousel.perPage"
        v-bind:loop="local_options.carousel.loop"
        v-model="value.carousel"
    >
        <template v-if="sensitive">
            <slide style="position:relative;" :key="0">
                <div class="grey lighten-4 white-text">
                    <v-img src="/static/images/gp_sensitive_image.png" class="landscape"></v-img>
                    <h3 class="headline sensitive-image-text"> {{ _T(translation.sensitive_imagetext,[medias.length ]) }}</h3>
                </div>
            </slide>
        </template>
        <template v-for="(item,index) in medias">
            <slide :key="(index+1)" style="position:relative;">
                <template v-if="item.type=='video'">
                    <a href="#" v-on:click="onclick_openfull(item)" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                    <video controls v-bind:src="item.url" class="landscape" v-if="item.meta.width >= item.meta.height" v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                    <video controls v-bind:src="item.url" class="landscape" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                </template>
                <template v-else-if="item.type=='gifv'">
                    <a href="#" v-on:click="onclick_openfull(item)" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                    <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                    <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                </template>
                <template v-else>
                    <a href="#" v-on:click="onclick_openfull(item)" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                    <template v-if="item.meta.small.width >= item.meta.small.height">
                        <!--<v-img 
                            v-bind:src="item.url" 
                            v-bind:lazy-src="item.preview_url" 
                            class="landscape" v-bind:title="item.description" v-bind:alt="item.description"
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
                        :srcset="calcsrcset(item)"
                            :sizes="calcsizes(item)"
                        -->
                        <img v-bind:src="item.url" 
                        
                            class="landscape" v-bind:title="item.description" v-bind:alt="item.description">
                        
                    </template>
                    <template v-else>
                        <!--<v-img 
                            v-bind:src="item.url" 
                            v-bind:lazy-src="item.preview_url" 
                            class="portrait" v-bind:title="item.description"  v-bind:alt="item.description"
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

                        -->
                            
                            <img v-bind:src="item.url" 
                        
                            class="landscape" v-bind:title="item.description" v-bind:alt="item.description">
                        
                    </template>
                </template>
            </slide>
        </template>
    </carousel>
</template>
<template v-else-if="viewmode=='grid'">
    <v-layout>
        <template v-if="sensitive">
            <v-flex xs12  v-bind:class="is_sensitive_title">
                <div class="grey lighten-4 white-text" v-on:click="onclick_sensitive_ingrid">
                    <v-img src="/static/images/gp_sensitive_image.png" class="landscape"></v-img>
                    <h3 class="headline sensitive-image-text"> {{ _T(translation.sensitive_imagetext,[medias.length ]) }}</h3>
                </div>
            </v-flex>
        </template>
        <v-flex xs12 v-bind:class="is_sensitive_hidden">
        <v-layout>
            <template v-if="medias.length == 1">
                <v-flex xs12 v-for="(item,index) in medias" :key="index">
                    <a v-on:click="onclick_rehide" v-if="sensitive" class="grid_sensitive_btn"><i class="material-icons">remove_red_eye</i></a>
                    <template v-if="item.type=='video'">
                        <video controls v-bind:src="item.url" 
                            class="landscape" v-if="item.meta.width >= item.meta.height" 
                            v-bind:title="item.description" v-bind:alt="item.description"
                            v-on:click="onclick_openfull(item)"
                        >Video: {{ item.description }}</video>
                        <video controls v-bind:src="item.url" 
                            class="landscape" v-else 
                            v-bind:title="item.description" v-bind:alt="item.description"
                            v-on:click="onclick_openfull(item)"
                        >Video: {{ item.description }}</video>
                    </template>
                    <template v-else-if="item.type=='gifv'">
                        <a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                        <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                        <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                    </template>
                    <template v-else>
                        <template v-if="item.meta.small.width >= item.meta.small.height">
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="landscape" v-bind:title="item.description" v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                                <v-layout slot="placeholder"
                                    fill-height align-center justify-center ma-0
                                >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="portrait" v-bind:title="item.description"  v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                            <v-layout slot="placeholder"
                                fill-height align-center justify-center ma-0
                            >
                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                    </template>
                </v-flex>
            </template>
            <!--=== medias is 2 === -->
            <template v-else-if="medias.length == 2">
                <v-flex xs6 v-for="(item,index) in medias" :key="index">
                    <template v-if="index == 0">
                        <a v-on:click="onclick_rehide" v-if="sensitive" class="grid_sensitive_btn"><i class="material-icons">remove_red_eye</i></a>
                        
                    </template>
                    <template v-if="item.type=='video'">
                        <!--<video controls v-bind:src="item.url" class="landscape" v-if="item.meta.width >= item.meta.height" v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                        <video controls v-bind:src="item.url" class="landscape" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                        -->
                        <template v-if="item.meta.small.width >= item.meta.small.height">
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="landscape" v-bind:title="item.description" v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                                <v-layout slot="placeholder"
                                    fill-height align-center justify-center ma-0
                                >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="portrait" v-bind:title="item.description"  v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                            <v-layout slot="placeholder"
                                fill-height align-center justify-center ma-0
                            >
                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                    </template>
                    <template v-else-if="item.type=='gifv'">
                        <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                        <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                    </template>
                    <template v-else>
                        <template v-if="item.meta.small.width >= item.meta.small.height">
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="landscape" v-bind:title="item.description" v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                                <v-layout slot="placeholder"
                                    fill-height align-center justify-center ma-0
                                >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                        <template v-else>
                            <v-img 
                                v-bind:src="item.url" 
                                v-bind:lazy-src="item.preview_url" 
                                class="portrait" v-bind:title="item.description"  v-bind:alt="item.description"
                                v-on:click="onclick_openfull(item)"
                            >
                            <v-layout slot="placeholder"
                                fill-height align-center justify-center ma-0
                            >
                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </template>
                    </template>
                </v-flex>
            </template>
            <!--=== medias is 3, 4 === -->
            <template v-else-if="medias.length >= 3">
                <v-flex xs8>
                    <template v-for="(item,index) in medias">
                        <template v-if="index == 0">
                                <a v-on:click="onclick_rehide" v-if="sensitive" class="grid_sensitive_btn"><i class="material-icons">remove_red_eye</i></a>
                            <template v-if="item.type=='video'">
                                <!--<a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                                <video controls v-bind:src="item.url" class="landscape" v-if="item.meta.width >= item.meta.height" v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                <video controls v-bind:src="item.url" class="landscape" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                -->
                                <template v-if="item.meta.small.width >= item.meta.small.height">
                                    <v-img 
                                        v-bind:src="item.url" 
                                        v-bind:lazy-src="item.preview_url" 
                                        class="landscape media_borderset_forgrid" v-bind:title="item.description" v-bind:alt="item.description"
                                        v-on:click="onclick_openfull(item)"
                                    >
                                        <v-layout slot="placeholder"
                                            fill-height align-center justify-center ma-0
                                        >
                                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                        </v-layout>
                                    </v-img>
                                </template>
                                <template v-else>
                                    <v-img 
                                        v-bind:src="item.url" 
                                        v-bind:lazy-src="item.preview_url" 
                                        class="portrait media_borderset_forgrid" v-bind:title="item.description"  v-bind:alt="item.description"
                                        v-on:click="onclick_openfull(item)"
                                    >
                                    <v-layout slot="placeholder"
                                        fill-height align-center justify-center ma-0
                                    >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                        </v-layout>
                                    </v-img>
                                </template>
                            </template>
                            <template v-else-if="item.type=='gifv'">
                                <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                            </template>
                            <template v-else>
                                <template v-if="item.meta.small.width >= item.meta.small.height">
                                    <v-img 
                                        v-bind:src="item.url" 
                                        v-bind:lazy-src="item.preview_url" 
                                        class="landscape media_borderset_forgrid" v-bind:title="item.description" v-bind:alt="item.description"
                                        v-on:click="onclick_openfull(item)"
                                    >
                                        <v-layout slot="placeholder"
                                            fill-height align-center justify-center ma-0
                                        >
                                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                        </v-layout>
                                    </v-img>
                                </template>
                                <template v-else>
                                    <v-img 
                                        v-bind:src="item.url" 
                                        v-bind:lazy-src="item.preview_url" 
                                        class="portrait media_borderset_forgrid" v-bind:title="item.description"  v-bind:alt="item.description"
                                        v-on:click="onclick_openfull(item)"
                                    >
                                    <v-layout slot="placeholder"
                                        fill-height align-center justify-center ma-0
                                    >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                        </v-layout>
                                    </v-img>
                                </template>
                            </template>
                        </template>
                    </template>
                </v-flex>
                <v-flex xs4>
                    <v-layout column>
                        <template v-for="(item,index) in medias">
                            <v-flex xs12 v-if="index > 0">
                                <template v-if="item.type=='video'">
                                    <!--<video controls v-bind:src="item.url" class="landscape" v-if="item.meta.width >= item.meta.height" v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                    <video controls v-bind:src="item.url" class="landscape" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                    -->
                                    <template v-if="item.meta.small.width >= item.meta.small.height">
                                        <v-img 
                                            v-bind:src="item.preview_url" 
                                            v-bind:lazy-src="item.preview_url" 
                                            class="landscape media_borderset_forgrid" v-bind:title="item.description" v-bind:alt="item.description"
                                            v-on:click="onclick_openfull(item)"
                                        >
                                            <v-layout slot="placeholder"
                                                fill-height align-center justify-center ma-0
                                            >
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </v-img>
                                    </template>
                                    <template v-else>
                                        <v-img 
                                            v-bind:src="item.preview_url" 
                                            v-bind:lazy-src="item.preview_url" 
                                            class="portrait media_borderset_forgrid" v-bind:title="item.description"  v-bind:alt="item.description"
                                            v-on:click="onclick_openfull(item)"
                                        >
                                        <v-layout slot="placeholder"
                                            fill-height align-center justify-center ma-0
                                        >
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </v-img>
                                    </template>
                                </template>
                                <template v-else-if="item.type=='gifv'">
                                    <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-if="item.meta.width >= item.meta.height"  v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                    <video loop autoplay v-bind:src="item.url" class="landscape" v-on:click="onmouseenter_gifv" v-else v-bind:title="item.description" v-bind:alt="item.description">Video: {{ item.description }}</video>
                                </template>
                                <template v-else>
                                    <template v-if="item.meta.small.width >= item.meta.small.height">
                                        <v-img 
                                            v-bind:src="item.url" 
                                            v-bind:lazy-src="item.preview_url" 
                                            class="landscape media_borderset_forgrid" v-bind:title="item.description" v-bind:alt="item.description"
                                            v-on:click="onclick_openfull(item)"
                                        >
                                            <v-layout slot="placeholder"
                                                fill-height align-center justify-center ma-0
                                            >
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </v-img>
                                    </template>
                                    <template v-else>
                                        <v-img 
                                            v-bind:src="item.preview_url" 
                                            v-bind:lazy-src="item.preview_url" 
                                            class="portrait media_borderset_forgrid" v-bind:title="item.description"  v-bind:alt="item.description"
                                            v-on:click="onclick_openfull(item)"
                                        >
                                        <v-layout slot="placeholder"
                                            fill-height align-center justify-center ma-0
                                        >
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </v-img>
                                    </template>
                                </template>
                            </v-flex>
                        </template>
                    </v-layout>
                </v-flex>
            </template>
            
        </v-layout>
        </v-flex>
    </v-layout>
</template>
</div>
`;
