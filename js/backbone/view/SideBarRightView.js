define(['underscore',
    'text!templates/rightBar.html',
    'SideBar',
    'PhotoModel',
    'ajax',
    'googleMap',
    'options',
    // костылёк
    'json!'+ Urls.appConfigBaseUrl +'dict-category.json',
    'jquery.serialize-object'// без объекта
],
    function(_, rightBarTemplate, SideBar, PhotoModel, ajax, googleMap, options, dictCategory){



    return Backbone.View.extend({

        template: _.template(rightBarTemplate),

        photoModel: null,
        dataComments: null,

        editable: true,

        events: {
            'click .control-save-all': 'updateModel'
        },

        /*
        * Подготовить сайдбар
        * */

         initialize: function( data ) {
            this.photoGid = data.photoModel.get('gid');
            this.photoModel = data.photoModel;
            this.addCategories();
            this.interface = new SideBar('right');
            this.editable = ('editable' in data ) ? data.editable : this.editable;
            this.el = this.interface.box;
            this.$el = $(this.interface.box);
            this.readyPhotoData();
            return this;
        },

        /*
        * Отрисовать бар в DOM
        * */

         render: function(){

            this.interface.setHTML(_.template(rightBarTemplate,
                // подмешиваем настройки персонализации ( authorized )
                _.extend( this.photoModel.toJSON(), options.user, { 'gid': this.photoGid }, this.dataComments )
            ));
            this.interface.open();
            this.initEditMode( this.editable );
            googleMap.init({
                latitude: this.photoModel.get('latitude'),
                longitude: this.photoModel.get('longitude')
            });

            return this;
        },

        /*
        * Добавить подкатегорий и категорий к модели по справочнику
        * */
        // адаптер к макету, расширяет модель фотографии по справочнику
        // category_gid and subcategory_title
        // рекурсивний поиск по списку в 2 уровня

         addCategories : function(){
            var categoryGid = this.photoModel.get('category_gid'),
                subFlag = false,
                category =  [ { title : 'Unknown', gid : 'Unknown'}, { title : 'Unknown', gid : 'Unknown' } ];

            if (categoryGid){
                 _.find(dictCategory['categories'], function( item ){
                    if (item.gid !== categoryGid){
                        if (item['children'].length) {
                            return _.find( item['children'], function( childItem ){
                                if ( childItem.gid === categoryGid ){
                                    subFlag = true;
                                    category = [item, childItem];
                                    return true;
                                } else {
                                    return false;
                                }
                            })
                        } else {
                            return false;
                        }
                    } else {
                        category = item;
                        return true;
                    }
                });
            }

            subFlag
                //: this.photoModel.set( { subcategory_title : category.children[0].text, subcategory_gid : category.children[0].gid } )
                ? this.photoModel.set( { 'category_gid' : category[0].gid, category_title : category[0].text }) && this.photoModel.set( {'subcategory_title' : category[1].text, subcategory_gid : category[1].gid } )
                : this.photoModel.set( { 'category_gid' : category.gid, category_title : category.text }) && this.photoModel.set( { subcategory_title : 'none', subcategory_gid : 'none' } );
        },

        /*
        * Событие обновиления атрибутов фотографии
        * Сохранение изменений в модели
        * */

         updateModel: function (e) {
            e.preventDefault();
            var $form = this.$el.find('#album-info').find('#form_photo_edit');
            var formData = $form.serializeObject();

            // https://github.com/macek/jquery-serialize-object/issues/26
            // не поддерживает селекты
            // если не выбрана подкатегория, выбираем категорию только
            formData['category'] = $form.find('#subcategory option:selected').attr('data-gid')
                || $form.find('#category option:selected').attr('data-gid');

            this.photoModel.set(formData);
            this.interface.close();
        },


        /*
        * Когда поступят комментарии, рендерим бар
        * */

         readyPhotoData: function(){
            var that = this,
                urlComments = 'comments/threads/' + that.photoGid + '/comments.json?permalink=http://example.com';

            ajax.getJSON(urlComments, function(data){

                that.dataComments = {comments: adapterCommentsRestData( data )};
                that.render();
                that.initCommentForms();

                function adapterCommentsRestData( data ){
                    return _.map(data.comments, function(comment){
                        return {
                            body: comment['comment']['body'],
                            created_at: (comment['comment']['created_at']).slice(0, 10),
                            username: comment['comment']['author']['username'],
                            id: comment['comment']['id'],
                            childrens: _.map(comment['children'], function(children){
                                return {
                                    body: children['comment']['body'],
                                    created_at: (children['comment']['created_at']).slice(0, 10),
                                    username: children['comment']['author']['username']
                                }
                            })
                        }
                    })
                }
            });
        },

        /*
        * Проинициализировать формы для работы с комментариями
        * */

         initCommentForms : function(){
            var that = this,
                $formMessage = $('#new_message');

            // открытие закрытие replay
            $('.control-replay').on('click', toggleViewReplayFn);
            // отправка формы ответа на комментарий replay
            $('.control-send-answer').on('click', sendAnswerReplayFn);
            // отправка комментария
            $('.control-send-message').on('click', sendCommitFn);

            function toggleViewReplayFn (){
                $(this).parents('.item-messages').find('.answer-form').fadeToggle();
            }

            function sendAnswerReplayFn (event){
                var $formAnswer = $(this).parents('.item-messages').find('.answer-form');

                var gid = $formAnswer.find('[name = "gid"]').val();
                var parentId = $formAnswer.find('[name = "id"]').val();
                var url = options.Urls.baseUrl + 'comments/threads/' + gid +'/comments.json?parentId=' + parentId;
                var data = $formAnswer.serialize();

                var xhr = $.post(url, data)
                    .always(function(){
                        var location = xhr.getResponseHeader('location');
                        that.readyPhotoData(null, location + '.json');
                    });
                $formAnswer.find("input[type=text], textarea").val("");
                event.preventDefault();
                event.stopImmediatePropagation();
            }

            function sendCommitFn (event){
                var gid = $formMessage.find('[name = "gid"]').val();
                var url = options.Urls.baseUrl + 'comments/threads/' + gid +'/comments.json';
                var data = $formMessage.serialize();

                var xhr = $.post(url, data)
                    .always(function(){
                        var location = xhr.getResponseHeader('location');
                        that.readyPhotoData(null, location + '.json');
                    });
                $formMessage.find("input[type=text], textarea").val("");
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        },


        /*
        * Включить режим редактирования для контролов
        * (для вкладки инфо)
        * */

         initEditMode : function( editable ){
            editable = (typeof editable !== "undefined") ? editable : true;

            if (editable) {
                this._initEditDescription();
                this._initEditCategories();
            } else {
                this.$el.find('#album-info').find('input, textarea, select').attr('disabled', 'disabled')
            }
            this._initEditTags();
            this._initEditLocal();
        },

        // обработка описания
        _initEditDescription : function(){
            var $controlEditText =  this.$el.find('.control-btn-edit-text'),
                $textArea = this.$el.find('textarea');

            function saveChangesFn(){
                $controlEditText.show();
            }

            function _initSizeFn(event){
                var $elem = $(event.target);
                var text = $elem.val(),
                // look for any "\n" occurences
                    matches = text.match(/\n/g),
                    breaks = matches ? matches.length : 2;

                $elem.attr('rows',breaks + 2);
            }

            function editTextFn(event){
                $controlEditText.hide();
            }

            $controlEditText.on('click', function(){
                editTextFn();
                $textArea.focus();
            });

            //$btn.on('click', saveChangesFn);
            $textArea.on('focusout', saveChangesFn);
            $textArea.on('focus', editTextFn);
            $textArea.on('change', _initSizeFn);
        },

        // Обработка категорий
        _initEditCategories : function(){
            var $category =  this.$el.find('#category'),
                $subcategory =  this.$el.find('#subcategory');

            function initSelectData(data, $select){
                //$select.empty();
                var activeItem = $select.children().first().text();
                _.each(data, function( elem ){
                    if ( activeItem === elem.name ){
                        return;
                    }
                    $('<option>').attr({
                        'data-gid': elem.gid
                    }).text(elem.text).appendTo($select);
                });
            }

            var categories = dictCategory['categories'];
            initSelectData(categories, $category);
            $category.on('change', function(){
                var newCategoryName = $category.val();
                _.each(categories, function(category){
                    if ( newCategoryName === category['text'] ){
                        $subcategory.empty();
                        initSelectData(category['children'], $subcategory)
                    }
                });
            });
        },

        // обработка тегов
        _initEditTags : function(){
            var $fieldTags =  this.$el.find('.field-tags'),
                $btnEdit = $fieldTags.find('.edit-tags'),
                $input = $fieldTags.find('.input-tags'),
                $allTags = $fieldTags.find('.tags'),
                separator = ', ',
                $hashClone = $('<p class="hash-btn"></p>'),
                $hashInputClone = $('<input type="hidden" value="">');

            function editTagsFn(event){
                event.preventDefault();

                $allTags.attr('style', 'opacity:0');
                $btnEdit.hide();

                $input.val(_allHashToString());
            }
            function saveTagsChangesFn(event){
                event.preventDefault();
                $allTags.empty();
                $allTags.html(_stringToHashList());

                $allTags.attr('style', 'opacity:1');

                $btnEdit.show();
            }
            function _allHashToString(){
                return $allTags.find('.hash-btn').map(function(index, elem){
                    return $(elem).text();
                }).toArray().join(separator);
            }

            function _stringToHashList(){
                var tagsList = $input.val().split(separator);

                $(tagsList).each(function(index, item){
                    $allTags.append($hashClone.clone().text(item));
                    $allTags.append($hashInputClone.clone().attr('name', 'tags[' + index +']').val(item));
                });
            }

            $btnEdit.on('click', editTagsFn);
            $input.on('focus', editTagsFn);
            $input.on('focusout', saveTagsChangesFn);
        },

        // редактирование локального месторасположения
        _initEditLocal : function(){
            var $fieldLocation =  this.$el.find('.field-location');
            var $controlEdit = $fieldLocation.find('.control-edit');
            var $input = $fieldLocation.find('.control-location');

            function editClickFn (event){
                event.preventDefault();
                $controlEdit.hide();
            }
            function stopEditEventFn(event){
                event.preventDefault();
                $controlEdit.show();
            }
            $controlEdit.on('click', editClickFn);
            $input.on('focusin', editClickFn);
            $input.on('focusout', stopEditEventFn);
        }
    })
});