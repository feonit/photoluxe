define(['lodash'], function(lodash){

    return new function(){

        /**
         * Функция человеческой сротировки строк дат и прочего для Array.prototype.sort Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
         * Author: Jim Palmer (based on chunking idea from Dave Koelle) https://github.com/overset/javascript-natural-sort
         */
        function naturalSort (a, b) {
            var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
                sre = /(^[ ]*|[ ]*$)/g,
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                i = function(s) { return naturalSort['insensitive'] && (''+s).toLowerCase() || ''+s },
            // convert all to strings strip whitespace
                x = i(a).replace(sre, '') || '',
                y = i(b).replace(sre, '') || '',
            // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
                xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
                yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD)
                if ( xD < yD ) return -1;
                else if ( xD > yD ) return 1;
            // natural sorting through split numeric strings and default strings
            for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                // handle numeric vs string comparison - number < string - (Kyle Adams)
                if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
                // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                else if (typeof oFxNcL !== typeof oFyNcL) {
                    oFxNcL += '';
                    oFyNcL += '';
                }
                if (oFxNcL < oFyNcL) return -1;
                if (oFxNcL > oFyNcL) return 1;
            }
            return 0;
        };

        this.naturalSort = naturalSort;

        /**
         * переключает cssClass у кнопок из жквери-коллекции elmArray
         * после переключения публикуется событие eventWord
         * внутрь которого прилетает ссылка на DOM - элемент по которому кликнули
         * */
        this.switchToggler = function (elmArray, cssClass, eventWord) {
            var eventObj = $();
            eventWord = '.' + eventWord || '';
            $(elmArray).off('click'+ eventWord);
            $(elmArray).on('click'+ eventWord, function(e){
                $(elmArray).removeClass(cssClass);
                $(e.currentTarget).addClass(cssClass);
                $(eventObj).triggerHandler(eventWord || 'beep', e.target);
            });
            //debugger;

            return eventObj;
        };

        /**
         * функции для кодирования и декодирования хешей
         * @type {{encode: "encode", decode: "decode"}}
         * encode - кодирует  (из объекта или массива в строку)
         * decode - декодирует (из строки в объект или массив)
         */
        this.hasher =  {
            "encode": function(source){
                /**
                 * на вход: source array Массив значений для преобразования в хеш-строку
                 * на выход: string  -  строка хеш
                 */
                return window.encodeURIComponent(
                    JSON.stringify(source)
                );
            },


            "decode": function(hash) {
                /*
                 * на вход: hash - string  Строка хеш
                 * на выход: сущность которую закодировали
                 */
                return JSON.parse(
                    window.decodeURIComponent(hash)
                );
            }

            /*
             var lala = hasher.encode(   ["1","2","3"]   );
             console.log( lala ); // => %5B%221%22%2C%222%22%2C%223%22%5D

             lala = hasher.decode(   lala   );
             console.log( lala );  // => ["1", "2", "3"]
             */
        };

        //убиватель текстовых нод
        this.removeTextNodes = function(element) {
            var el = element.firstChild,
                i = 0;
            do {
                if (el.nodeType === 3) {
                    if (i++) {
                        el = el.previousSibling;
                        el.nextSibling.remove();
                    } else {
                        el = el.nextSibling;
                        el.previousSibling.remove();
                    }
                }
            } while (el = el.nextSibling)
        };

        /**
         * Вернёт undefined если по данному ключу в объекте нет значения или нет пути,
         * или вернёт значение
         * Полезно чтобы не ломался функционал когда парсим полученные с сервера данные
         * @param obj Object в котором проверяем
         * @param namespace String в виде 'obj.key.key.key' параметр необязательный
         *                                                  Если параметр не задан, то вернёт содержимое @param obj
         * @returns {Object|*} значение по ключу, если @param obj не имеет ключа из @param namespace то вернётся последнее найденное значение
         * то есть в { lala: {lolo: 1} } по ключу lala.lolo.morkovka  вернёт 1
         */
        this.exists = function(obj, namespace) {
            //ключи по которым надо пройтись
            var tokens = (
                        namespace === undefined ? [false] : namespace.split('.')
                    ),
                tryAgain = function(prev, curr) {
                    return (typeof prev === "undefined" || prev === null || curr === false) ? prev : prev[curr];
                },
                context = obj;

            return tokens.reduce(tryAgain, context);
        };

        /**
         * Нужно пропарсить проблемные моменты,
         * связанные с невозможностью рекурсивной
         * установки дефолтных простых значений и объектов для модели
         * */

        this.setExtendRecursive = function( obj, objDefault ){

            for (var key in objDefault) {
                if ( key in obj ) {
                    if (_.isNull( obj[key] ) ){
                        obj[key] = objDefault[key] ? objDefault[key] : 'Unknow'

                    } else if (_.isObject( obj[key] ) ){
                        this.setExtendRecursive( obj[key], objDefault[key] )

                    } else if (_.isString( obj[key] )){
                        obj[key] = (obj[key] === '') ? objDefault[key] : obj[key];

                    } else if (_.isNumber( obj[key] )){
                        obj[key] = (obj[key] === 0) ? objDefault[key] : obj[key];

                    } else if (_.isBoolean( obj[key] )){
                        obj[key] = obj[key];

                    } else {
                        obj[key] = _.isEmpty(obj[key]) ? objDefault[key] : obj[key];
                    }
                } else {
                    obj[key] = _.clone( objDefault[key] )
                }
            }
            return obj;
            //return lodash.merge(obj, objDefault );
        };

        this.init = function(){
            this.name = 'helpers';
            return true;
        };
    };
});
