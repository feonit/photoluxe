/**
* Модуль для работы с меню сайта
*
* */

define(['jquery', 'scrollPages', 'router', 'helpers', 'options', 'controlPopupFilterBrowse'], function($, scrollPages, router, helpers, options, controlPopupFilterBrowse){

    var menu;

    /**
     * Объект главного меню
     * */
    menu = new function(){

        this.name = 'menu';

        var that = this,
            $navigation = null,
            $header = null,
            $currentPage = null,
            $authNavigation = null,
            $browsePersonal,
            $browseSettings,
            $subMenu;


        this.activeRouteName = void 0;

        /**
         * Инициализация персонального меню в зависимости от состояния авторизации
         * вставляем юзернейм в хидер, взяв его из параметров приходящих с сервера
         * */

        this.initPersonalBar = function(){
            var username = helpers.exists(options.Urls.user.firstname); //todo проверок быть не должно
            var user_avatar = helpers.exists(options.Urls.user.avatar);

            if (username) {
                $('.control-username').text(username);
            }
            if (user_avatar) {
                $('.control-user-avatar').css('background-image', 'url(' + user_avatar + ')');
            }
        };

        /**
         * Инициализация первичного состояния элементов меню:
         * подцветка текущего активного элемента меню,
         * развёртывание родительских контейнеров активного элемента меню,
         * запись в шапку имени ссылки текущей страницы.
         * */

        this.initMenuItems = function(){
            var $activeItem = $header.find('#' + that.activeRouteName + 'Link');

            $header.find('.selected-element').text($currentPage.attr('data-name'));
            $header.find('.link').removeClass('active');
            $activeItem.addClass('active');
            $navigation.find('.control-auto-open').removeClass('open');
            var $box = $activeItem.parents('.control-auto-open');
            $box.addClass('open');
            $box.siblings('.link').addClass('active'); // todo хардкорно ищем ссылку на раздел, чтобы тоже подцветить
        };

        /**
         * Фича, когда до корня документа доходит клик, находим все классы "open"
         * и убираем класс, тем самым закрывая все контролы, кроме того,
         * который находится на пути всплытия события 'click' от target до корня document
         * Под исключение попадает контрол Search //todo его для всех страниц
         * // нужно оптимизировать поиск контролов, заменить на постоянный индекс,
         * или в рамках страницы $(this.activeRouteName).find('...')
         * */


        this.bindGlobalTogglerControlsHandler = function(){
            $(document).on('click', function( event ){
                var $curTarget = $(event.target);
                var $exclude = $([]);

                // элемент является общим для всех страниц
                if($curTarget.hasClass('control-search')){
                    $exclude.push($curTarget[0]);
                    $exclude.push($currentPage.find('.control-field-search')[0]);
                }

                $curTarget.push($browsePersonal);
                $curTarget.push($browseSettings);

                var $openUI = $('.open');

                var $someUI = $openUI
                    .not($exclude)                      // другие исключения из правил
                    .not($curTarget)                    // если текущий таргет и есть контролл
                    .not($curTarget.parents('.open'));   // если текущий таргет это вложенный элемент контрола

                if( $('body').width() < 960 ){
                    $someUI = $someUI.not('.control-auto-open'); // боксы меню не должны закрываться в мобильном режиме отображения// todo Внимание, хардкор
                }
                $someUI.removeClass('open');
            });
        };

        /**
         * Привязка к событиям роутера
         * */

        this.bindRouteHandler = function(){

            router.on('route', function(){

                that.activeRouteName = arguments[0];
                $currentPage = $('#' + that.activeRouteName);

                that.initMenuItems();
                that.togglerMenu();
            });
        };

        /**
         * Переключатель разделов меню
         * */

        this.togglerMenu = function(){
            // переключатель категорий меню (отображения меню 3-го уровня //todo)
            var page = that.activeRouteName;

            if (   page === 'profile'
                || page === 'notifications'
                || page === 'display'
                || page === 'account' ){

                $browsePersonal.data('is-browse') || new controlPopupFilterBrowse({ container : $browsePersonal});

                $browsePersonal.show();
                $browseSettings.hide();
                $subMenu.show();

            } else if (   page === 'portfolio'
                || page === 'flow'
                || page === 'favorites'
                || page === 'requests' ){

                $browsePersonal.data('is-browse') || new controlPopupFilterBrowse({ container : $browseSettings});

                $browseSettings.show();
                $browsePersonal.hide();
                $subMenu.show();

            } else {
                $browsePersonal.hide();
                $browseSettings.hide();
                $subMenu.hide();
            }
        };

        /**
         * Автоматическая инициализация модуля в контексте объектной модели документа
         * */

         this.init = function(){

            $header = $('header');
            $navigation = $header.find('.control-nav');
            $subMenu = $('.control-sub-menu');
            $currentPage = $('#' + this.activeRouteName);
            $authNavigation = $('.control-list-items-auth');
            $browsePersonal = $('.control-popupBrowse-portfolio');
            $browseSettings = $('.control-popupBrowse-settings');

            // сначало определение текущей ссылки
            this.initMenuItems();

            this.togglerMenu();

            this.initPersonalBar();
            this.bindGlobalTogglerControlsHandler();
            this.bindRouteHandler();

            /**
             * Обработчики событий меню
             * */

            // переключатель главного меню ( мобильный режим )
            $navigation.on('click', function( event ){
                if (!$navigation.is(event.target)){
                    return true;
                }
                if($navigation.hasClass('open')){
                    $authNavigation.removeClass('open');
                    $navigation.removeClass('open');
                } else {
                    $navigation.addClass('open');
                }
            });

            // переключатель элементов меню
            $navigation.find('.link').on('click', function( event ){
                $navigation.find('.link').removeClass('active');
                $(this).addClass('active');
                if($navigation.hasClass('open')){
                    $navigation.removeClass('open');
                }
            });

            // переключатель элемента поиска
            $navigation.find('.control-search').on('click', function( event ){
               $(this).toggleClass('open');
                event.stopImmediatePropagation();
            });

             // переключатель элемента персонального бара
             $('.control-auth-menu').on('click', function( event ){
                 $(this).toggleClass('open');
                 $authNavigation.toggleClass('open');
                 //event.stopImmediatePropagation();
             });


            return true;
        };
    };

    /**
     * Т.к. роут срабатывает раньше полной загрузки страницы,
     * поэтому, для того чтобы иметь возможность привязываться к его имени,
     * его имя нужно запомнить!
     * */

    router.on('route', function(){
        menu.activeRouteName = arguments[0];
        menu.$currentPage = $('#' + menu.activeRouteName);
    });

    return menu;
});

