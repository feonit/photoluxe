/*
 * Прототип коллекции картинок, с примешенным функционалом для пагинации
 * Используется API Backbone.Paginator
 * https://github.com/backbone-paginator/backbone.paginator
 *
 * */

define(['underscore', 'PhotoModel', 'options', 'paginator'], function(_, PhotoModel, options){
    return Backbone.PageableCollection.extend({

        model: PhotoModel,
        mode: "client",

        queryParams: {
            page : 0,
            size : 100,
            type : null
        },

        state: {
            firstPage: 1,         // API
            pageSize: 8,          // API    Сколько записей (фотографий) для отображения на странице.
            //currentPage: 1,     // API    Текущая страница
            //totalPages: 3,      // API    Сколько страниц есть.
            //totalRecords:       // API    Только для режима "сервер"
            pageShow: 5           // Custom Кол-во страниц в блоке видимости
        },

        url: function(){
            return _.template(options['Urls']['expo']['frames'], {
                page: this.queryParams.page,
                size: this.queryParams.size,
                type: this.queryParams.type
            });
        },

        initialize: function(){

        },

        parse: function( response ){
            return response[options.Urls.portfolio.resourceName];
        }
    });
});