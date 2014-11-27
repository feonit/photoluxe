define(['text!templates/uploadPhoto.html'], function(uploadPhoto){
    /* Представление по фотографии */

    return Backbone.View.extend({
        tagName: 'li',
        className: 'photo-view',
        template: _.template(uploadPhoto),

        events: {
            'click .control-remove': 'removePhoto',
            'click .control-edit': 'editPhoto'
        },

        initialize: function( item ){
            this.listenTo( this.model, 'change' , this.render );
            //this.listenTo( this.model, 'change:category' , this.render );
            this.listenTo( this.model, 'sync' , this.render );
            this.listenTo( this.model, 'destroy' , this.remove );
        },
        render: function () {
            var data = this.model.toJSON();
            data['base64'] = this.model['base64'];
            data['isNew'] = this.model.isNew();
            data['hasChanged'] = this.model.hasChanged();
            this.$el.html(this.template( data ));
            return this;
        },
        removePhoto: function () {
            this.model.destroy();
        },
        editPhoto: function () {
            var that = this;

            require(['SideBarRightView'], function(SideBarRightView){
                new SideBarRightView( {
                    photoModel: that.model,
                    editable: true
                });
            })
        }
    });
});