define(['PhotoModel', 'options'], function(PhotoModel, options){

    /* Модель по коллекиции фотографий*/

    var PhotoCollection = Backbone.Collection.extend({

        model: PhotoModel,
        page : 0,
        size : 1000,
        user_gid : null, // по умолчанию принимается собственное портфолио фотографий
        fakeUrl : null,// для фейковый данных, если путь был задан


        url : function(){
            return _.template(options['Urls']['portfolio']['userPortfolio'], { page: this.page, size: this.size, user_gid : this.user_gid });
        },

        initialize: function( opt ){
            _.extend( this, opt );
            this.fetch({ parse : true });
        },

        /*
        * Адаптер для коннектора
        * */

         parse: function( response ){

             _.each(response, function(data){
                 response[response.indexOf(data)] = data[options.Urls.portfolio.resourceName];
             });

            return response
        }
    });

    return PhotoCollection;
});
