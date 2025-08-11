/*
 * QueryLoader v2 - A simple script to create a preloader for images
 * For instructions read the original post:
 * http://www.gayadesign.com/diy/queryloader2-preload-your-images-with-ease/
 */
(function ($) {
    (function (window) {
        'use strict';
        var docElem = document.documentElement;
        var bind = function () {};

        function getIEEvent(obj) {
            var event = window.event;
            // add event.target
            event.target = event.target || event.srcElement || obj;
            return event;
        }
        if (docElem.addEventListener) {
            bind = function (obj, type, fn) {
                obj.addEventListener(type, fn, false);
            };
        }
        else if (docElem.attachEvent) {
            bind = function (obj, type, fn) {
                obj[type + fn] = fn.handleEvent ? function () {
                    var event = getIEEvent(obj);
                    fn.handleEvent.call(fn, event);
                } : function () {
                    var event = getIEEvent(obj);
                    fn.call(obj, event);
                };
                obj.attachEvent("on" + type, obj[type + fn]);
            };
        }
        var unbind = function () {};
        if (docElem.removeEventListener) {
            unbind = function (obj, type, fn) {
                obj.removeEventListener(type, fn, false);
            };
        }
        else if (docElem.detachEvent) {
            unbind = function (obj, type, fn) {
                obj.detachEvent("on" + type, obj[type + fn]);
                try {
                    delete obj[type + fn];
                }
                catch (err) {
                    // can't delete window object properties
                    obj[type + fn] = undefined;
                }
            };
        }
        var eventie = {
            bind: bind
            , unbind: unbind
        };
        // ----- module definition ----- //
        if (typeof define === 'function' && define.amd) {
            // AMD
            define(eventie);
        }
        else if (typeof exports === 'object') {
            // CommonJS
            module.exports = eventie;
        }
        else {
            // browser global
            window.eventie = eventie;
        }
    })(this);
    (function () {
        'use strict';

        function EventEmitter() {}
        // Shortcuts to improve speed and size
        var proto = EventEmitter.prototype;
        var exports = this;
        var originalGlobalValue = exports.EventEmitter;

        function indexOfListener(listeners, listener) {
            var i = listeners.length;
            while (i--) {
                if (listeners[i].listener === listener) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * Alias a method while keeping the context correct, to allow for overwriting of target method.
         */
        function alias(name) {
            return function aliasClosure() {
                return this[name].apply(this, arguments);
            };
        }
        /**
         * Returns the listener array for the specified event.
         */
        proto.getListeners = function getListeners(evt) {
            var events = this._getEvents();
            var response;
            var key;
            if (evt instanceof RegExp) {
                response = {};
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        response[key] = events[key];
                    }
                }
            }
            else {
                response = events[evt] || (events[evt] = []);
            }
            return response;
        };
        proto.flattenListeners = function flattenListeners(listeners) {
            var flatListeners = [];
            var i;
            for (i = 0; i < listeners.length; i += 1) {
                flatListeners.push(listeners[i].listener);
            }
            return flatListeners;
        };
        proto.getListenersAsObject = function getListenersAsObject(evt) {
            var listeners = this.getListeners(evt);
            var response;
            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }
            return response || listeners;
        };
        proto.addListener = function addListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var listenerIsWrapped = typeof listener === 'object';
            var key;
            for (key in listeners) {
                if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                    listeners[key].push(listenerIsWrapped ? listener : {
                        listener: listener
                        , once: false
                    });
                }
            }
            return this;
        };
        proto.on = alias('addListener');
        proto.addOnceListener = function addOnceListener(evt, listener) {
            return this.addListener(evt, {
                listener: listener
                , once: true
            });
        };
        /**
         * Alias of addOnceListener.
         */
        proto.once = alias('addOnceListener');
        proto.defineEvent = function defineEvent(evt) {
            this.getListeners(evt);
            return this;
        };
        proto.defineEvents = function defineEvents(evts) {
            for (var i = 0; i < evts.length; i += 1) {
                this.defineEvent(evts[i]);
            }
            return this;
        };
        proto.removeListener = function removeListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var index;
            var key;
            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    index = indexOfListener(listeners[key], listener);
                    if (index !== -1) {
                        listeners[key].splice(index, 1);
                    }
                }
            }
            return this;
        };
        /**
         * Alias of removeListener
         */
        proto.off = alias('removeListener');
        proto.addListeners = function addListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(false, evt, listeners);
        };
        proto.removeListeners = function removeListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(true, evt, listeners);
        };
        proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
            var i;
            var value;
            var single = remove ? this.removeListener : this.addListener;
            var multiple = remove ? this.removeListeners : this.addListeners;
            // If evt is an object then pass each of it's properties to this method
            if (typeof evt === 'object' && !(evt instanceof RegExp)) {
                for (i in evt) {
                    if (evt.hasOwnProperty(i) && (value = evt[i])) {
                        // Pass the single listener straight through to the singular method
                        if (typeof value === 'function') {
                            single.call(this, i, value);
                        }
                        else {
                            // Otherwise pass back to the multiple function
                            multiple.call(this, i, value);
                        }
                    }
                }
            }
            else {
                i = listeners.length;
                while (i--) {
                    single.call(this, evt, listeners[i]);
                }
            }
            return this;
        };
        /**
         * Removes all listeners from a specified event.
         */
        proto.removeEvent = function removeEvent(evt) {
            var type = typeof evt;
            var events = this._getEvents();
            var key;
            // Remove different things depending on the state of evt
            if (type === 'string') {
                // Remove all listeners for the specified event
                delete events[evt];
            }
            else if (evt instanceof RegExp) {
                // Remove all events matching the regex.
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        delete events[key];
                    }
                }
            }
            else {
                // Remove all listeners in all events
                delete this._events;
            }
            return this;
        };
        /**
         * Alias of removeEvent.
         *
         * Added to mirror the node API.
         */
        proto.removeAllListeners = alias('removeEvent');
        /**
         * Emits an event of your choice.
         */
        proto.emitEvent = function emitEvent(evt, args) {
            var listeners = this.getListenersAsObject(evt);
            var listener;
            var i;
            var key;
            var response;
            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    i = listeners[key].length;
                    while (i--) {
                        listener = listeners[key][i];
                        if (listener.once === true) {
                            this.removeListener(evt, listener.listener);
                        }
                        response = listener.listener.apply(this, args || []);
                        if (response === this._getOnceReturnValue()) {
                            this.removeListener(evt, listener.listener);
                        }
                    }
                }
            }
            return this;
        };
        /**
         * Alias of emitEvent
         */
        proto.trigger = alias('emitEvent');
        proto.emit = function emit(evt) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.emitEvent(evt, args);
        };
        proto.setOnceReturnValue = function setOnceReturnValue(value) {
            this._onceReturnValue = value;
            return this;
        };
        proto._getOnceReturnValue = function _getOnceReturnValue() {
            if (this.hasOwnProperty('_onceReturnValue')) {
                return this._onceReturnValue;
            }
            else {
                return true;
            }
        };
        /**
         * Fetches the events object and creates one if required.
         */
        proto._getEvents = function _getEvents() {
            return this._events || (this._events = {});
        };
        /**
         * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
         */
        EventEmitter.noConflict = function noConflict() {
            exports.EventEmitter = originalGlobalValue;
            return EventEmitter;
        };
        // Expose the class either via AMD, CommonJS or the global object
        if (typeof define === 'function' && define.amd) {
            define(function () {
                return EventEmitter;
            });
        }
        else if (typeof module === 'object' && module.exports) {
            module.exports = EventEmitter;
        }
        else {
            this.EventEmitter = EventEmitter;
        }
    }.call(this));
    (function (window, factory) {
        'use strict';
        // universal module definition
        /*global define: false, module: false, require: false */
        if (typeof define === 'function' && define.amd) {
            // AMD
            define([
      'eventEmitter/EventEmitter'
      , 'eventie/eventie'
    ], function (EventEmitter, eventie) {
                return factory(window, EventEmitter, eventie);
            });
        }
        else if (typeof exports === 'object') {
            // CommonJS
            module.exports = factory(window, require('eventEmitter'), require('eventie'));
        }
        else {
            // browser global
            window.imagesLoaded = factory(window, window.EventEmitter, window.eventie);
        }
    })(this, // --------------------------  factory -------------------------- //
        function factory(window, EventEmitter, eventie) {
            'use strict';
            var $ = window.jQuery;
            var console = window.console;
            var hasConsole = typeof console !== 'undefined';
            // -------------------------- helpers -------------------------- //
            // extend objects
            function extend(a, b) {
                for (var prop in b) {
                    a[prop] = b[prop];
                }
                return a;
            }
            var objToString = Object.prototype.toString;

            function isArray(obj) {
                return objToString.call(obj) === '[object Array]';
            }
            // turn element or nodeList into an array
            function makeArray(obj) {
                var ary = [];
                if (isArray(obj)) {
                    // use object if already an array
                    ary = obj;
                }
                else if (typeof obj.length === 'number') {
                    // convert nodeList to array
                    for (var i = 0, len = obj.length; i < len; i++) {
                        ary.push(obj[i]);
                    }
                }
                else {
                    // array of single index
                    ary.push(obj);
                }
                return ary;
            }
            // -------------------------- imagesLoaded -------------------------- //
            /**
             * @param {Array, Element, NodeList, String} elem
             * @param {Object or Function} options - if function, use as callback
             * @param {Function} onAlways - callback function
             */
            function ImagesLoaded(elem, options, onAlways) {
                // coerce ImagesLoaded() without new, to be new ImagesLoaded()
                if (!(this instanceof ImagesLoaded)) {
                    return new ImagesLoaded(elem, options);
                }
                // use elem as selector string
                if (typeof elem === 'string') {
                    elem = document.querySelectorAll(elem);
                }
                this.elements = makeArray(elem);
                this.options = extend({}, this.options);
                if (typeof options === 'function') {
                    onAlways = options;
                }
                else {
                    extend(this.options, options);
                }
                if (onAlways) {
                    this.on('always', onAlways);
                }
                this.getImages();
                if ($) {
                    // add jQuery Deferred object
                    this.jqDeferred = new $.Deferred();
                }
                // HACK check async to allow time to bind listeners
                var _this = this;
                setTimeout(function () {
                    _this.check();
                });
            }
            ImagesLoaded.prototype = new EventEmitter();
            ImagesLoaded.prototype.options = {};
            ImagesLoaded.prototype.getImages = function () {
                this.images = [];
                // filter & find items if we have an item selector
                for (var i = 0, len = this.elements.length; i < len; i++) {
                    var elem = this.elements[i];
                    // filter siblings
                    if (elem.nodeName === 'IMG') {
                        this.addImage(elem);
                    }
                    // find children
                    var childElems = elem.querySelectorAll('img');
                    // concat childElems to filterFound array
                    for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                        var img = childElems[j];
                        this.addImage(img);
                    }
                }
            };
            /**
             * @param {Image} img
             */
            ImagesLoaded.prototype.addImage = function (img) {
                var loadingImage = new LoadingImage(img);
                this.images.push(loadingImage);
            };
            ImagesLoaded.prototype.check = function () {
                var _this = this;
                var checkedCount = 0;
                var length = this.images.length;
                this.hasAnyBroken = false;
                // complete if no images
                if (!length) {
                    this.complete();
                    return;
                }

                function onConfirm(image, message) {
                    if (_this.options.debug && hasConsole) {}
                    _this.progress(image);
                    checkedCount++;
                    if (checkedCount === length) {
                        _this.complete();
                    }
                    return true; // bind once
                }
                for (var i = 0; i < length; i++) {
                    var loadingImage = this.images[i];
                    loadingImage.on('confirm', onConfirm);
                    loadingImage.check();
                }
            };
            ImagesLoaded.prototype.progress = function (image) {
                this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
                // HACK - Chrome triggers event before object properties have changed. #83
                var _this = this;
                setTimeout(function () {
                    _this.emit('progress', _this, image);
                    if (_this.jqDeferred && _this.jqDeferred.notify) {
                        _this.jqDeferred.notify(_this, image);
                    }
                });
            };
            ImagesLoaded.prototype.complete = function () {
                var eventName = this.hasAnyBroken ? 'fail' : 'done';
                this.isComplete = true;
                var _this = this;
                // HACK - another setTimeout so that confirm happens after progress
                setTimeout(function () {
                    _this.emit(eventName, _this);
                    _this.emit('always', _this);
                    if (_this.jqDeferred) {
                        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
                        _this.jqDeferred[jqMethod](_this);
                    }
                });
            };
            // -------------------------- jquery -------------------------- //
            if ($) {
                $.fn.imagesLoaded = function (options, callback) {
                    var instance = new ImagesLoaded(this, options, callback);
                    return instance.jqDeferred.promise($(this));
                };
            }
            // --------------------------  -------------------------- //
            function LoadingImage(img) {
                this.img = img;
            }
            LoadingImage.prototype = new EventEmitter();
            LoadingImage.prototype.check = function () {
                // first check cached any previous images that have same src
                var resource = cache[this.img.src] || new Resource(this.img.src);
                if (resource.isConfirmed) {
                    this.confirm(resource.isLoaded, 'cached was confirmed');
                    return;
                }
                // If complete is true and browser supports natural sizes,
                // try to check for image status manually.
                if (this.img.complete && this.img.naturalWidth !== undefined) {
                    // report based on naturalWidth
                    this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                    return;
                }
                // If none of the checks above matched, simulate loading on detached element.
                var _this = this;
                resource.on('confirm', function (resrc, message) {
                    _this.confirm(resrc.isLoaded, message);
                    return true;
                });
                resource.check();
            };
            LoadingImage.prototype.confirm = function (isLoaded, message) {
                this.isLoaded = isLoaded;
                this.emit('confirm', this, message);
            };
            // -------------------------- Resource -------------------------- //
            // Resource checks each src, only once
            // separate class from LoadingImage to prevent memory leaks. See #115
            var cache = {};

            function Resource(src) {
                this.src = src;
                // add to cache
                cache[src] = this;
            }
            Resource.prototype = new EventEmitter();
            Resource.prototype.check = function () {
                // only trigger checking once
                if (this.isChecked) {
                    return;
                }
                // simulate loading on detached element
                var proxyImage = new Image();
                eventie.bind(proxyImage, 'load', this);
                eventie.bind(proxyImage, 'error', this);
                proxyImage.src = this.src;
                // set flag
                this.isChecked = true;
            };
            // ----- events ----- //
            // trigger specified handler for event type
            Resource.prototype.handleEvent = function (event) {
                var method = 'on' + event.type;
                if (this[method]) {
                    this[method](event);
                }
            };
            Resource.prototype.onload = function (event) {
                this.confirm(true, 'onload');
                this.unbindProxyEvents(event);
            };
            Resource.prototype.onerror = function (event) {
                this.confirm(false, 'onerror');
                this.unbindProxyEvents(event);
            };
            // ----- confirm ----- //
            Resource.prototype.confirm = function (isLoaded, message) {
                this.isConfirmed = true;
                this.isLoaded = isLoaded;
                this.emit('confirm', this, message);
            };
            Resource.prototype.unbindProxyEvents = function (event) {
                eventie.unbind(event.target, 'load', this);
                eventie.unbind(event.target, 'error', this);
            };
            // -----  ----- //
            return ImagesLoaded;
        });

    function OverlayLoader(parent) {
        this.parent = parent;
        this.container;
        this.loadbar;
        this.percentageContainer;
    };
    OverlayLoader.prototype.createOverlay = function () {
        //determine postion of overlay and set parent position
        var overlayPosition = "absolute";
        if (this.parent.element.tagName.toLowerCase() == "body") {
            overlayPosition = "fixed";
        }
        else {
            var pos = this.parent.$element.css("position");
            if (pos != "fixed" || pos != "absolute") {
                this.parent.$element.css("position", "relative");
            }
        }
        //create the overlay container
        this.container = $("<div id='" + this.parent.options.overlayId + "'></div>").css({
            width: "100%"
            , height: "100%"
            , backgroundColor: this.parent.options.backgroundColor
            , backgroundPosition: "fixed"
            , position: overlayPosition
            , zIndex: 666999, //very high!
            top: 0
            , left: 0
        }).appendTo(this.parent.$element);
        //create the loading bar
        this.loadbar = $("<div id='qLbar'></div>").css({
            height: this.parent.options.barHeight + "px"
            , marginTop: "-" + (this.parent.options.barHeight / 2) + "px"
            , backgroundColor: this.parent.options.barColor
            , width: "0%"
            , position: "absolute"
            , top: "50%"
        }).appendTo(this.container);
        //if percentage is on
        if (this.parent.options.percentage == true) {
            this.percentageContainer = $("<div id='qLpercentage'></div>").text("0%").css({
                height: "40px"
                , width: "100px"
                , position: "absolute"
                , fontSize: "3em"
                , top: "50%"
                , left: "50%"
                , marginTop: "-" + (59 + this.parent.options.barHeight) + "px"
                , textAlign: "center"
                , marginLeft: "-50px"
                , color: this.parent.options.barColor
            }).appendTo(this.container);
        }
        //if no images... destroy
        if (!this.parent.preloadContainer.toPreload.length || this.parent.alreadyLoaded == true) {
            this.parent.destroyContainers();
        }
    };
    OverlayLoader.prototype.updatePercentage = function (percentage) {
        this.loadbar.stop().animate({
            width: percentage + "%"
            , minWidth: percentage + "%"
        }, 200);
        //update textual percentage
        if (this.parent.options.percentage == true) {
            this.percentageContainer.text(Math.ceil(percentage) + "%");
        }
    };

    function PreloadContainer(parent) {
        this.toPreload = [];
        this.parent = parent;
        this.container;
    };
    PreloadContainer.prototype.create = function () {
        this.container = $("<div></div>").appendTo("body").css({
            display: "none"
            , width: 0
            , height: 0
            , overflow: "hidden"
        });
        //process the image queue
        this.processQueue();
    };
    PreloadContainer.prototype.processQueue = function () {
        //add background images for loading
        for (var i = 0; this.toPreload.length > i; i++) {
            if (!this.parent.destroyed) {
                this.preloadImage(this.toPreload[i]);
            }
        }
    };
    PreloadContainer.prototype.addImage = function (src) {
        this.toPreload.push(src);
    };
    PreloadContainer.prototype.preloadImage = function (url) {
        var image = new PreloadImage();
        image.addToPreloader(this, url);
        image.bindLoadEvent();
    };

    function PreloadImage(parent) {
        this.element;
        this.parent = parent;
    };
    PreloadImage.prototype.addToPreloader = function (preloader, url) {
        this.element = $("<img />").attr("src", url);
        this.element.appendTo(preloader.container);
        this.parent = preloader.parent;
    };
    PreloadImage.prototype.bindLoadEvent = function () {
        this.parent.imageCounter++;
        //binding
        this.element[0].ref = this;
        new imagesLoaded(this.element, function (e) {
            e.elements[0].ref.completeLoading();
        });
    };
    PreloadImage.prototype.completeLoading = function () {
        this.parent.imageDone++;
        var percentage = (this.parent.imageDone / this.parent.imageCounter) * 100;
        //update the percentage of the loader
        this.parent.overlayLoader.updatePercentage(percentage);
        //all images done!
        if (this.parent.imageDone == this.parent.imageCounter || percentage >= 100) {
            this.parent.endLoader();
        }
    };

    function QueryLoader2(element, options) {
        this.element = element;
        this.$element = $(element);
        this.options = options;
        this.foundUrls = [];
        this.destroyed = false;
        this.imageCounter = 0;
        this.imageDone = 0;
        this.alreadyLoaded = false;
        //create objects
        this.preloadContainer = new PreloadContainer(this);
        this.overlayLoader = new OverlayLoader(this);
        //The default options
        this.defaultOptions = {
            onComplete: function () {}
            , onLoadComplete: function () {}
            , backgroundColor: "#000"
            , barColor: "#fff"
            , overlayId: 'qLoverlay'
            , barHeight: 1
            , percentage: false
            , deepSearch: true
            , completeAnimation: "fade"
            , minimumTime: 500
        };
        //run the init
        this.init();
    };
    QueryLoader2.prototype.init = function () {
        this.options = $.extend({}, this.defaultOptions, this.options);
        var images = this.findImageInElement(this.element);
        if (this.options.deepSearch == true) {
            var elements = this.$element.find("*:not(script)");
            for (var i = 0; i < elements.length; i++) {
                this.findImageInElement(elements[i]);
            }
        }
        //create containers
        this.preloadContainer.create();
        this.overlayLoader.createOverlay();
    };
    QueryLoader2.prototype.findImageInElement = function (element) {
        var url = "";
        var obj = $(element);
        var type = "normal";
        if (obj.css("background-image") != "none") {
            //if object has background image
            url = obj.css("background-image");
            type = "background";
        }
        else if (typeof (obj.attr("src")) != "undefined" && element.nodeName.toLowerCase() == "img") {
            //if is img and has src
            url = obj.attr("src");
        }
        //skip if gradient
        if (!this.hasGradient(url)) {
            //remove unwanted chars
            url = this.stripUrl(url);
            //split urls
            var urls = url.split(", ");
            for (var i = 0; i < urls.length; i++) {
                if (this.validUrl(urls[i]) && this.urlIsNew(urls[i])) {
                    var extra = "";
                    if (this.isIE() || this.isOpera()) {
                        //filthy always no cache for IE, sorry peeps!
                        extra = "?rand=" + Math.random();
                        //add to preloader
                        this.preloadContainer.addImage(urls[i] + extra);
                    }
                    else {
                        if (type == "background") {
                            //add to preloader
                            this.preloadContainer.addImage(urls[i] + extra);
                        }
                        else {
                            var image = new PreloadImage(this);
                            image.element = obj;
                            image.bindLoadEvent();
                        }
                    }
                    //add image to found list
                    this.foundUrls.push(urls[i]);
                }
            }
        }
    };
    QueryLoader2.prototype.hasGradient = function (url) {
        if (url.indexOf("gradient") == -1) {
            return false;
        }
        else {
            return true;
        }
    };
    QueryLoader2.prototype.stripUrl = function (url) {
        url = url.replace(/url\(\"/g, "");
        url = url.replace(/url\(/g, "");
        url = url.replace(/\"\)/g, "");
        url = url.replace(/\)/g, "");
        return url;
    };
    QueryLoader2.prototype.isIE = function () {
        return navigator.userAgent.match(/msie/i);
    };
    QueryLoader2.prototype.isOpera = function () {
        return navigator.userAgent.match(/Opera/i);
    };
    QueryLoader2.prototype.validUrl = function (url) {
        if (url.length > 0 && !url.match(/^(data:)/i)) {
            return true;
        }
        else {
            return false;
        }
    };
    QueryLoader2.prototype.urlIsNew = function (url) {
        if (this.foundUrls.indexOf(url) == -1) {
            return true;
        }
        else {
            return false;
        }
    };
    QueryLoader2.prototype.destroyContainers = function () {
        this.destroyed = true;
        this.preloadContainer.container.remove();
        this.overlayLoader.container.remove();
    };
    QueryLoader2.prototype.endLoader = function () {
        this.destroyed = true;
        this.onLoadComplete();
    };
    QueryLoader2.prototype.onLoadComplete = function () {
        //fire the event before end animation
        this.options.onLoadComplete();
        if (this.options.completeAnimation == "grow") {
            var animationTime = this.options.minimumTime;
            this.overlayLoader.loadbar[0].parent = this; //put object in DOM element
            this.overlayLoader.loadbar.stop().animate({
                "width": "100%"
            }, animationTime, function () {
                $(this).animate({
                    top: "0%"
                    , width: "100%"
                    , height: "100%"
                }, 500, function () {
                    this.parent.overlayLoader.container[0].parent = this.parent; //once again...
                    this.parent.overlayLoader.container.fadeOut(500, function () {
                        this.parent.destroyContainers();
                        this.parent.options.onComplete();
                    });
                });
            });
        }
        else {
            var animationTime = this.options.minimumTime;
            this.overlayLoader.container[0].parent = this;
            this.overlayLoader.container.fadeOut(animationTime, function () {
                this.parent.destroyContainers();
                this.parent.options.onComplete();
            });
        }
    };
    //HERE COMES THE IE SHITSTORM
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/ ) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;
            for (; from < len; from++) {
                if (from in this && this[from] === elt) return from;
            }
            return -1;
        };
    }
    //function binder
    $.fn.queryLoader2 = function (options) {
        return this.each(function () {
            (new QueryLoader2(this, options));
        });
    };
})(jQuery);