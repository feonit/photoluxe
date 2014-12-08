/*
* Интерфейсы работы с сервером
*
* */

define(['jquery', 'app', 'options', 'backbone', 'statusLoad'], function($, app, options, noObj, statusLoad){

    return new function(){


        var origin = window.location.origin + options.Urls.baseUrl;

        $.ajaxSetup({cache: false});

        var nativeAjax = Backbone.ajax;

        Backbone.ajax = function(arguments){
            var that = this;

            statusLoad.start();

            return nativeAjax.call(that, arguments)
                .always(function(){
                    statusLoad.stop();
                });
        };

        this._namespace = "modules.transport.ajax";

        /**
        * Метод для подгрузки html разметки
        *
        * @param {String} path относительный адрес ресурса ( например /albums )
        * @param {Function} success Callback для данных
        * @param {Function} fail Callback на случай неудачного запроса
        * */
        this.getHtml = function(path, success, fail){

            if ('string' !== typeof path) {
                return Error('Bad request address')
            }
            if (success && 'function' !== typeof success){
                //return Error('Bad callback')
            }
            if (fail && 'function' !== typeof fail){
                //return Error('Bad callback')
            }

            // demo
            $('body').animate({opacity : '0.3'}, 100);
            statusLoad.start();


            var jqXHR = $.ajax({
                type : 'GET',
                url : '' + app.root + 'pages/' + path + '.html',
                dataType: 'html',
                statusCode: {
                    404: function() {
                        console.log( "status code 404" );
                    }
                }

            })
                .done(function( data, textStatus, jqXHR ){
                    if(success){
                        success(data);
                    }
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                    if(fail){
                        fail(textStatus + ' : ' + errorThrown);
                    }
                })
                .always(function(){
                    // demo
                    $('body').animate({opacity : '1'}, 100);
                    statusLoad.stop();

                });
            return jqXHR;
        };

        /**
         * Метод для подгрузки json данных
         *
         * @param {String} path относительный адрес ресурса
         * @param {Function} success Callback для данных
         * @param {Function} fail Callback на случай неудачного запроса
         * */
        this.getJSON = function(path, success, fail){
            //$('body').animate({opacity : '0.3'}, 100);
            statusLoad.start();

            var jqXHR = $.ajax({
                type : 'GET',
                url : app.root + path,
                dataType: 'json',
                statusCode: {
                    404: function() {
                        console.log( "status code 404" );
                    }
                }

            })
                .done(function( data, textStatus, jqXHR ){
                    if(success){
                        success(data);
                    }
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                    if(fail){
                        fail(textStatus + ' : ' + errorThrown);
                    }
                })
                .always(function(){
                    statusLoad.stop();

                    //$('body').animate({opacity : '1'}, 100);
                });
            return jqXHR;
        };

        /**
         * Метод для пингования разных типов сущностей
         * Дополнительно, влияет на отображение иконки, переключением класса "active"
         *
         * @param {Object} $icon    Управляемый объект
         * @param {String} action   Имя пинга (like, follower, favorite)
         * @param {String} type     Тип пингуемой сущности (photo, user)
         * @param {String} id       Идентификатор сущности
         *
         * */

         this.sendPing = function($icon, action, type, id){
             var that = this;
            // внутренний флаг
            this.sendPing.process = this.sendPing.process || false;

            if (this.sendPing.process){
                throw this.newErrorPing('Previous process is not ended');
            }
            $icon = $($icon);

            //предварительная хрень не получится, т.к. нужно дождаться актуального значения amount
            //можно доделать, если сохранять и использовать инфу о 'лайкнутости'
            //$icon.text( parseInt( $icon.text(), 10) + 1 );

            var url = _.template(options['Urls']['pings']['ft_ws_social_' + action], {
                type: type,
                id: id
            });

            this.sendPing.process = true;
            $.get(url)
                .done(function(res){
                    try {
                        if (res.errors && res.errors.length) {
                            throw that.newErrorPing(res.errors[0]);
                        } else {
                            $icon.text( res.data.amount );
                            res.data.flag ? $icon.addClass("active") : $icon.removeClass("active");
                        }
                    } catch (e) {
                        //$icon.text( parseInt( $icon.text(), 10) - 1 );
                        // передать исключение выше
                        throw (e);
                    } finally {
                        that.sendPing.process = false;
                    }
                })
                .fail(function(e){
                    throw e;
                })
                .always(function(){
                    that.sendPing.process = false;
                });
        };
        /**
         * Собственное исключение пинганатора
         * */
         this.newErrorPing = function (message){
            var e = new Error();
            e.name = 'pingError';
            e.message = message;
            return e;
        };

        /**
         * Отправка сириализивонной формы формы
         * */

        this.submitForm = function(url, data, done, fail){
            if (!url || !data){
                return void 0;
            }

            statusLoad.start();

            $.ajax( {
                url: url,
                type: 'POST',
                data: data
            })
                .done(function(res){
                    if (done){
                        done(res);
                    } else {
                        console.log('submit done');
                    }
                })
                .fail(function(){
                    if (fail){
                        fail();
                    } else {
                        console.log('submit was fail');
                    }
                })
                .always(function(){
                    statusLoad.stop();
                });
        };

        /**
         * Отправка формы HTML5
         * Мульти форма
         * */

        this.submitFormData = function(url, formData, done, fail){
            if (!url || !formData){
                return void 0;
            }

            statusLoad.start();

            $.ajax( {
                url: url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            })
                .done(function(res){
                    if (done){
                        done(res);
                    } else {
                        console.log('submit done');
                    }
                })
                .fail(function(){
                    if (fail){
                        fail();
                    } else {
                        console.log('submit was fail');
                    }
                })
                .always(function(){
                    statusLoad.stop();
                });
        };

        /**
         * Отправка формы HTML5
         * Обычная форма
         * */

        this.submitFormDataSimple = function(url, formData, done, fail){
            if (!url || !formData){
                return void 0;
            }

            statusLoad.start();

            $.ajax( {
                url: url,
                type: 'POST',
                data: formData,
                processData: false
            })
                .done(function(res){
                    if (done){
                        done(res);
                    } else {
                        console.log('submit done');
                    }
                })
                .fail(function(){
                    if (fail){
                        fail();
                    } else {
                        console.log('submit was fail');
                    }
                })
                .always(function(){
                    statusLoad.stop();
                });
        };


        this.getJSONP = function(url, done, fail){
            if (!url){
                return void 0;
            }

            statusLoad.start();

            $.ajax( {
                url: url,
                type: 'GET'
            })
                .done(function(res){
                    if (done){
                        done(res);
                    } else {
                        console.log('cors done');
                    }
                })
                .fail(function(){
                    if (fail){
                        fail();
                    } else {
                        console.log('cors was fail');
                    }
                })
                .always(function(){
                    statusLoad.stop();
                });
        }
      };
});
