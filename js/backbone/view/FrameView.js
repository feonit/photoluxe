define(['FramePhotoView'],function(FramePhotoView){
    /*
     * Весь фрейм
     *
     * */


    return Backbone.View.extend({

        events: {
            'click .control-left' : 'getPreviousPage',
            'click .control-right' : 'getNextPage'
        },

        initialize : function () {
            this.listenTo(this.collection, 'reset', this.render, this);
            this.collection.getFirstPage({ fetch: true });
        },

        render: function(){
            this.addAll();
            this.addArrows();
        },

        /**
         * Отрисовывает весь фрейм фотографий
         *
         * */

        addAll : function () {
            this.$el.empty();
            this.collection.each (this.addOne, this);
        },

        /**
         * Отрисовывает отдельную фотографию
         *
         * */

        addOne : function ( item ) {
            var view = new FramePhotoView({model:item});
            this.$el.append(view.render().el);
        },

        /**
         * Стрелочки для переключения пагинации
         * И их обработчик
         * */

        addArrows: function(){
            var template = '<div class="page-switch-arrows">' +
                '<div class="control-left left"></div>' +
                '<div class="control-right right"></div>' +
                '</div>';

            this.$el.prepend(template);
        },

        getPreviousPage: function(){
            this.collection.getPreviousPage()
        },

        getNextPage: function(){
            this.collection.getNextPage()
        }
    });
});