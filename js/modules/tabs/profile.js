define(['jquery', 'underscore', 'options', 'bootstrap', 'select2', 'googleMap', 'jquery.serialize-object', 'ajax', 'geolocation', 'canvas-to-blob'], function($, _ , options, noObj, select2, googleMap, noObjTo, ajax, geolocation, noObj){

    return new function(){

        var that = this;

        this.pageName = 'profile';

        this.$page = $('.' + this.pageName);

        this._namespace = 'modules.tabs.profile';

        this.ui = {};

        /**
         * SDK JavaScript
         * Интерфейс с фейсбуком
         * */

        this.initSocialApi = function( id ){

            require(['facebookInit', 'facebookInit'], function(FB, VK){
                $('.soc-button.facebook').click(function(){
                    FB.logout();
                });
            });

        };

        /**
         * Инициализация интерфейса по редактированию месторасположения
         * */

        this.initLocationUI = function(){

            var $input = this.$page.find('#pac-input');
            var lat = parseFloat($input.attr('data-latitude'));
            var lon = parseFloat($input.attr('data-longitude'));
            var zoom = parseInt($input.attr('data-zoom'), 10);
            var $container = this.$page.find('#map_canvas');
            var data = {};

            if (_.isNumber(lat) && _.isFinite(lat)){
                data.latitude = lat;
            }

            if (_.isNumber(lon) && _.isFinite(lon)){
                data.longitude = lon;
            }

            if (_.isNumber(zoom) && _.isFinite(zoom)){
                data.zoom = zoom;
            }

            if ($container.length === 0){
                throw 'not found container for map';
            } else {
                data.container = $container;
                return this.ui.googleMapApi = googleMap.init(data);
            }

        };

        /**
         *
         * */

        this.bindToggleBarSocial = function(){
            ///код ниже обрабатывает показ_и_скрытие панели с социальными кнопками.
            //$('.soc-button.plus').on('click', function(e){
                //if( $(e.target).hasClass('.plus') || e.target.tagName === 'SPAN' ) {
                //
                //    var panel = $('.soc-button-popup-panel', socialContainer);
                //
                //    if(panel.is(':visible')) {
                //        panel.hide();
                //        $(document).off('click.soc-popup-panel');
                //
                //    } else {
                //        panel.show();
                //        $(document).on('click.soc-popup-panel',function(e){
                //            if ($(e.target).closest('soc-button-popup-panel').length === 0) {
                //                panel.hide();
                //                $(document).off('click.soc-popup-panel');
                //            }
                //        });
                //
                //    }
                //}
                //return false;
            //});
        };

        /**
         * открытие формы смены аватара/удаление аватара
         * todo сделать дефолтные настройки к аватарке
         * */

        this.initEditAvatar = function(){
            editAvatarModules = [
                'load-image',
                'load.Jcrop',
                'load-image-meta',
                'load-image-exif',
                'load-image-exif-map',
                'load-image-ios',
                'load-image-orientation'
            ];
            editAvatarInit = function (loadImage, noObj) {
                var $avatarModal = that.$page.find('#modal_edit_avatar');
                var defaultOpt = {
                    sizeAvatar: 240, // это принятый размер квадратной аватарки
                    maxWidth: 1200, // максимальное условное значение канваса, это максимум что будет видно на больших desctop -ах (ограничено размером контейнера)
                    maxHeight: 1200, // максимальное условное значение канваса, это максимум что будет видно на больших desctop -ах (ограничено размером контейнера)
                    minHeight: this.sizeAvatar,
                    minWidth: this.sizeAvatar
                };

                // 3 нарезки
                // 1ая - берется исходная, и если она огромная, то режется на более мелкую
                // 2ая - берется подготовленная, и режется под размер контейнера, для возможности ресайза
                // 3ая - берутся координаты из jcrop и по ним режеится подготовленная второй раз до необходимого размера аватарки
                // если объединить 1 и 2 то резайзинг может захлебнуться от больших фоток
                var result = $('#result'),
                    thumbNode = $avatarModal.find('#thumbnail'),
                    actionsNode = $('#actions'),
                    exifNode = $('#exif'),
                    currentFile,
                    coordinates,
                    jcrop_api = null,
                    file,
                    options,

                //2 этап

                    /**
                     * Активация режима изменения картинки,
                     * это выбор области нарзеки
                     * */

                    addJcrop = function (result) {
                        var imgNode = result.find('img, canvas'),
                            img = imgNode[0];

                        var albumOrientation = img.width < img.height;
                        var select;

                        if (albumOrientation) {
                            select = [0, (img.height - img.width) / 2, img.width, img.width + (img.height - img.width) / 2];
                        } else {
                            select = [(img.width - img.height) / 2, 0, img.height + (img.width - img.height) / 2, img.height];
                        }

                        that.ui.cropbox = imgNode;

                        imgNode.Jcrop({
                            setSelect: select,
                            onSelect: function (coords) {
                                coordinates = coords;
                            },
                            onRelease: function () {
                                coordinates = null;
                            },
                            boxWidth: result.width() / 2, //в 2 раза меньше контейнера
                            boxHeight: result.width() / 2,
                            minSize: [defaultOpt.sizeAvatar, defaultOpt.sizeAvatar],
                            maxSize: [1000, 1000],
                            aspectRatio: 1,
                            bgColor: 'black',
                            bgOpacity: .6

                        }, function () {

                            that.ui.jcrop_api = jcrop_api = this;

                        }).parent().on('click', function (event) {
                            event.preventDefault();
                        });

                        result.find('.jcrop-keymgr').css('opacity', 0).css('left', '-10000'); //stuped checkbox showing bug
                    },

                    /**
                     * Вставка картинки в целевой контейнер
                     * */

                    replaceResults = function (img) {
                        var content;
                        if (!(img.src || img instanceof HTMLCanvasElement)) {
                            content = $('<span>Loading image file failed</span>');
                        } else {
                            content = $('<a target="_blank">').append(img)
                                .attr('download', currentFile.name);
                            //.attr('href', img.src || img.toDataURL()); это для загрузки картинки
                        }
                        result.children().replaceWith(content);
                        if (img.getContext) {
                            actionsNode.show();
                        }

                        addJcrop(result);
                    },

                    /**
                     * На основе исходного файла синтезируется
                     * уменьшенная копия изображения на канвасе, которая обрабатывается в replaceResults
                     * */

                    displayImage = function (file, options) {
                        currentFile = file;

                        //loadingImage.onload = loadingImage.onerror = null; // обработка ошибок
                        var loadingImage = loadImage(
                            file,
                            replaceResults,
                            options
                        );

                        if (!loadingImage) {
                            result.children().replaceWith(
                                $('<span>Your browser does not support the URL or FileReader API.</span>')
                            );
                        }
                    },

                //1ый этап

                    /**
                     * Обработчик события выбора файла фотографии
                     * */

                    dropChangeHandler = function (e) {
                        e.preventDefault();
                        e = e.originalEvent;
                        var target = e.dataTransfer || e.target;

                        file = target && target.files && target.files[0];
                        options = {
                            maxWidth: defaultOpt.maxWidth,
                            maxHeight: defaultOpt.maxHeight,
                            minWidth: defaultOpt.minWidth,
                            minHeight: defaultOpt.minHeight,
                            canvas: true
                        };

                        if (!file) {
                            return;
                        }

                        //@deprecated
                        that.initEditAvatar.file = file;

                        //exifNode.hide();
                        //thumbNode.hide();
                        loadImage.parseMetaData(file, function (data) {
//                            if (data.exif) {
//                                options.orientation = data.exif.get('Orientation');
//                                displayExifData(data.exif);
//                            }
                            displayImage(file, options);

                            $(window).bind('resize', resizeHandler);
                        });
                    },

                //responsiveSupport
                    resizeHandler = function (e) {

                        if (resizeHandler.process) {
                            return false;
                        }

                        resizeHandler.process = true;
                        if (jcrop_api) {

                            setTimeout(function () {
                                jcrop_api.destroy();
                                displayImage(file, options);

                                resizeHandler.process = false;
                            }, 500);
                        }
                        return true;
                    },

                // 3ий этап

                    /**
                     * Завершение действий пользователя по выбору пофотграфии и выбора области её нарезки,
                     * фотография режется и вставляется в контейнер для аватарки
                     * */

                    finishHandler = function () {
                        //crop
                        var img = result.find('img, canvas')[0];
                        if (img && coordinates) {
                            var newSmallImg = loadImage.scale(img, {
                                left: coordinates.x,
                                top: coordinates.y,
                                sourceWidth: coordinates.w,
                                sourceHeight: coordinates.h,
                                maxWidth: defaultOpt.sizeAvatar,
                                maxHeight: defaultOpt.sizeAvatar
                            });

                            //coordinates = null;
                            that.initEditAvatar.coordinates = coordinates;
                            coordinates = null;
                        }
                        // view
                        that.$page.find('#avatar').empty().append(newSmallImg);
                        that.$page.find('#submit_avatar').show();
                        $avatarModal.modal('hide');
                        img.remove();
                    },

                    dragoverFix = function (e) {
                        e.preventDefault();
                        e = e.originalEvent;
                        e.dataTransfer.dropEffect = 'copy';
                    },

                    fakeBtnHandler = function (event) {
                        event.preventDefault();
                        $real.click();
                    },

                    $fake = $avatarModal.find('#fake-file-input'),
                    $real = $avatarModal.find('#real-file-input'),
                    $finish = $avatarModal.find('#finish'),
                    $document = $(document),

                    bindComponentEvents = function () {
                        $document.bind('dragover', dragoverFix);
                        $document.bind('drop', dropChangeHandler);
                        $fake.bind('click', fakeBtnHandler);
                        $real.bind('change', dropChangeHandler);
                        $finish.bind('click', finishHandler);
                    },

                    unbindComponentEvents = function () {
                        $document.unbind('dragover', dragoverFix);
                        $document.unbind('drop', dropChangeHandler);
                        $fake.unbind('click', fakeBtnHandler);
                        $real.unbind('change', dropChangeHandler);
                        $finish.unbind('click', finishHandler);
                    };


                // Hide URL/FileReader API requirement message in capable browsers:
                if (window.createObjectURL || window.URL || window.webkitURL || window.FileReader) {
                    result.children().hide();
                }

                // once time bind
                if (!that.initEditAvatar.init) {
                    console.log(123);
                    bindComponentEvents();
                    that.initEditAvatar.init = true;
                }
                console.log($avatarModal);
            };
            require(editAvatarModules, editAvatarInit);
        };

        /**
         * RulesMaster
         * @value {Array} Is array of rules
         * @method init Поиск DOM элементов
         * @param {String} name Имя правила
         * @param {String} selector Селектор проверяемого поля
         * @param {Array} regExp Массив регулярных выражений
         * @param {Array} text Массив соответствующих регулярным выражениям сообщений
         * @param {Array} record Массив соответствующих индексов не прошедших валидацию
         * */

        /**
         * validate
         * Метод для обработки правил на валидацию редактируемых полей
         * Если поле не валидно, производится запись
         * {Object} Правило, какому элементу
         * {jQuery Object} DOM, проверяемое поле
         * */

        this.rulesMaster = {

            // проверяет поле, запоминает массив индексов об ошибках

            validate: function(rule){
                var isValid;

                rule.record = [];

                rule.control = $(rule.selector);

                _.each(rule.regExp, function( regExp, index ){
                    isValid = true;

                    rule.control.each(function(index, elem){
                        if (regExp.test($(elem).val()) === false){
                            isValid = false;
                        }
                    });

                    if (! isValid ){
                        rule.record.push(index);
                        return rule;
                    }
                });

                return !!rule.record.length;
            },

            validateField: function(node){
                var $node = $(node);
                var name = $node.attr('data-validate-name');
                var isValid = true;
                var index = 0;

                var rule = that.rulesMaster.rules[name];
                if (rule.regExp[index].test($node.val()) === false ){
                    isValid = false;
                }

                if (! isValid ){
                    rule.record.push(index);
                    return rule;
                }
                return !!rule.record.length;
            },

            validateAll : function(){
                var curRule;

                for (curRule in this.rules) {
                    if ( this.rules.hasOwnProperty( curRule ) ){
                        this.validate( this.rules[curRule] );
                    }
                }
            },


            getFailRules : function(){
                 var curRule, failRules = [];

                 this.validateAll();

                 for (curRule in this.rules) {
                     if ( this.rules.hasOwnProperty( curRule ) ){
                         if (this.rules[curRule].record.length > 0){
                             failRules.push(this.rules[curRule]);
                         }
                     }
                 }

                 return failRules;
             },


            getSuccessRules : function(){
                var curRule, successRules = [];

                this.validateAll();

                for (curRule in this.rules) {
                    if ( this.rules.hasOwnProperty( curRule ) ){
                        if (this.rules[curRule].record.length === 0){
                            successRules.push(this.rules[curRule]);
                        }
                    }
                }

                return successRules;
            },

            rules : {
                //http://www.regexr.com/
                websites : {
                    selector: 'input.control-websites',
                    regExp: [
                        /(^$)|(^(((((http)|(https)):\/\/)|www\.)?(\w|\.|\/)+,? ?)+$)/  //this find (https://regexr.com/foo.html, https://regexr.com/foo.html and empty "") this need for plugin
                    ],
                    text: [
                        'Not valid url'
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                },

                phones : {
                    selector: 'input.control-phones',
                    regExp: [
                        /(^$)|(^[0-9]{7,}$)/
                    ],
                    text: [
                        'Enter only numbers length from 7'
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                },

                username : {
                    //var re = /^([^\u0000-\u007F]|[\w]){1,16}$/;
                    selector : 'input.control-username',
                    regExp : [
                        /^[a-zA-Zа-яА-Я0-9 ]{2,64}$/,
                    ],
                    text : [
                        'This field is required, enter your name length from 2 to 64 characters, like "a-z", "A-Z", "а-я", "А-Я", "0-9" and space'
                    ],
                    errorLevel : [
                        'error',
                        'error'
                    ],
                    record : []
                },
                email : {
                    //https://github.com/chriso/validator.js/blob/master/validator.js
                    selector : 'input.control-email',
                    regExp : [
                        /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
                    ],
                    text : [
                        'No valid email'
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                },
                status : {
                    selector : 'input.control-status',
                    regExp : [
                        /^$|^[^\$\*\^#%&]{3,128}$/,
                    ],
                    text : [
                        'This field can be left blank, or enter text length from 3 to 128 characters, except the $, *, #, %,',
                    ],
                    errorLevel : [
                        'error',
                    ],
                    record : []
                },
                about : {
                    selector : 'textarea.control-about',
                    regExp : [
                        /^$|^[^]{5,512}$/,
                    ],
                    text : [
                        'This field can be left blank, or enter text length from 5 to 255 characters'
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                },
                firstName : {
                    selector : 'input.control-first-name',
                    text : [
                        'No valid First Name'
                    ],
                    regExp : [
                        /^([^\u0000-\u007F]|[\w ]){1,16}$/
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                },
                lastName : {
                    selector: 'input.control-last-name',
                    regExp: [
                        /^([^\u0000-\u007F]|[\w ]){1,24}$/
                    ],
                    text: [
                        'No valid Last Name'
                    ],
                    errorLevel : [
                        'error'
                    ],
                    record : []
                }

                //http://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url?lq=1
                //url : {
                //    input : '.control-url',
                //    regExp : /^(?:[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\x{E000}-\x{F8FF}\x{F0000}-\x{FFFFD}|\x{100000}-\x{10FFFD}\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\/\?])*)?|(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=@])+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\x{E000}-\x{F8FF}\x{F0000}-\x{FFFFD}|\x{100000}-\x{10FFFD}\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\/\?])*)?)$/i,
                //    text : 'No valid Url'
                //}
            }
        };


        /**
         * Валидация полей
         * @return {boolean}
         * */

        this.testAllInput = function(){
            var that = this,
                failRules = [],
                getSuccessRules = [],
                rules = this.rulesMaster.rules;


            for (var name in rules){
                if (rules.hasOwnProperty(name)){

                    // определить все контролы
                    rules[name].control = $(rules[name].selector);
                    // удаляем все выделения
                    processRulesStop(rules[name]);
                }
            }

            // собираем ошибки
            failRules = this.rulesMaster.getFailRules();
            // собираем остальное
            getSuccessRules = this.rulesMaster.getSuccessRules();

            _.each(getSuccessRules, processSuccessRules);

            // обрабатываем ошибки
            _.each(failRules, processErrorRules);

            // возвращаем признак успеха
            return !failRules.length;
        };

        function processRulesStop(rule){
            var $node = rule.control,
                $parent = $node.parents('.form-group');

            // удаляем все выделения
            $parent.removeClass('has-error has-success has-feedback');
            $parent.find('.form-control-feedback').remove();
        }

        function processRulesStopAll(){
            var rules = that.rulesMaster.rules;

            for (var name in rules){
                processRulesStop(rules[name]);
            }
        }

        function processSuccessRules(rule) {
            var $node = rule.control,
                $parent = $node.parents('.form-group');

            processRulesStop(rule);

            $parent.addClass('has-success has-feedback');
            if( !(rule.control.hasClass('control-phones') || rule.control.hasClass('control-websites')) ) {
                rule.control.parent().append($('<span class="glyphicon glyphicon-ok form-control-feedback"></span>'));
            }

            that.destroyMessage($parent);
        }

        function processErrorRules(rule){
            var $node = rule.control,
                $parent = $node.parents('.form-group');

            processRulesStop(rule);

            _.each(rule.record, function( index ) {

                var warnMessage = rule.text[ index ];

                if ( rule.errorLevel[ index ] === 'error') {

                    $parent.addClass('has-error has-feedback');//.append($('<span class="help-block"></span>').text( warnMessage));

                    if( !(rule.control.hasClass('control-phones') || rule.control.hasClass('control-websites')) ) {
                        rule.control.parent().append($('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'));
                    }

                    that.initPopupMessage($parent, warnMessage);

                }

                $node.focus();
            });
        }

        /**
         * Всплывающая подсказка
         * */

        this.initPopupMessage = function ($node, content){

            var options = {
                container : 'body',
                content : content,
                delay : '100',
                html : false,
                placement: function (context, source) {
                    var left = $(source).offset().left;
                    var top = $(source).offset().top;
                    var right = $(window).width() - left - $(source).width();

                    if ( left > right && left > 250 ) {
                        return "left";
                    }

                    if ( right > left && right > 250 ) {
                        return "right";
                    }

                    if (top < 110){
                        return "bottom";
                    }

                    return "top";
                },
                trigger : 'manual',
                template : '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                title : function(){
                    return ''
                }
            };

            $node.popover(options);
            $node.popover('show');
         };

        this.destroyMessage = function($node){
            $node.popover('destroy');
        };

        /**
         * Вывод результата отправки формы
         * //todo поменять на другой вывод
         * */

        this.formSubmitResult = function($node, content){
            var options = {
                container : 'body',
                content : content,
                delay : '100',
                html : false,
                placement: function (context, source) {
                    var left = $(source).offset().left;
                    var top = $(source).offset().top;
                    var right = $(window).width() - left - $(source).width();

                    if ( left > right && left > 250 ) {
                        return "left";
                    }

                    if ( right > left && right > 250 ) {
                        return "right";
                    }

                    if (top < 110){
                        return "bottom";
                    }

                    return "top";
                },
                trigger : 'manual',
                template : '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                title : function(){
                    return ''
                }
            };
            $node.popover('destroy');
            $node.popover(options);
            $node.popover('show');
            setTimeout(function(){
                $node.popover('destroy');
            }, 5000)
        };

        // Поддержка работает только для двух контролов: имени и емаила,
        // поддержка остальных значений слишком затруднительна,
        // и является продолжением костыльной реализации работы формы на бекенде

        this.initSupportUpdateForm = function(){
            // update forms support
            // как только какое то поле изменится, то относящийся к нему флаг update активизируется
            // и вместе с данными отправляется на сервер (это костыль)

            var $inputUsername = that.$page.find('.control-username'),
                $updateUsername = that.$page.find('.username-form-updated'),

                $inputEmail = that.$page.find('.control-email'),
                $updateEmail = that.$page.find('.email-form-updated'),

                $fieldsDetails = that.$page.find('.control-status, .control-about, .control-first-name, .control-last-name, .control-phones, .control-websites, .select2-time-zone'),
                $updateDetails = that.$page.find('.details-form-updated');


            $updateUsername.val(0);
            $updateEmail.val(0);
            $updateDetails.val(0);

            // ready value
            $inputUsername.attr('data-old-value', $inputUsername.val());
            $inputEmail.attr('data-old-value', $inputEmail.val());

            _.each($fieldsDetails, function(elem){
                $(elem).attr('data-old-value', $(elem).val());
            });

            // once bind event
            if (this.initSupportUpdateForm.bindEvents) return;


            $inputUsername.on('change', function(){
                var newVal = $(this).val(),
                    boolean = (newVal === $(this).attr('data-old-value'));

                $updateUsername.val(+!boolean);
            });

            $inputEmail.on('change', function(){
                var newVal = $(this).val(),
                    boolean = (newVal === $(this).attr('data-old-value'));

                $updateEmail.val(+!boolean);
            });

            $fieldsDetails.on('change', function(){
                var newVal = $(this).val(),
                    boolean = (newVal === $(this).attr('data-old-value'));

                //$updateDetails.val(+!boolean);
                $updateDetails.val('1');
            });

            that.$page.find('#ftdb_aclbundle_details_autotimezone').on('click', function(){
                $updateDetails.val('1');
            });

            this.initSupportUpdateForm.bindEvents = true;
        };

        /**
         * Автоматическая инициализация модуля на странице
         * */

        this.init = function(){
            var that = this;

            /**
             * Initialize User Interface
             * */

             // init components
            //this.initSocialApi();
            this.bindToggleBarSocial();

            var googleMapApi = this.initLocationUI(),
                $btnSubmitMap = this.$page.find('#submit_map'),
                $btnSubmitAll = this.$page.find('#submit_all'),
                $btnSubmitAvatar = this.$page.find('#submit_avatar'),
                $btnSubmitPassword = this.$page.find('#submit_password'),

                $formAll = $('#formAll'),
                $formAvatar = $('#formAvatar'),
                $formMap = $('#formMap'),
                $formPassword = $('#formPassword');

            /**
             * Инициализация селект контролов на основе плагина Select2
             * */

            var $language = this.ui.select2Language = this.$page.find('.select2-language'),
                $timeZone = this.ui.select2TimeZone =  this.$page.find('.select2-time-zone');

            $language.select2({
                placeholder:"Enter your languages"
            });
            $timeZone.select2({
                placeholder:"Enter your time zones"
            });

            $language.on('change', function(){
                enableButton.call( $btnSubmitAll );
                that.$page.find('#ftdb_aclbundle_details_updated').val(1)
            });

            $timeZone.on('change', function(){
                enableButton.call( $btnSubmitAll );
                that.$page.find('#ftdb_aclbundle_details_updated').val(1)
            });

            /**
             * Инициализация контрола с многочисленными инпутами
             * */
            $('.input-plus').on('click', function(){
                var field = $(this).parent().find('ul');
                var first = field.find('.input-field').first();
                var last = field.find('.input-field').last().find('input');
                if ( last.val() !== ""){
                    var clone = first.clone(true, true);
                    clone.find('input').val('');
                    field.append(clone);
                } else {
                    last.focus();
                }
            });

            $('.input-delete').on('click', function(){
                $(this).parents('.input-field').remove();
            });



            this.initSupportUpdateForm();

            /**
             * Сохранение формы с аватаркой , картинка и координаты кропа
             * */

            $formAvatar.on('submit', function(e){
                e.preventDefault();

                var formDataEmpty = new FormData();
                var originalFile = that.$page.find('[type="file"]')[0].files[0];

                var canvas = that.$page.find('#avatar canvas')[0];
                //var png = canvas.toDataURL().split(',')[1];
                //var the_file = new Blob([window.atob(png)],  {type: originalFile.type, encoding: 'utf-8'});


                canvas.toBlob(function(blob){
                    formDataEmpty.append('fileupload', blob);
                    formDataEmpty.append('date_modified', originalFile.lastModifiedDate.getTime());
                    //formDataEmpty.append('type', originalFile.type);
                    formDataEmpty.append('type', "avatar"); //this field for our api
                    formDataEmpty.append('source_type', "blob"); //this field for our api
                    formDataEmpty.append('title', originalFile.name);
                    formDataEmpty.append('owner_gid', options.user.gid);

                    var url1 = options.Urls.avatar.upload;
                    var url2 = options.Urls.avatar.postUpload;
                    var $submit = $btnSubmitAvatar;

                    ajax.submitFormData(url1, formDataEmpty,
                        function done(){
                            ajax.submitFormData(url2, formDataEmpty,
                                function done() {
                                    that.formSubmitResult($submit, 'Form was submit');
                                    disableButton.call($submit);
                                },
                                function fail() {
                                    that.formSubmitResult($submit, 'Fail submit');
                                }
                            )
                        },
                        function fail() {
                            that.formSubmitResult($submit, 'Fail submit');
                        }
                    );
                });
            });

            /**
             * Сохранение формы с паролем
             * */

            $formPassword.on('submit', function(e){
                e.preventDefault();

                var sources = $(this).serializeArray();
                var $submit = $btnSubmitPassword;
                var $that = $(this);

                if (sources[0].value === "" || sources[1].value === ""){
                    that.formSubmitResult($submit, 'Enter the new password');
                    return '';
                }


                if (sources[0].value === sources[1].value){
                    if ( sources[0].value.length === 1 ){
                        that.formSubmitResult($submit, 'Password is too short');
                    }
                    var data = $(this).serialize();
                    var url = "/settings/profile/change-password"//options.Urls.profile.password;
                    ajax.submitForm(url, data,
                        function done() {
                            that.formSubmitResult($submit, "Check email: " + that.$page.find('.control-email').val());
                            disableButton.call($submit);
                            $that.find('input').each(function(){$(this).val("")});
                        },
                        function() {
                            that.formSubmitResult($submit, 'Form was failed');
                        }
                    );
                } else {
                    that.formSubmitResult($submit, 'Passwords must match');
                }
            });

            /**
             * Сохранение формы с картой, координаты точки, текстовое представление, зум карты
             * */

            $formMap.on('submit', function(e){
                e.preventDefault();

                var url = options.Urls.profile.location;
                var $submit = $btnSubmitMap;
                var formData = new FormData(); // todo организовать полноценный контрол и перейти на использование formData = new FormData( this );

                formData.append("ftdb_aclbundle_location[latitude]", that.ui.googleMapApi.map.getCenter()['k']);
                formData.append("ftdb_aclbundle_location[longitude]", that.ui.googleMapApi.map.getCenter()['B']);
                formData.append("ftdb_aclbundle_location[location_zoom]", that.ui.googleMapApi.map.getZoom());
                formData.append("ftdb_aclbundle_location[location_text]", that.$page.find('#pac-input').val()); //todo
                formData.append("gserger", "sergerge"); //todo


                ajax.submitFormData(url, formData,
                    function done() {
                        that.formSubmitResult($submit, 'Form was submit');
                        disableButton.call($submit);
                    },
                    function fail() {
                        that.formSubmitResult($submit, 'Fail submit');
                    }
                )
            });

            /**
             * Сохранение остальных полей страницы
             * Планируется что тут также будет происходить сохранение карты, аватарки и пароля
             * */

            $formAll.on('submit', function( event ){
                event.preventDefault();
                var $submit = $btnSubmitAll;

                if ( !that.testAllInput() ){
                    return false;
                }

                var url = options.Urls.cabinet.settings_format;

                var data = {
                    'ftdb_aclbundle_user_username[username]' : that.$page.find('.control-username').val(),
                    'ftdb_aclbundle_user_email[email]' :  that.$page.find('.control-email').val(),
                    'ftdb_aclbundle_details[status]' : that.$page.find('.control-status').val(),
                    'ftdb_aclbundle_details[about]' : that.$page.find('.control-about').val(),
                    'ftdb_aclbundle_details[first_name]' : that.$page.find('.control-first-name').val(),
                    'ftdb_aclbundle_details[last_name]' : that.$page.find('.control-last-name').val(),
                    'ftdb_aclbundle_details[gender]' : that.$page.find('#ftdb_aclbundle_details_gender').val(),
                    'ftdb_aclbundle_details[timezone]' : that.$page.find('#s2id_ftdb_aclbundle_details_timezone').select2('val'),
                    'ftdb_aclbundle_details[updated]' : that.$page.find('.details-form-updated').val(),
                    'ftdb_aclbundle_user_username[updated]' : that.$page.find('.username-form-updated').val(),
                    'ftdb_aclbundle_user_email[updated]' : that.$page.find('.email-form-updated').val()
                };

                _.each(that.$page.find('.select2-language').select2('val'), function(elem, i){
                    data['ftdb_aclbundle_details[languages]['+ i +']'] = elem;
                });

                that.$page.find('.control-phones').each(function(i, elem){
                    if ($(elem).val() !== "") {
                        data['ftdb_aclbundle_details[phones]['+ i +'][number]'] = $(elem).val();
                    }
                });

                that.$page.find('.control-websites').each(function(i, elem){
                    if ($(elem).val() !== "") {
                        data['ftdb_aclbundle_details[websites]['+ i +'][url]'] = $(elem).val();
                    }
                });

                if (Number(that.$page.find('#ftdb_aclbundle_details_autotimezone').prop('checked')) === 1){
                    data['ftdb_aclbundle_details[autotimezone]'] = 1;
                }

                 ajax.submitForm(url, $.param( data ),
                     function done( res ) {
                         var result = res;

                         that.formSubmitResult($submit, 'Form was submit');
                         disableButton.call($submit);
                         processRulesStopAll();
                         that.initSupportUpdateForm();
                     },
                     function fail( err ) {
                         var error = err;

                         that.formSubmitResult($submit, 'Fail submit');
                     }
                 );
            });

            /**
             * Дополнительные фичи
             *
             * */



            //Открытие модального окна для редактирования фотки средствами бутсрапа toggle-action
            $('#change_avatar').on('click', that.initEditAvatar);

            // включение кнопки
            function enableButton(){
                $(this)
                    .removeClass('btn-default btn-warning btn-default')
                    .addClass('btn-warning')
                    .removeAttr("disabled");
            }

            // отключение кнопки
            function disableButton(){
                $(this)
                    .removeClass('btn-default btn-warning btn-default')
                    .addClass('btn-default')
                    .attr("disabled", "disabled");
            }

            // тоглеры для кнопок save для форм
            $formAvatar.on('submit', function(){
                disableButton.call($formAvatar);
            });

            $(document).on('change', function( event ){
                var name = $(event.target).attr('data-validate-name');
                var target = $(event.target);
                var rule = that.rulesMaster.rules[name];

                if (name){
                    if ( rule ){
                        var hasErrors = that.rulesMaster.validate(rule);

                        if ( !hasErrors ){
                            enableButton.call($btnSubmitAll, event);
                            processSuccessRules(rule)

                        } else {
                            disableButton.call($btnSubmitAll, event);
                            processErrorRules(rule)
                        }
                    } else {
                        enableButton.call($btnSubmitAll, event);
                    }
                } else {
                    enableButton.call($btnSubmitAll, event);
                }
            });


            that.$page.find('input').filter('[form = "formMap"]').on('change', function(){
                enableButton.call($btnSubmitMap)
            });
            that.$page.find('input').filter('[form = "formAvatar"]').on('change', function(){
                enableButton.call($btnSubmitAvatar)
            });
            that.$page.find('input').filter('[form = "formPassword"]').on('change', function(){
                enableButton.call($btnSubmitPassword)
            });

            // тоглер для кнопки save для карты в частности
            googleMapApi.google.maps.event.addListener(googleMapApi.map, 'center_changed', function(){
                enableButton.call($btnSubmitMap);
            });
            googleMapApi.google.maps.event.addListener(googleMapApi.map, 'zoom_changed', function(){
                enableButton.call($btnSubmitMap);
            });


            ///всплыватель отдельного окна браузера. (общая функция)
            function windowpop(url, width, height) {
                var leftPosition, topPosition;
                leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
                topPosition = (window.screen.height / 2) - ((height / 2) + 50);
                window.open(url, "Window2", "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
                return false;
            }


            // social control
            this.$page.find('#add_social').on('click', function(e){
                e.preventDefault();
                e.stopImmediatePropagation();
                var $that = $(this);
                var $socialConnect = that.$page.find('#social_connect').find('[data-social]');
                var $socialPublic = that.$page.find('#social_public').find('[data-social]');
                var arrSocialConnectName = _.map($socialConnect, function(social){
                    return $(social).attr('data-social');
                });
                var arrSocialPublicName = _.map($socialPublic, function(social){
                    return $(social).attr('data-social');
                });
                var template = that.$page.find('#add_social_template').text();

                var arr = _.difference(arrSocialPublicName, arrSocialConnectName); //ссылки нельзя одинамичить
                var hash = {};

                _.each(arr, function(name){
                    hash[name] = true;
                });

                var temp = _.template(template, {
                    names : hash
                });

                var options = {
                    container : $that,
                    content : temp,
                    html : true,
                    placement: 'top',
                    title : 'Select your social network',
                    trigger : 'focus',
                    template : '<div class="popover" role="tooltip"><div class="arrow"></div><h4 class="popover-title"></h4><div class="popover-content"></div></div>'
                };

                $that.popover('destroy');
                $that.popover(options);
                $that.popover('show');

                var isLink = !!e.target.href;

                if (isLink){
                    var href = e.target.href;
                    windowpop(href, 545, 433);
                }
            });


            // auto time zone
            function autoTimeZoneHandler(){
                var checked = $(this).prop('checked');

                if (checked){

                    require(['geolocation', 'timezone'], function(geolocation, timezone){

                        geolocation.getCurrentPosition(function( position ){
                            console.log(position);

                            var latitude = position.coords.latitude,
                                longitude = position.coords.longitude,
                                timestamp = parseInt(position.timestamp/100, 10), // special timestamp
                                callback = function(data){
                                    $timeZone.select2("val", data['timeZoneId']);
                                };

                            timezone(latitude, longitude, timestamp, callback);
                        });
                    });

                }
            }
            var $auto = this.$page.find('#ftdb_aclbundle_details_autotimezone');
            $auto.on('change', autoTimeZoneHandler);
            autoTimeZoneHandler.call($auto);
        }
    };
});