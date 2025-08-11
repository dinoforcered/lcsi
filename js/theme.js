/* Main Jquery File */
(function ($) {
    "use strict";
})
$(document).ready(function () {
    /*----------------------------------------------------*/
    // Preloader Calling 
    /*----------------------------------------------------*/
    $("body.onepage").queryLoader2({
        percentage: true
        , barHeight: 3
        , completeAnimation: "fade"
        , minimumTime: 200
    });
    /*----------------------------------------------------*/
    // Parallax Calling 
    /*----------------------------------------------------*/
    $(window).bind('load', function () {
        parallaxInit();
    });

    function parallaxInit() {
        testMobile = isMobile.any();
        if (testMobile == null) {
            $('.parallax .bg1').addClass("bg-fixed").parallax("50%", 0.5);
            $('.parallax .bg2').addClass("bg-fixed").parallax("50%", 0.5);
            $('.parallax .bg3').addClass("bg-fixed").parallax("50%", 0.5);
            $('.parallax .bg4').addClass("bg-fixed").parallax("50%", 0.5);
        }
    }
    parallaxInit();
    /*----------------------------------------------------*/
    // Superslides
    /*----------------------------------------------------*/
    $('#slides').superslides({
        play: 7000
        , animation: 'fade'
        , pagination: true
    });
    /*----------------------------------------------------*/
    // prettyPhoto
    /*----------------------------------------------------*/
    $("a[rel^='prettyPhoto']").prettyPhoto({
        animation_speed: 'normal'
        , theme: 'dark'
        , social_tools: false
        , allow_resize: true
        , default_width: 500
        , default_height: 344
    });
    /*----------------------------------------------------*/
    // Menu Smooth Scrolling
    /*----------------------------------------------------*/
    $(".navbar_ .nav a, .menu_bot a, .scroll-to").bind('click', function (event) {
        var headerH = $('#top1').outerHeight();
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top - headerH + 'px'
        }, {
            duration: 1200
            , easing: "easeInOutExpo"
        });
        event.preventDefault();
    });
    /*----------------------------------------------------*/
    // carouFredSel
    /*----------------------------------------------------*/
    $('#banner .carousel.main ul').carouFredSel({
        auto: {
            timeoutDuration: 8000
        }
        , responsive: true
        , prev: '.banner_prev'
        , next: '.banner_next'
        , width: '100%'
        , scroll: {
            items: 1
            , duration: 1000
            , easing: "easeOutExpo"
        }
        , items: {
            width: '500'
            , height: 'variable'
            , visible: {
                min: 1
                , max: 3
            }
        }
        , mousewheel: false
        , swipe: {
            onMouse: true
            , onTouch: true
        }
    });
    $(window).bind("resize", updateSizes_vat).bind("load", updateSizes_vat);

    function updateSizes_vat() {
        $('#banner .carousel.main ul').trigger("updateSizes");
    }
    updateSizes_vat();
});
$(window).load(function () {
    /*----------------------------------------------------*/
    // Load
    /*----------------------------------------------------*/
    $("#load").fadeOut(200, function () {
        $(this).remove();
    });
    /*----------------------------------------------------*/
    // Isotope 
    /*----------------------------------------------------*/
    var $container = $('#container');
    updateSize();
    $container.imagesLoaded(function () {
        $container.isotope({
            itemSelector: '.element'
            , layoutMode: 'fitRows'
            , transformsEnabled: true
            , columnWidth: function (containerWidth) {
                containerWidth = $browserWidth;
                return Math.floor(containerWidth / $cols);
            }
        });
    });
    $(window).smartresize(function () {
        updateSize();
        $container.isotope('reLayout');
    });

    function updateSize() {
        $browserWidth = $container.width();
        $cols = 3;
        if ($browserWidth >= 1170) {
            $cols = 3;
        }
        else if ($browserWidth >= 767 && $browserWidth < 1170) {
            $cols = 3;
        }
        else if ($browserWidth >= 480 && $browserWidth < 767) {
            $cols = 2;
        }
        else if ($browserWidth >= 0 && $browserWidth < 480) {
            $cols = 1;
        }
        $browserWidth = $browserWidth;
        $itemWidth = $browserWidth / $cols;
        $itemWidth = Math.floor($itemWidth);
        $(".element").each(function (index) {
            $(this).css({
                "width": $itemWidth + "px"
            });
        });
        var $optionSets = $('#options .option-set')
            , $optionLinks = $optionSets.find('a');
        $optionLinks.click(function () {
            var $this = $(this);
            if ($this.hasClass('selected')) {
                return false;
            }
            var $optionSet = $this.parents('.option-set');
            $optionSet.find('.selected').removeClass('selected');
            $this.addClass('selected');
            var options = {}
                , key = $optionSet.attr('data-option-key')
                , value = $this.attr('data-option-value');
            value = value === 'false' ? false : value;
            options[key] = value;
            if (key === 'layoutMode' && typeof changeLayoutMode === 'function') {
                changeLayoutMode($this, options)
            }
            else {
                $container.isotope(options);
            }
            return false;
        });
    };
});
/*----------------------------------------------------*/
/* Mobile Detect Function 
/*----------------------------------------------------*/
var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    }
    , BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    }
    , iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    }
    , Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    }
    , Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    }
    , any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/*----------------------------------------------------*/
/* Event Delegation 
/*----------------------------------------------------*/

// Slider
$(document).on('#slides_wrapper', '#slides', function (event, ui) {
}).on('#slides', '.slides-container', function (event, ui) {
});

// Menu 
$('.navbar').on('click', '.navbar-nav', function() {

    if ($('.navbar').is(':show')) {
        $('.navbar').stop().show().animate({left: 0}, 'slow');
    }
    else {
        $('.navbar').stop().animate({left: 0}, 'slow', function() {
            $('.navbar').show();
        });
    }
});

// Banner Carousel 
$('.carousel main').on('click', '.carousel', function () {
    alert("click");
});



