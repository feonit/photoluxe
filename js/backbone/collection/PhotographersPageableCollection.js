/**
 * Прототип коллекции картинок, с примешенным функционалом для пагинации
 *
 * */


define(['underscore', 'PhotographerModel', 'options', 'paginator'], function(_, PhotographerModel, options){
    return Backbone.PageableCollection.extend({
        //url: "/js/json/photographers.json",                         // фейковые данные
        url: function(){
            return _.template( '/js/json/users.json' || options['Urls']['discover']['users'], {
                page: 0,
                size: 1000,
                type: this.query.type,
                range: this.query.range,
                location: this.query.location,
                nearby: this.query.nearby,
                search: this.query.search,
                camera: this.query.camera,
                lens: this.query.lens
            });
        },

        /**
         * Дефолтные значения параметров запроса
         * it is not queryParams like api in PageableCollection
         * */

        query: {
            type : false,
            range : false,
            location : false,
            nearby : false,
            search : false,
            camera : false,
            lens : false
        },

        initialize: function( params ){
            if ( params && params.queryParams )
                this.query = _.extend(this.query, params.queryParams);
        },

        model: PhotographerModel,

        mode: "client",

        state: {
            firstPage: 1,         // API
            pageSize: 8,          // API    Сколько записей (фотографий) для отображения на странице.
            //currentPage: 1,     // API    Текущая страница
            //totalPages: 3,      // API    Сколько страниц есть.
            //totalRecords:       // API    Только для режима "сервер"
            pageShow: 5           // Custom Кол-во страниц в блоке видимости
        },

        parse: function( response ){
            return response['user'];
        }
    });
});