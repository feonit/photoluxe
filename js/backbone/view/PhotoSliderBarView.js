define(['underscore', 'text!templates/photoSliderBar.html', 'helpers', 'options'], function(_, photoSliderBarTemplate, helpers, options){
    return Backbone.View.extend({

        template: _.template(photoSliderBarTemplate),

        events: {
            'click .control-ping-likes': 'pingLike',
            'click .control-ping-followers': 'pingFollowers',
            'click .control-show-info': 'showInfo'
        },

        models: {},

        initialize: function( data ) {
            this.el = data.el;
            this.models = data.models;
            this.models.user.fetch();
            this.listenTo(this.models.user, 'sync', this.render, this);
            this.listenTo(this.models.photo, 'change', this.render, this);
            //this.render();
        },

        render: function(){
            this.$el.find('.control-photo-slider-bar').remove();
            this.$el.append( this.template({
                user: this.models.user.toJSON(),
                photo: this.models.photo.toJSON(),
                exists: helpers.exists
            }));
        },

        pingLike: function(){
                var modelPhoto = this.models.photo,

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

        pingFollowers: function(){
                var modelPhoto = this.models.photo,

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

        showInfo: function(){
            var that = this;
            require(['SideBarLeftView'], function(SideBarLeftView){
                new SideBarLeftView( {
                    // щас валятся ошибки, это нормально, нужно доделать прокидываение моделей
                    // нужно докинуть гид
                    userGid : that.models['user']['gid']
                });
            })
        }
    })
});