/**
 * Created by feonit
 * Модуль представления ленты фотографа на странице Discover
 */


define([
    'text!templates/photographerItem.html',
    'SideBar',
    'text!templates/leftBar.html',
    'helpers',
    'options',
    'PhotoCollection',
    'CarouselPhotoItemView',
    'ajax'
],
function(
    photographerItemTemplate,
    SideBar,
    leftBarTemplate,
    helpers,
    options,
    PhotoCollection,
    CarouselPhotoItemView,
    ajax
){

    return Backbone.View.extend({

        tag : 'div',

        className : 'multiple-items',

        template: _.template(photographerItemTemplate),

        events: {
            'click .control-info-photo': "openInfoPhoto",
            'click .control-info-album': "openInfoAlbum",
            'click .control-user-follow': "toFollow",
            'click .control-user-favorite': "toFavorite",
            'click .control-strip-head': "toggleStrip",
            'click .control-avatar': "openInfoPhotographer",
            'click .control-user-chat': "openInfoPhotographer"
        },

        /**
         * Когда модель асинхронно получит портфолио, произойдёт отрисовка
         * */

        initialize: function(){
            this.listenTo(this.model, 'change', function(){ this.render(); }, this);
            this.fetchPortfolio();
        },

        /**
         * Отрисовывается лента фотографа
         * */

        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
            this.renderCarusel();
            return this;
        },

        /**
         * Собирается карусель фотографий
         * */

        renderCarusel: function(){
            var that = this;
            _.each(this.model.toJSON().portfolio['models'], function( photoModel ){
                that.$el.prepend((new CarouselPhotoItemView( {model : photoModel } )).$el)
            });

            this.initCaroucel();
        },

        toggleStrip: function(){
            //дополнительно, //todo хардкорно
            var $elem = this.$el.find('.strip');

            if( $elem.hasClass('open-slick')){
                $elem.removeClass('open-slick');
            } else {
                $('.open-slick').removeClass('open-slick');
                $elem.addClass('open-slick');
            }
        },

        /**
         * Карусель фотографий инициализируется плагином slick.js
         * */

        initCaroucel: function(){
            var that = this;

            this.$el.slick({
                infinite: false,
                dots: true,
                slidesToShow: 6,
                slidesToScroll: 6,
                speed: 1000,
                lazyLoad: 'ondemand',
                touchMove: true,

                onBeforeChange: function(){
                    if ( !that.$el.find('.strip').hasClass('open-slick') ){
                        $('.discover').find('.strip').find('.open-slick').removeClass('open-slick');
                        that.$el.find('.strip').addClass('open-slick');
                    }
                },

                responsive: [
                    {
                        breakpoint: 1600,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5,
                            infinite: true,
                            dots: true
                        }
                    },
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4,
                            infinite: true,
                            dots: true
                        }
                    },
                    {
                        breakpoint: 946, // need 960 /* that have some bug,  + 14 px из за стрелок возможно */
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    }
                ]
            });
        },


        /**
         * Расширяем модель юзера коллекцией фотографий
         * (эта примесь должна быть в моделе изначально, а не здесь, но пока что подобного решения или механизма нет)
         * */

        fetchPortfolio: function(){
            var photoCollection = new PhotoCollection({
                size : 18,
                page : 0,
                user_gid : this.model.get('gid')
                //fakeUrl : '/js/json/portfolio.json' // фейковые данные
            });

            var that = this;
            photoCollection.on('sync', function(){
                // можно вытянуть только необходимое, но проще использовать ссылку на колекцию фоток
                that.model.set( 'portfolio' , photoCollection );
            });
        },

        /**
         * Поставить сердечко фотографу
         * */

        toFollow: function () {
            ajax.sendPing(this.$el.find('.control-user-follow'), 'follower', 'user', this.model.get('id'));
        },

        /**
         * Поставить звёздочку фотографу
         * */

        toFavorite: function(){
            ajax.sendPing(this.$el.find('.control-user-favorite'), 'favorite', 'user', this.model.get('id'));
        },

        /**
         * Открывает сайд-бар с инфой фотографа
         * */

        openInfoPhotographer: function(){
            var that = this;

            require(['SideBarLeftView'], function(SideBarLeftView){
                var bar = new SideBarLeftView({
                    userGid : that.model.get('gid')
                });
            });
        }
    });
});