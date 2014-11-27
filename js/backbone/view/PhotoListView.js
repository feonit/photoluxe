define(['PhotoView', 'PhotoCollection', 'PhotoModel', 'options'], function(PhotoView, PhotoCollection, PhotoModel, options){

    /* Представление по коллекции фотографий*/


    return Backbone.View.extend({
        el: '#fp_preview_albums',
        initialize: function(initialPhotos){
            this.collection = new PhotoCollection(/*initialPhotos*/);
            this.listenTo( this.collection, 'add', this.renderPhoto );
            //this.listenTo( this.collection, 'sync', this.render );
        },

        render: function(){
            this.collection.each(function( item ){
                this.renderPhoto( item )
            }, this);
            return this;
        },

        renderPhoto: function( item ){
            var photoView = new PhotoView({
                model: item
            });
            this.$el.prepend( photoView.render().el );
            return this;
        },

        addPhoto: function( exifData, dataUpload, base64 ){
            var photoModel = new PhotoModel( exifData );
            photoModel['dataUpload'] = dataUpload;
            photoModel['base64'] = base64;
            this.collection.add( photoModel );
        },

        removeNewPhoto: function(){
            var newPhotos = _.filter(this.collection.models, function( model ){ return model.isNew()}, this);
            _.each(newPhotos, function(photo){
                photo.destroy();
            });
        },

        /*
        * Сохраняются изменения в портфолио
        * Или изменение атрибутов моделей, или загрузка новых
        * */
        uploadNewPhoto: function(){
            var newPhotos = _.filter(this.collection.models, function( model ){ return model.isNew()}, this);
            var changedPhotos = _.filter(this.collection.models, function( model ){ return model.hasChanged() && !model.isNew()}, this);

            // сохранение новых фотографий
            _.each(newPhotos, function( model ){
                var dataUpload = model['dataUpload'];
                if ( dataUpload ){
                    dataUpload.formData = {
                        title: model.get('title'),
                        date_modified: model.get('date_modified'),
                        owner_gid: Urls.ownerGid,
                        type: 'photo'
                    };
                    var res = dataUpload.submit();

                    res.done(function(data, textStatus, xhr){
                        if ( xhr.status === 200 ){
                            model.save();
                        }
                    })
                        .fail(function( jqXHR, textStatus, errorThrown ) {
                             console.log('fail ws upload');
                        });
                }
            });

            // сохранение изменений атрибутов фотографий
            _.each(changedPhotos, function( model ){
                model.save();
                console.log('Проваливается PUT фотографии')
            });
        }
    });
});