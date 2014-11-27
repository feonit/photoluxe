
photoSliderViewModules = [
    'underscore',
    'text!templates/photoSlider.html',
    'text!templates/photoSliderItem.html',
    'PhotoSliderBarView',
    'PhotographerModel'
];
photoSliderViewInit = function(_, photoSliderTemplate, photoSliderIemTemplate, PhotoSliderBarView, PhotographerModel)
{

    /*
     * Анимация слайдера jssor
     * */

     var _SlideshowTransitions = [
        //Fade in L
        {$Duration: 1200, $During: { $Left: [0.3, 0.7] }, $FlyDirection: 1, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade out R
        , { $Duration: 1200, $SlideOut: true, $FlyDirection: 2, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade in R
        , { $Duration: 1200, $During: { $Left: [0.3, 0.7] }, $FlyDirection: 2, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade out L
        , { $Duration: 1200, $SlideOut: true, $FlyDirection: 1, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }

        //Fade in T
        , { $Duration: 1200, $During: { $Top: [0.3, 0.7] }, $FlyDirection: 4, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade out B
        , { $Duration: 1200, $SlideOut: true, $FlyDirection: 8, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade in B
        , { $Duration: 1200, $During: { $Top: [0.3, 0.7] }, $FlyDirection: 8, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade out T
        , { $Duration: 1200, $SlideOut: true, $FlyDirection: 4, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }

        //Fade in LR
        , { $Duration: 1200, $Cols: 2, $During: { $Left: [0.3, 0.7] }, $FlyDirection: 1, $ChessMode: { $Column: 3 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade out LR
        , { $Duration: 1200, $Cols: 2, $SlideOut: true, $FlyDirection: 1, $ChessMode: { $Column: 3 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade in TB
        , { $Duration: 1200, $Rows: 2, $During: { $Top: [0.3, 0.7] }, $FlyDirection: 4, $ChessMode: { $Row: 12 }, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade out TB
        , { $Duration: 1200, $Rows: 2, $SlideOut: true, $FlyDirection: 4, $ChessMode: { $Row: 12 }, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }

        //Fade in LR Chess
        , { $Duration: 1200, $Cols: 2, $During: { $Top: [0.3, 0.7] }, $FlyDirection: 4, $ChessMode: { $Column: 12 }, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade out LR Chess
        , { $Duration: 1200, $Cols: 2, $SlideOut: true, $FlyDirection: 8, $ChessMode: { $Column: 12 }, $Easing: { $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade in TB Chess
        , { $Duration: 1200, $Rows: 2, $During: { $Left: [0.3, 0.7] }, $FlyDirection: 1, $ChessMode: { $Row: 3 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }
        //Fade out TB Chess
        , { $Duration: 1200, $Rows: 2, $SlideOut: true, $FlyDirection: 2, $ChessMode: { $Row: 3 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $Opacity: 2 }

        //Fade in Corners
        , { $Duration: 1200, $Cols: 2, $Rows: 2, $During: { $Left: [0.3, 0.7], $Top: [0.3, 0.7] }, $FlyDirection: 5, $ChessMode: { $Column: 3, $Row: 12 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $ScaleVertical: 0.3, $Opacity: 2 }
        //Fade out Corners
        , { $Duration: 1200, $Cols: 2, $Rows: 2, $During: { $Left: [0.3, 0.7], $Top: [0.3, 0.7] }, $SlideOut: true, $FlyDirection: 5, $ChessMode: { $Column: 3, $Row: 12 }, $Easing: { $Left: $JssorEasing$.$EaseInCubic, $Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $ScaleHorizontal: 0.3, $ScaleVertical: 0.3, $Opacity: 2 }

        //Fade Clip in H
        , { $Duration: 1200, $Delay: 20, $Clip: 3, $Assembly: 260, $Easing: { $Clip: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $Opacity: 2 }
        //Fade Clip out H
        , { $Duration: 1200, $Delay: 20, $Clip: 3, $SlideOut: true, $Assembly: 260, $Easing: { $Clip: $JssorEasing$.$EaseOutCubic, $Opacity: $JssorEasing$.$EaseLinear }, $Opacity: 2 }
        //Fade Clip in V
        , { $Duration: 1200, $Delay: 20, $Clip: 12, $Assembly: 260, $Easing: { $Clip: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear }, $Opacity: 2 }
        //Fade Clip out V
        , { $Duration: 1200, $Delay: 20, $Clip: 12, $SlideOut: true, $Assembly: 260, $Easing: { $Clip: $JssorEasing$.$EaseOutCubic, $Opacity: $JssorEasing$.$EaseLinear }, $Opacity: 2 }
    ];

    /*
     * Опции слайдера jssor
     * */
    var baseOptions = {

        $AutoPlay: false,                                   //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
        $AutoPlayInterval: 1500,                            //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
        $PauseOnHover: 3,                                //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, default value is 3
        $PlayOrientation: 1,

        $DragOrientation: 3,                                //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
        $ArrowKeyNavigation: true,   			            //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
        $SlideDuration: 500,                                //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
        //$ArrowNavigatorOptions: {                       //[Optional] Options to specify and enable arrow navigator or not

        $LazyLoading: 1,                                    //For image with lazy loading format (<IMG src2="url" .../>), by default it will be loaded only when the slide comes.But an integer value (maybe 1, 2 or 3) indicates that how far of nearby slides should be loaded immediately as well, default value is 1.
        $StartIndex: 0,                                     //Index of slide to display when initialize, default value is 0
        $FillMode: 1,
        //$Loop: false,                                       //Enable loop(circular) of carousel or not, default value is true

        //$SlideWidth: 500,
        //$SlideHeight: 500,

        $SlideshowOptions: {                                //[Optional] Options to specify and enable slideshow or not
            $Class: $JssorSlideshowRunner$,                 //[Required] Class to create instance of slideshow
            $Transitions: _SlideshowTransitions,            //[Required] An array of slideshow transitions to play slideshow
            $TransitionsOrder: 0,                           //[Optional] The way to choose transition to play slide, 1 Sequence, 0 Random
            $ShowLink: false                                    //[Optional] Whether to bring slide link on top of the slider when slideshow is running, default value is false
        },

        $ArrowNavigatorOptions: {                        //[Optional] Options to specify and enable arrow navigator or not
            $Class: $JssorArrowNavigator$,               //[Requried] Class to create arrow navigator instance
            $ChanceToShow: 2,                            //[Required] 0 Never, 1 Mouse Over, 2 Always
            $Scale: false                                // Scales arrow navigator or not while slider scale
        }

        /*            $ThumbnailNavigatorOptions: {                       //[Optional] Options to specify and enable thumbnail navigator or not
         $Class: $JssorThumbnailNavigator$,              //[Required] Class to create thumbnail navigator instance
         $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always

         $ActionMode: 1,                                 //[Optional] 0 None, 1 act by click, 2 act by mouse hover, 3 both, default value is 1
         $SpacingX: 1,                                   //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
         $DisplayPieces: 11,                             //[Optional] Number of pieces to display, default value is 1
         $ParkingPosition: 865                           //[Optional] The offset position to park thumbnail
         }*/

    };

    return Backbone.View.extend({

        users: {},
        photos: {},
        indexSlide: 0,
        jssorSlider: null,

        template: _.template(photoSliderTemplate),
        events: {
            'dblclick': 'close'
        },

        initialize: function( data ) {
            $(document).keydown(this.doEsc);
            if(data.model == undefined)
            {
                console.log('empty data.model');
                return;
            }
            else if(data.model.collection == undefined)
            {
                console.log('empty data.model.collection');
                return;
            }
            else if(data.model.collection.models == undefined)
            {
                console.log('empty data.model.collection.models');
                return;
            }
            this.users = _.map(data.model.collection.models, function( model ){
                return new PhotographerModel( { gid: model.get('user')['gid']} );
            });
            this.photos = data.model.collection.models;
            this.indexSlide = data.model.collection.indexOf(data.model);
            this.render();
        },

        /*
         * Добавить разметку слайдера
         * */

        render: function(){
            var that = this;
            var photoModel = this.photos[0];
            var id = this.$el.attr('id');
            var customOptions = {$StartIndex: this.indexSlide};
            var options = $.extend(baseOptions, customOptions);
            var jssorSlider;

            photoModel.set('slider_id', this.$el.attr('id'));

            this.$el.empty().html( this.template( photoModel.toJSON() ) );
            this.powerData( this.photos );



            /*hack for slider*/
            /*
             * Конструктор слайдера завязан на размерах, это плохо для масштабирования
             * @deprecated
             * */
            $('#' + id + ', .slides, .thumbnavigator, .tape').width($(window).width());
            $('#' + id + ', .slides').height($(window).width()/1.5);


            this.jssorSlider = new $JssorSlider$(id, options);

            this.scaleSlider(this.jssorSlider);

            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|BlackBerry|IEMobile)/)) {
                $(window).bind('resize', function(){
                    that.scaleSlider(that.jssorSlider);
                });
            }


            // самый ранний, но при двойном не работает как хотелось бы $EVT_SWIPE_START
            this.jssorSlider.$On($JssorSlider$.$EVT_PARK , function(slideIndex, fromIndex){

                var photoSliderBarView = new PhotoSliderBarView({
                    el: that.el,
                    models: {
                        user: that.users[slideIndex],
                        photo: that.photos[slideIndex]
                    }
                });
            });

            new PhotoSliderBarView({
                el: that.el,
                models: {
                    user: this.users[this.indexSlide],
                    photo: this.photos[this.indexSlide]
                }
            });

            this.$el.fadeIn();
        },

        /*
         * Добавить разметку фотограйи слайдера
         * */

        powerData : function ( photos ){
            var $slides = this.$el.find('#slide-container');

            var html = _.map( photos , function(dataPhoto){
                return _.template(photoSliderIemTemplate, dataPhoto.toJSON() );
            }, this).join('');

            $slides.append(html);
        },

        doEsc : function(eventObject) {
            if (eventObject.which === 27) {
                this.close();
            }
        },

        close: function(){
            var that = this;
            this.$el.fadeOut(function(){
                that.$el.empty();
            });
            this.deinitialize();
        },

        /*
         * Меняет размер, хреновое решение
         * @deprecated
         * */
        scaleSlider : function (jssorSlider){
            if ( !jssorSlider ) {
                return;
            }
            var that = this;
            var parentWidth = jssorSlider.$Elmt.parentNode.clientWidth;
            if (parentWidth)
                jssorSlider.$SetScaleWidth($(window).width());
            else {
                window.setTimeout(that.scaleSlider, 30);
            }
        },

        deinitialize: function(){
            var that = this;
            //$(document).off(this.doEsc, this);
            $(window).unbind('resize', function(){
                that.scaleSlider(that.jssorSlider);
            });
        }
    })
};

define(photoSliderViewModules, photoSliderViewInit);
