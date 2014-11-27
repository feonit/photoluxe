console.log('[application] reads the configuration');
/*
 * Главный загрузчик модулей
 *
 * */

requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/photoluxe/',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    waitSeconds: 1000,

    urlArgs: "bust=" +  Urls.assetVersion,

    catchError: {
        define: true
    },

    //catchError: true,

    paths: {

        /*
         * Ядро приложения
         *
         * */
        'appConfig' : Urls.appConfigUrl + '?noext', // Информация об рабочих адресах, контролируются на бекенде
        'main' :    'js/main',                                         // Точка входа в приложение
        'app' :     'js/app',                                          // Само приложение
        'router' :  'js/router',                                       // Маршрутизатор
        'options' : 'js/options',                                      // Опции приложения

        /*
         * Компоненты приложения
         *
         * */
        'ajax' :            'js/modules/transport/ajax',
        'menu' :            'js/modules/ui/menu',
        'scrollPages' :     'js/modules/scrollPages',
        'helpers':          'js/modules/helpers',  // вспомогательные функции
        'jquery_main':      'js/jquery.main',  // вспомогательные функции для дизайна

        /**
         * Графические интерфейсы пользователя
         * */

        'SideBar' :         'js/modules/ui/SideBar',
        'SideBarLeftView' : 'js/backbone/view/SideBarLeftView',
        'SideBarRightView' : 'js/backbone/view/SideBarRightView',
        'fileLoader':       'js/modules/fileLoader',
        'rightBarInfoEdit': 'js/modules/ui/rightBarInfoEdit',

        'statusLoad' : 'js/modules/ui/statusLoad',

        'authModalWindow' :     'js/modules/authModalWin',
        'advancedSearchPanel' : 'js/modules/advancedSearchPanel',
        'header-auth-actions':  'js/modules/header-auth-actions',
        'popupFilter': 'js/modules/popupFilter', //выпадайка с категориями/подкатегориями. Зависимости: popupFilter.scss
        'popupColorChooser': 'js/modules/popupColorChooser', //выпадайка с категориями/подкатегориями. Зависимости: popupFilter.scss
        'filtrationChangeHandler': 'js/modules/filtrationChangeHandler',

        'popupFilterBrowse': 'js/modules/popupFilterBrowse', //выпадайка с выбором (Popular Updated ..... рабочее название BROWSE), к которому прикреплён раскрывающийся список TIME (All time, Today, Week, Month);
        'popupFilterEquipment': 'js/modules/popupFilterEquipment', //выбор оборудования
        'popupFilterLocation': 'js/modules/popupFilterLocation',

        /**
         * Контролы на discover
         * */

        'controlPopupFilterBrowse': 'js/modules/ui/controls/controlPopupFilterBrowse',
        'controlPopupFilterEquipment': 'js/modules/ui/controls/controlPopupFilterEquipment',
        'controlPopupFilterLocation': 'js/modules/ui/controls/controlPopupFilterLocation',
        'controlSearchFullText': 'js/modules/ui/controls/controlSearchFullText',
        'select2': '/lib/select/select2-3.5.1/select2',


        /*
        * Для каждой вкладки имеется свой стартовый модуль
        *
        * */
        'index' :           'js/modules/tabs/index',
        'expo' :           'js/modules/tabs/expo',
        'albums' :          'js/modules/tabs/albums',
        'discover' :        'js/modules/tabs/discover',
        'portfolio' :       'js/modules/tabs/portfolio',
        'personal_stories' :       'js/modules/tabs/personal_stories',
        'stories_add' :       'js/modules/tabs/stories_add',
        'edit_stories' :      'js/modules/tabs/edit_stories',
        'story_edit' :      'js/modules/tabs/story_edit',
        'manage_story' :      'js/modules/tabs/manage_story',
        'preview_story' :      'js/modules/tabs/preview_story',
        'stories_lists' :      'js/modules/tabs/stories_lists',
        'profile' :         'js/modules/tabs/profile',
        'contests' :        'js/modules/tabs/contests',

         /*
         * Плагины, библиотеки
         * */
        'jquery' :          'lib/jquery/jquery-1.11.0',
        'backbone':         'lib/backbone/backbone-1.1.2',
        'paginator':        'lib/backbone/backbone.paginator/lib/backbone.paginator',
        'underscore' :      'lib/underscore/underscore-1.6.0',
        'lodash' :         'lib/lodash/lodash',
        'jquery-ui' :       'lib/jquery/jquery-ui',
        'placeholder' :     'lib/jquery/jquery.placeholder.min', // placeholder not support defined
        'easing' :          'lib/jquery/jquery.easing.1.3.min',
        'tinycarousel' :    'lib/jquery/jquery.tinycarousel', //<-- without module object
        'jquery.browser' :  'lib/jquery/jquery.browser', // у одного выпиленого модуля была зависимость от jquery.browser.
        'jquery.cookie' :  'lib/jquery/jquery-cookie',
        'jquery.serialize-object': 'lib/jquery/jquery.serialize-object', // form data to json //https://github.com/macek/jquery-serialize-object
        'slick':            'lib/slick-master/slick/slick', // photo-slider-jquery // https://github.com/kenwheeler/slick
        'bootstrap' :       'js/modules/bootstrap/bootstrap',
        'bootstrap-tagsinput' :       'js/modules/bootstrap/bootstrap-tagsinput.min',
        'typehead' :                  'js/modules/typeahead.min',
        'jquery-iframe-transport' :   'js/modules/jquery.iframe-transport',

        /**
         * пакет для контрола мультиселект/комбобокс/серчабле-селекбокс и др.
         */
        'chosen': '/lib/chosen/chosen.jquery',


        // плагины для require.js
        text :            'lib/require/text/text',
        async:              'lib/require/requirejs-plugins/src/async',
        font:               'lib/require/requirejs-plugins/src/font',
        goog:               'lib/require/requirejs-plugins/src/goog',
        image:              'lib/require/requirejs-plugins/src/image',
        json:               'lib/require/requirejs-plugins/src/json',
        noext:              'lib/require/requirejs-plugins/src/noext',
        mdown:              'lib/require/requirejs-plugins/src/mdown',
        propertyParser :    'lib/require/requirejs-plugins/src/propertyParser',
        markdownConverter : 'lib/require/requirejs-plugins/lib/Markdown.Converter',

        /*
         * Пакет для работы загрузчика фотографий {fileLoader}
         *
         * */
        'jquery.ui.widget':             'lib/file-upload/js/vendor/jquery.ui.widget',
        'load-image':                   'lib/file-upload/js/vendor/load-image',
        'load-image-meta':              'lib/file-upload/js/vendor/load-image-meta',
        'load-image-exif':              'lib/file-upload/js/vendor/load-image-exif',
        'load-image-exif-map':          'lib/file-upload/js/vendor/load-image-exif-map',
        'load-image-ios':               'lib/file-upload/js/vendor/load-image-ios',
        'load-image-orientation':       'lib/file-upload/js/vendor/load-image-orientation',
        'load.Jcrop':                   'lib/file-upload/js/vendor/jquery.Jcrop',
        'canvas-to-blob':               'lib/file-upload/js/vendor/canvas-to-blob',
        'jquery.iframe-transport':      'lib/file-upload/js/vendor/jquery.iframe-transport',
        'jquery.fileupload':            'lib/file-upload/js/jquery.fileupload',
        'jquery.fileupload-process':    'lib/file-upload/js/jquery.fileupload-process',
        'jquery.fileupload-image':      'lib/file-upload/js/jquery.fileupload-image',
        'jquery.fileupload-validate':   'lib/file-upload/js/jquery.fileupload-validate',


        /*
         * Пакет для работы слайдера фотографий {PhotoSlider}
         *
         * */

        //    jssor.slider.mini.js = (jssor.core.js + jssor.utils.js + jssor.slider.js)
        //    For development, you can use jssor.core.js + jssor.utils.js + jssor.slider.js
        //    For release, you need jssor.slider.mini.js only         'jssor-core': '/lib/jquery-slider-master/js/jssor.core',

        'jssor-core': 'lib/jquery-slider-master/js/jssor.core',
        'jssor-utils': 'lib/jquery-slider-master/js/jssor.utils',
        'jssor-slider': 'lib/jquery-slider-master/js/jssor.slider',
        'jssor-debug': 'lib/jquery-slider-master/js/jssor.slider.debug.min', // подключается при необходимости отладки
        'PhotoSliderView': 'js/backbone/view/PhotoSliderView',
        'PhotoSliderBarView': 'js/backbone/view/PhotoSliderBarView',


        /*
         * Пакет для работы с фотографиями в режими Uploader
         *
         * */
        'PhotoListView':        'js/backbone/view/PhotoListView',
        'PhotoView':            'js/backbone/view/PhotoView',
        'PhotoCollection':      'js/backbone/collection/PhotoCollection',

        /*
         * Пакет для работы пагинации на вкладке expo
         * */
        'PaginatedView':            'js/backbone/view/PaginatedView',
        'PaginatedViewExpo':        'js/backbone/view/PaginatedViewExpo', //для страницы экспо отдельный вид пагинатора (без глобальных стилей пагинации)
        'FramePhotoView':           'js/backbone/view/FramePhotoView',
        'FrameView':                'js/backbone/view/FrameView',
        'PhotosPageableCollection': 'js/backbone/collection/PhotosPageableCollection',
        'PhotoModel':               'js/backbone/model/PhotoModel',

        /*
         * Пакет для работы пагинации на вкладке discover
         * */
        'PhotographerView': 'js/backbone/view/discover/PhotographerView',
        'PhotographerListView': 'js/backbone/view/discover/PhotographerListView',
        'CarouselPhotoItemView': 'js/backbone/view/discover/CarouselPhotoItemView',
        'PhotographerModel': 'js/backbone/model/PhotographerModel',
        'PhotographersPageableCollection': 'js/backbone/collection/PhotographersPageableCollection',

        /*
         * Виджеты, сторонние сервисы
         * */
        'googleMap': 'js/modules/ui/widgets/googleMap',
        'googleapis': '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=places',

        'facebook': '//connect.facebook.net/en_US/all',
        'facebookDebugVersion' : '//connect.facebook.net/en_US/sdk/debug.js',
        'facebookInit' : 'js/modules/ui/widgets/facebookInit',

        'vkontakte': '//vk.com/js/api/xd_connection.js?2',
        'vkontakteInit': 'js/modules/ui/widgets/vkontakteInit',


        'freegeoip': /*['//freegeoip.net/json/', */'js/modules/services/freegeoip/defaultData', //todo location ip
        'timezone' : 'js/modules/services/google/timezone',

        /**
         * Возможности HTML5
         * */

        'geolocation': 'js/modules/html5/geolocation'


        /*
        * Словари
        * */

        //'dictCategory' : options.Urls.expo['dictCategory']

    },

    shim: {
        'backbone': {
            deps: ['underscore'],
            exports: 'Backbone'
        },

        'jquery': {
            exports: '$'
        },
        'jquery.browser': { exports: '$', deps: ['jquery'] },

        'chosen': {
            deps: [ 'jquery' ],
            exports: 'jQuery.fn.chosen'
        },


        'underscore': {
            exports: '_'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'placeholder': {
            deps: ['jquery']
        },
        'fileLoader': {
            deps: [
                'jquery',
                'jquery.ui.widget',
                'load-image',
                'load-image-meta',
                'load-image-exif',
                'load-image-exif-map',
                'load-image-ios',
                'load.Jcrop',
                'load-image-orientation',
                'canvas-to-blob',
                'jquery.iframe-transport',
                'jquery.fileupload',
                'jquery.fileupload-image',
                'jquery.fileupload-process',
                'jquery.fileupload-validate'
            ]
        },
        'jssor': {
            deps: ['jquery']
        },
        'PhotoSliderView': {
            deps: [
                ,'jssor-core'
                ,'jssor-utils'
                ,'jssor-slider'
                //,'jssor-debug'
            ]
        },

        'facebook' : {
            exports: 'FB'
        },

        'vkontakte' : {
            exports: 'VK'
        },

        'discover':{
            deps: [ 'slick' ]
        }
    }
});

// Start the main app logic.
require(['main'], function() {});
