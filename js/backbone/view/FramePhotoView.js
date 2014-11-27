/*
 * Прототип представления фрейма картинок
 *
 * */

define([
    'jquery',
    'ajax',
    'underscore',
    'text!templates/framePhoto.html',
    'PhotoSliderView',
    'options',
    'helpers'
], function(
    $,
    ajax,
    _,
    framePhotoTemplate,
    PhotoSliderView,
    options,
    helpers
    ){

    return Backbone.View.extend({

        tagName : 'div',
        template: _.template(framePhotoTemplate),
        events: {
            'click .control-like': 'doLike',
            'click .control-heart': 'doHeart',
            'click .control-info': 'showInfo',
            'click .control-comment': 'showComment',
            'click .control-thumb': 'showFullSize'
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            //this.model.bind('destroy', this.remove, this);
        },

        render : function () {
            var modelObj = this.model.toJSON();
            modelObj.exists = helpers.exists;
            this.$el.html(this.template(modelObj));
            return this;
        },
        doLike: function(){

            var that = this;
            var modelPhoto = that.model,

            //собираем строку запроса
                id = modelPhoto.get('id'),
                urlTmpl = helpers.exists(options, 'Urls.discover.ft_ws_social_like'),
                url = _.template(urlTmpl, {
                    type: 'photo',
                    id: id
                });

            $.get(url)
                .done(function(res){
                    var amount = helpers.exists(res, 'data.amount');
                    //проверяем данные с сервера
                    if (amount !== null && amount !== undefined ) {
                        //клонируем
                        var likes = _.clone(modelPhoto.get('likes'));
                        //изменяем
                        likes.amount = amount;
                        //вставляем
                        modelPhoto.set('likes', likes);
                    }
                });
        },
        doHeart: function(){
            var that = this;
            var modelPhoto = that.model,

            //собираем строку запроса
                id = modelPhoto.get('id'),
                urlTmpl = helpers.exists(options, 'Urls.discover.ft_ws_social_follower'),
                url = _.template(urlTmpl, {
                    type: 'photo',
                    id: id
                });

            $.get(url)
                .done(function(res){
                    var amount = helpers.exists(res, 'data.amount');
                    //проверяем данные с сервера
                    if (amount !== null && amount !== undefined ) {
                        //клонируем
                        var followers = _.clone(modelPhoto.get('followers'));
                        //изменяем
                        followers.amount = amount;
                        //вставляем
                        modelPhoto.set('followers', followers);
                    }
                });
        },

        /*
         * Событие открытия правой панели
         * */

         showComment: function( ){
             var that = this;

             require(['SideBarRightView'], function(SideBarRightView){
                 new SideBarRightView( {
                     photoModel: that.model,
                     editable: false
                 });
             })
        },

        /*
         * Событие открытия левой панели
         * (подгрузка функционала)
         * */

         showInfo: function(){
             var that = this;

            require(['SideBarLeftView'], function(SideBarLeftView){
                new SideBarLeftView( {
                    userGid : that.model.get('user')['gid']
                });
            })
        },

        /*
        * Событие двойного щелчка и открытие фотослайдера
        * */

         showFullSize: function(){
             new PhotoSliderView({
                    el: '.photo-slider',
                    model: this.model
                });

         }
    });
});