define(['jquery', 'load-image', 'options'], function($, loadImage, options){
    'use strict';

    //If you want to allow specific drop zones but disable the default browser action for file drops on the document, add the following JavaScript code:
    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });

    /*
    * Общие опции для аплоадера
    *
    * */

    return {
        options : {
            //AJAX Options
            url: options.Urls.portfolio.upload,
            type: 'POST',
            dataType: 'json',
            forceIframeTransport: false,
            //General Options
            dropZone: $('#drop_zone'),
            pasteZone: null,
            limitMultiFileUploads: 5,
            limitMultiFileUploadSize: 250000000, // 250 MB
            singleFileUploads: true,// итерация пачкой или по одному
            multipart: true,
            xhrFields: {"withCredentials": true},  // не понятно к чему это было нужно
            //File Processing Options
            //processQueue: []
            //Image Preview & Resize Options
            disableExifSub: false,
            disableExifGps: false,
            loadImageMaxFileSize: 100000000,  // 100 MB
            imageMaxWidth: options.Configs.portfolio.imageMaxWidth,
            imageMaxHeight: options.Configs.portfolio.imageMaxHeight,
            imageMinWidth: options.Configs.portfolio.imageMinWidth,
            imageMinHeight: options.Configs.portfolio.imageMinHeight,
            imageCrop: false, //Define if resized images should be cropped or only scaled.
            imageForceResize: undefined, //If set to true, forces writing to and saving images from canvas, even if the original image fits the maximum image constraints.
            disableImageResize: false, // /Android(?!.*Chrome)|Opera/.test(window.navigator && navigator.userAgent),
            imageQuality: undefined, //Sets the quality parameter given to the canvas.toBlob() call when saving resized images.
            previewMaxWidth: 260,
            previewMaxHeight: 260,
            previewMinWidth: undefined,
            previewMinHeight: undefined,
            previewCrop: false,
            previewThumbnail: true, //Create the preview using the Exif data thumbnail.
            previewCanvas: false, // Define if preview images should be resized as canvas elements.
            imagePreviewName: 'preview',
            disableImagePreview: true,
            //Validation options
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            maxFileSize: 100000000,  // 100 MB
            minFileSize: 1,
            maxNumberOfFiles: 10,
            disableValidation: false,
            //Callback Options
            autoUpload: false
        },


        /* ВНИМАНИЕ, это практически полное API, которое можно использовать в другом файле, расширяя bind консольные выводы */

        /*
         * Функционал уведомлений о события, чисто для отладки
         * */

        initDebugInfo : function(id){
            var uploader = $('#' + id);

            uploader.bind('fileuploaddrop', function(){console.log('fileuploaddrop!!!')})

            uploader.bind('fileuploadadd', function (e, data) {
                $.each(data.files, function (index, file) {
                    console.log('Added file: ' + file.name);
                });
            });
            uploader.bind('fileuploadsend', function(e, data){
                if (data.files.length > 10) {
                    return false;
                }
            });
            uploader.bind('fileuploaddone', function (e, data) {
                // for successful upload requests and will also be called if the server returns a JSON response with an error property.
                // data.result
                // data.textStatus;
                // data.jqXHR;
                /*        $.each(data.result.files, function (index, file) {
                 if (file.url) {
                 //                {{ path('_ft_ws_upload_post_upload') }}
                 console.log(file.url);
                 //options.Urls.portfolio.postUpload
                 } else if (file.error) {
                 console.log(file.error);
                 }
                 });*/
            });
            uploader.bind('fileuploadfail', function(e, data){
                // like done
                // data.errorThrown
                // data.textStatus;
                // data.jqXHR;
            });
            uploader.bind('fileuploadalways', function(e, data){
                // for completed (success, abort or error) upload requests
                // data.result
                // data.textStatus;
                // data.jqXHR;
            });
            uploader.bind('fileuploadprogress', function(e, data){
                var progress = parseInt(data.loaded / data.total * 100, 10);
            });
            uploader.bind('fileuploadprogressall', function(e, data){
                var progress = parseInt(data.loaded / data.total * 100, 10);
            });
            uploader.bind('fileuploadstart', function (e) {
                console.log('Uploads started');
            });
            uploader.bind("fileuploadstop", function (e) {
                console.log('Uploads finished');
            });
            uploader.bind("fileuploadchange", function (e, data) {
                //Callback for change events of the fileInput collection.
                $.each(data.files, function (index, file) {
                    console.log('Selected file: ' + file.name);
                });
            });
            uploader.bind('fileuploadpaste', function(e, data){
                //Callback for paste events to the dropZone collection.
                $.each(data.files, function (index, file) {
                    console.log('Pasted file type: ' + file.type);
                });
            });
            uploader.bind('fileuploaddrop', function(e, data){
                //Callback for drop events of the dropZone collection.
                $.each(data.files, function (index, file) {
                    console.log('Dropped file: ' + file.name);
                });
            });
            uploader.bind('fileuploaddragover', function(e, data){
                e.preventDefault(); // Prevents the default dragover action of the File Upload widget
                //Note: The file upload plugin only provides a dragover callback, as it is used to make drag&drop callbacks work. If you want callbacks for additional drag events, simply bind to these events with jQuery's native event binding mechanism on your dropZone element, e.g.:
                //$('#fileupload').on('dragleave', function (e) {
                //    // dragleave callback implementation
                //});
            });

            //Processing Callback Options

            //Note that the data object contains two arrays:
            //files - which contains the result of the process applied.
            //originalFiles - the original uploaded files.
            //It also contains an index parameter that tells you which file was worked on this time.

            uploader.bind('fileuploadprocessstart', function(e, data){
                //Callback for the start of the fileupload processing queue.
                console.log('Processing started...')
            });
            uploader.bind('fileuploadprocess', function(e, data){
                //Callback for the start of an individual file processing queue.
                console.log('Processing ' + data.files[data.index].name + '...');
            });
            uploader.bind('fileuploadprocessdone', function(e, data){
                //Callback for the successful end of an individual file processing queue.
                console.log('Processing ' + data.files[data.index].name + ' done.');
            });
            uploader.bind('fileuploadprocessfail', function(e, data){
                $.each(data.files, function (index, file) {
                    console.log('File upload failed.');
                    console.log('Processing ' + file.name + ' failed.');
                });
            });
            uploader.bind('fileuploadprocessalways', function(e, data){
                //Callback for the end (done or fail) of an individual file processing queue.
                console.log('Processing ' + data.files[data.index].name + ' ended.');
            });
            uploader.bind('fileuploadprocessstop', function(e, data){
                //Callback for the stop of the fileupload processing queue.
                console.log('Processing stopped.');
            });

            uploader.prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        }
    }
});
