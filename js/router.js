define(['app', 'backbone', 'ajax', 'options'], function(app, Backbone, ajax, options){

    /*
    * Закрузка и скролл страницы, загрузка и инициализация скриптов
    *
    * @param {String} имя html файла
    * @param {String} имя id в главном layout
    * @param {String} имя js файла
    * */
    var preparePage = function(htmlName, id, jsName){
        // У нас имена файлов скриптов, разметок и стилей, завязаны друг на друге
        // С одной стороны это источник проблем, с другой, полезная договорённость, для сокращения кода контроллеров
        // Необходимо додумать подгрузку разом всех частей компонента (js, html. css)

        //todo
        //app.deinitAllModules();

        var $slide = $('.sliders-ul').find('#' + id);
        var slideIsEmpty = !$slide.children().length;

        if (slideIsEmpty) {
            // Загружаем разметку
            ajax.getHtml(htmlName, function(str){
                $slide.html(str);
                // Загружаем скрипты
                if (jsName){
                    require([jsName], function(module){
                        app._initModules([module]);
                    });
                }
            });
        } else {
            // Просто загружаем скрипт
            if (jsName){
                require([jsName], function(module){
                    app._initModules([module]);
                });
            }
        }
    };

    var Router = Backbone.Router.extend({
        routes:{
            '(/)': 'expoPhotos',
            'expo(/)': 'expoPhotos',
            'expo/photos': 'expoPhotos',
            'expo/stories': 'expoStories',
            'expo/live': 'expoLive',
            'discover(/)' : 'discover',
            'forum(/)' : 'forum',
            'settings/profile(/)' : 'profile',
            'settings/notifications(/)' : 'notifications',
            'settings/display(/)' : 'display',
            'settings/account(/)' : 'account',
            'personal/portfolio(/)' : 'portfolio',
            'personal/personal_stories/stories(/)': 'stories',
            'story/:id': 'story',
            'personal/personal_stories/stories_add(/)': 'manage_story',
            'personal/personal_stories/edit_stories(/)': 'edit_stories',
            'personal/personal_stories/story_edit/:id': 'manage_story',
            'personal/personal_stories/story_preview(/)': 'preview_story',
            'logout(/)' : 'logout',
            'personal/flow(/)' : 'flow',
            'personal/favorites(/)' : 'favorites',
            'personal/requests(/)' : 'requests',
            'chat(/)' : 'chat',
            'contests(/)' : 'contestsCurrent',
            'contests/current(/)' : 'contestsCurrent',
            'contests/completed(/)' : 'contestsCompleted',
            'contests/archive(/)' : 'contestsArchive',
            '*path':  'defaultRoute'
        },

        expoPhotos: function(){
            preparePage('expo/photos',  'expoPhotos', 'expo');
        },

        expoStories: function(){
            preparePage('expo/stories',  'expoStories');
        },

        expoLive: function(){
            preparePage('expo/live',  'expoLive');
        },

        discover: function(){
            preparePage('discover', 'discover', 'discover');
        },

        forum: function(){
            preparePage('forum', 'forum');
        },

        contestsCurrent : function(){
            preparePage('contests/current', 'contestsCurrent', 'contests');
        },

        contestsCompleted : function(){
            preparePage('contests/completed', 'contestsCompleted', 'contests');
        },

        contestsArchive : function(){
            preparePage('contests/archive', 'contestsCrchive', 'contests');
        },

        profile : function(){
            preparePage('settings/profile', 'profile', 'profile');
        },

        display : function(){
            preparePage('settings/display', 'display');
        },

        notifications : function(){
            preparePage('settings/notifications', 'notifications');
        },

        account : function(){
            preparePage('settings/account', 'account');
        },

        logout : function(){
            // api
        },

        flow : function(){
            preparePage('personal/flow', 'flow');
        },

        favorites : function(){
            preparePage('personal/favorites', 'favorites');
        },

        requests : function(){
            preparePage('personal/requests', 'requests');
        },

        chat : function(){
            preparePage('chat', 'chat');
        },

        portfolio : function(){
            preparePage('personal/portfolio', 'portfolio','portfolio');
        },

        stories : function(){
            preparePage('personal/personal_stories/stories', 'stories', 'stories_lists');
        },

        story : function(id){
            preparePage('story/'+id, 'story', 'stories_lists');
        },

        edit_stories : function(){
            preparePage('personal/personal_stories/edit_stories', 'edit_stories', 'stories_lists');
        },

        manage_story : function(id){
            preparePage('personal/personal_stories/story_edit/'+id, 'manage_story', 'manage_story');
        },

        preview_story : function(){
            preparePage('personal/personal_stories/story_preview', 'preview_story', 'stories_lists');
        },

        defaultRoute: function(){
            router.navigate('expo', { trigger: true })
        }
    });

    var router = new Router();

    return router;
});
