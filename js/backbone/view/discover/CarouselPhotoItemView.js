/**
 * Created by feonit on 13.08.14.
 */

/*
 * Прототип представления фрейма картинок
 *
 * */

define(['jquery', 'ajax', 'underscore', 'text!templates/carouselPhoto.html', 'PhotoSliderView'],
    function( $, ajax, _, carouselPhotoTemplate, PhotoSliderView ){

    return Backbone.View.extend({

        tagName : 'div',

        template: _.template(carouselPhotoTemplate),

        events: {
            'click .control-photo-like': 'doLike',
            'click .control-photo-favorite': 'doFavorite',
            // more look on this.initDoubleClickEvents
            'click .control-info-photo': "openInfoPhoto",
            'click .control-info-album': "openInfoAlbum"
        },

        initialize: function() {
            this.model.bind('change:title', this.renderTitle, this);
            //todo this.model.bind('change:@album_atribut@', this.render, this);
            this.render();
            this.initDoubleClickEvents();
        },

        render : function () {
            this.$el.html(this.template( this.model.toJSON() ));
            return this;
        },

        /**
         * С двойным нажатием есть проблемные места,
         * решение http://stackoverflow.com/questions/1067464/need-to-cancel-click-mouseup-events-when-double-click-event-detected/1067484#1067484
         * */

         initDoubleClickEvents: function(){
            var that = this;

            function singleClick(e) {
                that.$el.toggleClass('control-show-controls');
            }

            function doubleClick(e) {
                that.showFullSize();
            }

            $(this.$el.find('.thumb')).click(function(e) {
                var that = this;
                setTimeout(function() {
                    var dblclick = parseInt($(that).data('double'), 10);
                    if (dblclick > 0) {
                        $(that).data('double', dblclick-1);
                    } else {
                        singleClick.call(that, e);
                    }
                }, 300);
            }).dblclick(function(e) {
                $(this).data('double', 2);
                doubleClick.call(this, e);
            });
        },


        /**
         * Лайкнуть фотографию
         * */

        doLike: function(){
            ajax.sendPing(this.$el.find('.control-photo-like'), 'like', 'photo', this.model.get('id'));
        },
        /**
         * Поклоняться фотографии
         * */

        doFavorite: function(){
            ajax.sendPing(this.$el.find('.control-photo-favorite'), 'favorite', 'photo', this.model.get('id'));
        },

        /**
         * Событие открытия правой панели
         * */

        openInfoPhoto: function( ){
            var that = this;

            require(['SideBarRightView'], function(SideBarRightView){
                new SideBarRightView( {
                    photoModel: that.model,
                    editable: false
                });
            })
        },

        /**
         * Событие открытия левой панели
         * (подгрузка функционала)
         * */

        openInfoAlbum: function(){

            require(['SideBar'], function(SideBar){
                var SideBarInterface = new SideBar( 'right' );
                SideBarInterface.setHTML('Тут будет информация об альбоме этой фотографии');
                SideBarInterface.open()
            })
        },

        /**
         * Событие двойного щелчка и открытие фотослайдера
         * */

//        showFullSize: function(){
//            new PhotoSliderView({
//                el: '.photo-slider',
//                model: this.model
//            });
//        },

        renderTitle: function(){
            this.$el.find('.control-info-photo').text(this.model.get('title'))
        }
    });
});