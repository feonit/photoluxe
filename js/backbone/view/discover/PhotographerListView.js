define(['PhotographerView'], function(PhotographerView){
    /* Представление по фотографии */

    return Backbone.View.extend({

        events: {
        },
        initialize: function( item ){
            this.collection.getFirstPage({ fetch: true });
            this.listenTo( this.collection, 'reset', this.addAll );
        },
        addAll : function () {
            this.$el.empty();
            this.collection.each (this.addOne, this);
        },

        addOne : function ( item ) {
            var view = new PhotographerView({model:item});
            this.$el.append(view.el);
        }
    });
});
