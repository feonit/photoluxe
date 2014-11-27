/*
 * Вкладка Photos
 * by Leonid
 *
 * */

portfolioModules = [
    'jquery',
    "underscore",
    "options",
    "text!templates/uploadPhoto.html" ,
    'PhotoListView',
    'PhotoView',
    'PhotoModel',
    'PhotoCollection',
    'fileLoader',
    'helpers'
];

portfoliInit = function($, SideBar, options, tempPreview, PhotoListView, PhotoView, PhotoModel, PhotoCollection, fileLoader, helpers)
{

    /**
     * Подготовка картинки в формате base64 для использования её в виде background'a
     *
     **/

    function _fileToBase64(file){
        var deferred = $.Deferred();
        var reader = new FileReader();

        var that = this;
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            deferred.resolve(binaryString);
        };
        reader.readAsDataURL(file);
        return deferred;
    }

    /**
     * @return {number}
     */
    function DateTimeOriginalToUnix( dateStr ){

        if ( "undefined" === typeof dateStr){
            return Date.parse(new Date())/1000;
        }

        var arr = dateStr.replace(' ',':').split(':');
        var date = new Date();
        date.setYear(arr[0]);
        date.setMonth(arr[1]);
        date.setDate(arr[2]);
        date.setHours(arr[3]);
        date.setMinutes(arr[4]);
        date.setSeconds(arr[5]);

        return Date.parse(date)/1000;
    }

    /*
     * Метод для получения нужных мета и экзиф данных
     *
     * */
    function _getInformation(data){
        var dataInfo = {};

        function _ConvertDMSToDD(days, minutes, seconds, direction) {
            var dd = days + minutes/60 + seconds/(60*60);

            if (direction == "S" || direction == "W") {
                dd = dd * -1;
            } // Don't do anything for N or E
            return dd;
        }

        function _ParseDMS(name){
            if ('undefined' != typeof exif[name]){
                var res = exif[name].split(',').map(function(str){
                    return parseFloat(str);
                });
                res.push(exif[name + 'Ref']);
                return _ConvertDMSToDD.apply(null, res);
            }
        }

        if(data.exif && data.exif.getAll){
            var exif = data.exif.getAll();

            $.extend(dataInfo, {
                date_modified: DateTimeOriginalToUnix(exif['DateTimeOriginal']),
                focal_length: exif['FocalLength'],
                iso_speed: exif['ISOSpeed'],
                exposure_time: exif['ExposureTime'],
                f_number: exif['FNumber'],
                camera_brand: exif['Make'],
                camera_model: exif['Model'],
                latitude: _ParseDMS('GPSLatitude'),
                longitude: _ParseDMS('GPSLongitude')
            });
        }

        $.extend(dataInfo, {
            title: data.files[0]['name'],
            size: data.files[0]['size'],
            type: data.files[0]['type']
        });

        return dataInfo;
    }


    return new function(){

        var that = this,
            photoListView = new PhotoListView( /*photosJSON.photo*/ );

        that.pageName = 'portfolio';


        /*
         * Подгрузка и подключение функционала добавления фотографий
         * и его инициализация
         *
         * */
        function connectFunctionalUpload(){
            require(['fileLoader'], function(){
                console.log('loader подключён');
                var uploader = $('#fileupload');

                uploader.fileupload(fileLoader.options);
                fileLoader.initDebugInfo('fileupload');
                uploader.on('fileuploadprocessalways', addFilesFn);
            });
        }

        /*
         * Отключение функционала добавления фотографий
         * и его деинициализация
         *
         * */

        function disconnectFunctionalUpload(){
            var uploader = $('#fileupload');
            console.log('loader отключён');

            uploader.fileupload('destroy');
            uploader.off();
        }

        function addFilesFn( e, data ){
            var index = data.index,
                file = data.files[ index ],
                dataInfo = _getInformation( data );

            _fileToBase64( file ).done(function( base64 ){
                photoListView.addPhoto( dataInfo, data, base64 );
            });
        }


        /*
         * Первая инициализация скрипта, после загрузки страницы
         * */
        this.init = function(){

            photoListView.collection.fetch();

            var $page = $('#'+that.pageName),
                uploader = $page.find('#fileupload'),
                $uploaderEdit = $page.find('.control-uploader-edit'),
                $uploaderSave = $page.find('.control-uploader-save'),
                $uploaderFinish = $page.find('.control-uploader-finish'),
                $uploaderCancel = $page.find('.control-uploader-cancel'),
                $dropZone = $page.find('#drop_zone');

            $uploaderEdit.one('click', enableEditModeFn);

            function enableEditModeFn (){
                _toggleView(true);
                _bindEventsBtn();
                connectFunctionalUpload();
                event.preventDefault();
            }

            function deactivateEditModeFn(){
                _toggleView(false);
                _unbindEventsBtn();
                disconnectFunctionalUpload();
                $uploaderEdit.one('click', enableEditModeFn);
                event.preventDefault();
            }

            function _bindEventsBtn(){

                $uploaderCancel.on('click', function(){
                    deactivateEditModeFn();
                    photoListView.removeNewPhoto();
                });

                $uploaderSave.on('click', function(event){
                    photoListView.uploadNewPhoto();
                    event.preventDefault();
                });

                $uploaderFinish.on('click', function(event){
                    deactivateEditModeFn();
                    photoListView.uploadNewPhoto();
                    event.preventDefault();
                });
            }

            function _unbindEventsBtn(){
                $uploaderSave.off();
                $uploaderFinish.off();
                $uploaderCancel.off();
            }

            /*
             * Открывает режим загрузки и редактирования изображений
             * */

            function _toggleView(status){
                setTimeout(function(){
                    //.b-controls
                    var imageControls = $('.thumb-scrollers');
                    var hiddenElements = $().add($uploaderSave)
                        .add($uploaderFinish)
                        .add($uploaderCancel)
                        .add($dropZone);

                    if ( status === true) {
                        hiddenElements.fadeIn();
                        // особое поведение должно быть
                        imageControls.removeClass('hidden-block-controls');
                    } else {
                        hiddenElements.fadeOut();
                        imageControls.addClass('hidden-block-controls');
                    }
                }, 100);
            }

            /*
             * Последующая инициализация скрипта, после загрузки страницы
             * */
            this.init = function(){
                photoListView.collection.fetch();
            }
        }
    };
};

define(portfolioModules, portfoliInit);
