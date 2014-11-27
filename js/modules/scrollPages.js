/*
 * Модуль отвечает за главные страницы, прокрутка и подгрузка контента
 *
 * */

define(['jquery', 'ajax', 'app', 'options', 'router'], function($, ajax, app, options, router){

    /**
     * Роутинг отрабатывает самым первым, поэтому его первое состояние
     * нужно запомнить
     * */

    var activeRoute = void 0;

    router.on('route', function(){
        activeRoute = arguments[0];
    });

    return new function(){

        var that = this,
            $slider = $('.sliders-ul'),         // Количество слайдов
            $slides = $slider.children(),       // Слайды
            $comingSlide,                       // Будущий слйад
            $curSlide;                          // Текущий слайд;

        this.name = 'scrollPages';

        /**
         *  Пролистывает к нужной странице
         *  @param {Boolean} animation С анимацией или нет, по умолчанию true
         * */

        this.scroll = function ( route ) {
            $comingSlide = $slides.filter('#' + route);
            $slides.removeClass('active');
            $curSlide = $comingSlide.addClass('active');
        };

        /**
         *  Установка относительного положения всех страниц в слайдере
         * */

         this.init = function(){

            /**
             *  Первая страница
             * */

             this.scroll(activeRoute);

            /**
             *  Подписываемся на события роута, по которым происходят последующие переходы
             * */

             router.on('route', function(){
                that.scroll(arguments[0]);
                console.log('[application] Сработал scrollPages: ' + arguments[0])
             });

            router.on('route:personal_stories', function(){
                that.scroll('personal_stories');
            });

            router.on('route:stories_add', function(){
                that.scroll('stories_add');
            });

            router.on('route:story_edit', function(){
                that.scroll('story_edit');
            });


            return true;
        };
    };
});



