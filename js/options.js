/*
* Менеджер опций и настроек "options"
*
* */

define(['underscore', /*'appConfig'*/], function(_, appConfig){
    console.log('[application] reads the options');

    // Локальные настройки
    var options = {
        /**
        * Настройки приложения
        * */

        modeSPA : true,             // Включить режим работы приложения SPA (single page application)
        namespaceSupport: true,     // Поддержка интерфейсов модулей в консоли (для отладки интерфейсов)

        /**
        * Персонализация
        * */

        user : {
            authorized : !!Urls.ownerGid,    // Авторизован ли пользователь
            gid : Urls.ownerGid
        },

        /**
        * Настройки эффектов
        * */

        mainScrollSpeed : 400,
        mainAnimateSpeed : 500

    };

    appConfig = {};

    // акупунктурные точки
    appConfig.Urls = {
        baseUrl : '/photoluxe/',
        user : 'firstname',
        portfolio : {
            postUpload : 'http://example-post.ru',
            resourceName : 'photo',
            userPortfolio : 'js/json/album-beer.json'
        },
        expo : {
            frames : 'js/json/expo.json'
        },
        discover : {
            searchFullTextUrl : '',
            "dict-model" : 'js/json/model.json',
            "dict-lens" : 'js/json/lens.json',
            "users" : 'js/json/users.json'
        }
    };

    // Расширяем локальные настройки до бекендовских
    return _.extend(options, appConfig);
});