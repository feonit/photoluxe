define(['options', 'ajax', 'helpers'], function(options, ajax, helpers){

    /* Модель по фотографии, согласована с бекендом */

    var REST = options['Urls']['portfolio']['postUpload'];

    return Backbone.Model.extend({

        methodToURL: {
            'read': function(){ return '/user/get' },                               // GET
            'create': function(){ return REST + '.json'},                           // POST
            'update': function(){ return REST + '/' + this.get('gid') + '.json' },  // PUT
            'patch': function(){ return REST + '.json' },                           // PATCH
            'delete': function(){ return REST + '/' + this.get('gid') + '.json'}    // DELETE
        },

        parse: function( model ){
            // parse работает при fetch и save ( пусто )
            if ( model )
                return helpers.setExtendRecursive( model, this.defaults() )
        },

        sync: function(method, model, options) {
            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()].call(this);

            return Backbone.Model.prototype.sync.apply(this, arguments);
        },

        save : function( attributes, options){

            options || (options = {
                //wait: true,
                //patch: true,
                success: function(model, response, options){
                    //model.set('gid', options.xhr.getResponseHeader('X-REST-Gid'), {silent : true});
                    // silent неожиданно добавляет атрибут в changed

                    //если удалить, добавляет атрибут в changed
                    //проблема в некоректном ресте и области photo
                    //model.unset('photo', { silent:true});
                    //model.attributes.photo =
                    delete model.attributes.photo;

                    model.attributes.gid = options.xhr.getResponseHeader(options.Urls.portfolio.gidAttributeHeaderName);
                },
                error: function(model, xhr, options){
                    //console.log(arguments)
                }
            });

             var writable = [
                 'title',
                 'description',
                 'focal_length',
                 'iso_speed',
                 'exposure_time',
                 'f_number',
                 'longitude',
                 'latitude',
                 'disable_view',
                 'adult_content',
                 'position',
                 'offset_top',
                 'offset_left',
                 'color',
                 'date_modified',
                 //'category_gid'
             ];

             //todo вложенность
             //country
             //region
             //city
             //parent
             //camera
             //lens
             //category
             //album

             var photoData = {};

             _.each(writable, function( property ){
                 photoData[ property ] = this.get( property );
             }, this);

            // jquery булевы значения принимает равными как 'on' и 'off'
            // поэтому адаптируем их под rest
            photoData[ 'adult_content' ] = (this.get( 'adult_content' ) === 'on' ) ? '1' : '0';
            photoData[ 'disable_view' ] = (this.get( 'adult_content' ) === 'on' ) ? '1' : '0';

            this.attributes['photo'] = photoData;
            return Backbone.Model.prototype.save.call(this, { /*photo : photoData*/}, options);
        },

        defaults: function(){
            return {
                gid: null,
                id: null,
                url: {
                    thumbnail: null,
                    fullsize: null
                },
                user: {
                    gid: 'Unknown',
                    title: 'Unknown'
                },
                parent:{
                    gid: 'Unknown',
                    title: 'Unknown'
                },
                camera: {
                    gid: 'Unknown',
                    title: 'Unknown'
                },
                lens: {
                    gid: 'Unknown',
                    title: 'Unknown'
                },
                category_gid: '087a3da93ca7a3058b2902797994e16b',
                title: '',
                date_modified: Date.parse(new Date())/1000,
                description: 'Unknown',
                focal_length: 'Unknown',          // фокусное расстояние. измеряется в integer (миллиметрах), например 10, 50, 120, 300
                iso_speed: 'Unknown',             // чувствительность матрицы фотоаппатара изменяется в integer, например, 100, 200, 400, 500, 6400
                exposure_time: 'Unknown',         // время экспозиции (сколько открыта матрица) изменяется в float секундах, например, 1/100, 1/13, 2
                f_number: 'Unknown',              // диаметр раскрытия диафрагмы изменяется во float (показатель потери света), 1.2, 1.8, 4
                status: 'Unknown',                // new, processed, ready
                location: {
                    country: {
                        gid: 'Unknown',
                        title: 'Unknown'
                    },
                    region: {
                        gid: 'Unknown',
                        title: 'Unknown'
                    },
                    city: {
                        gid: 'Unknown',
                        title: 'Unknown'
                    },
                    longitude: 'Unknown',        // изменяется в float
                    latitude: 'Unknown'          // изменяется в float
                },
                tags: [],               // пример, ['iOs', 'apple', 'steve']
                disable_view: '0' || '1',
                adult_content: '0' || '1',
                position: '0' || '1',             // порядок в списке
                offset_top: '0' || '1',           // число в пикселях
                offset_left: '0' || '1',          // число в пикселях
                likes: {
                    amount: '0',                  // число
                    flag: false              // если уже эта связь
                },
                followers: {
                    amount: '0',                  // число, кол-во пользователей последователей
                    flag: false              // если уже эта связь
                },
                favorites: {
                    amount: '0',                  // число, кол-во пользователей добавивших в закладки
                    flag: false              // если уже эта связь
                },
                views: {
                    amount: '0',                  // число, кол-во просмотров
                    flag: false              // если уже эта связь
                },
                token: 'Unknown' //(генерится для полей gid, owner_gid)
            }
        },

        idAttribute: 'gid'

    });
});
