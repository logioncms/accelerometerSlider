/*
jquery.accelerometerSlider plugin v0.9.4
---
http://github.com/logioncms/accelerometerSlider
http://www.medienservice-ladewig.de/AccelerometerSlider
---
Copyright (c) 2013 Joerg Ladewig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
---
Enables accelerometer functionality for certain dom elements on accelerometer-equipped devices
Works as a responsive content slider
tested on different browsers (new and older)

Supports hardware accelerated transitions : -moz-transition, -webkit-transition, -o-transition, transition
---
toDO:
slide image on touchemove, mousemove
implement thumbnail preview
clean up messy code
*/
(function($) {
	"use strict"

    // here we go!
    $.accelerometerSlider = function(element, options) {

        // plugin's default options
        // this is private property and is  accessible only from inside the plugin
        var defaults = {

				on				: 'orientation',
				minGamma		: 25,
				resetGamma		: 15,
				sensibility		: 4,
				minTime			: 500,
				callback	    : null,
				images			: null,
				effect			: 'fade',
				effectDuration 	: 500,
				movePercent		: 20,
				responsive		: false,
				responsiveSpeed	: 200,
				responsiveWidth	: '',
				responsiveHeight: '',
				acceleration	: true,
				exclude			: '.slider-content'
		}

        // to avoid confusions, use "plugin" to reference the current instance of the object
        var plugin = this;
		
		// plugin data
		plugin.data;

        // this will hold the merged default, and user-provided options
        // plugin's properties will be available through this object like:
        // plugin.settings.propertyName from inside the plugin or
        // element.data('pluginName').settings.propertyName from outside the plugin, where "element" is the
        // element the plugin is attached to;
        plugin.settings = {}

        var $element = $(element),  // reference to the jQuery version of DOM element the plugin is attached to
             element = element;        // reference to the actual DOM element

        // the "constructor" method that gets called when the object is created
        plugin.init = function() {

            // the plugin's final properties are the merged default and user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);

			plugin.data  = {
				'inSwipe'		: false,
				'pos'			: 0,
				'lastAction'	: 0,
				'lastTime'		: 0,
				'eventHandler'	: null,
				'mouseDown'		: 0,
				'mouseUp'		: 0,
				'scrollY'		: 0,
				'use3D'			: true,
				'useComplex3D'	: true,
				'prefix'		: ''
			};
			
			// hardware 3d transition supported?
			plugin.data.prefix = has3DSupport();
			
			plugin.data.use3D = plugin.settings.acceleration && (plugin.data.prefix != 'no');
			plugin.data.useComplex3D  = navigator.userAgent.toLowerCase().indexOf('android')<0; // fix for some android browsers

			// get BackgroundColor of content container
			var bgc = getBackgroundColor($element);
			
			// initialize main container
			$element.css ({
				
				'position' : 'relative',
				'overflow' : 'hidden'
				
			});		
			
			var i = 0;
			
			$element.children().not(plugin.settings.exclude).each(function() {
				
				var elem 	= $(this);
				
				elem.css({
							'cursor' : 'move',
							'background-color' : bgc
						});
				
				if (i>0) {
					
					elem.css({
								'display' 	: 'none'
							});
				}								
												
				i++;
				
			});	
			
			// bin events on element and his childrens
			bindEvents();
			
        }

		/**
			counts the current child elements
		
			@function
			@description counts the current child elements
		*/	
		plugin.size = function ()
		{
			var children  = $element.children().not(plugin.settings.exclude);
			return children.length;			
		}

        // public methods
        // these methods can be called like:
        // plugin.methodName(arg1, arg2, ... argn) from inside the plugin or
        // element.data('pluginName').publicMethod(arg1, arg2, ... argn) from outside the plugin, where "element"
        // is the element the plugin is attached to;

		/**
			swipe to next image
		
			@function
			@description swipe to next image
			@param {float} [val] value
			@param {long} [val] actual time in milliseconds
		*/			
		plugin.swipe = function (gamma, time)
		{	
			// already swiping?
			if (plugin.data.inSwipe) return;
			
			plugin.data.inSwipe = true;
			
			var lastPos = plugin.data.pos;
			
			// calculate position of next container to display
			plugin.data.pos += gamma > 0 ? 1 : -1;
			
			var direction = gamma > 0 ? -1 : 1;
			
			var children  = $element.children().not(plugin.settings.exclude).get();
			var childsLen = children.length;
			
			plugin.data.pos = plugin.data.pos > childsLen-1 ? 0 : plugin.data.pos < 0 ? childsLen-1 : plugin.data.pos;
			
				
			var props;
			
			// current dom element (displayed) and next dom element
			var current 	= children[lastPos];
			var next 		= children[plugin.data.pos];
			
			var height		= $(current).outerHeight();
			var width		= $(current).outerWidth();
			
			// we have implement a "dom element loaded" event to set width and height correctly
			plugin.data.height		= $(next).outerHeight();
			plugin.data.width		= $(next).outerWidth();
			
//			plugin.data.dimension[plugin.data.pos].height = $(next).height();
//			plugin.data.dimension[plugin.data.pos].width  = $(next).width();
			
			
			// different swipe/tranistion/animation effects. need only one, but ...
			switch (plugin.settings.effect) {
				
				case 'fade' : 
				
							// set properties for tranistion or animation
							props = {
								
								current : {
											finish: { opacity:0 }
										},
								next: {
											start: { 'position' : 'absolute', 'top' : '0px', 'left' : '0px', opacity:0, 'width' : width+'px', 'height' : height+'px', 'display' : 'block' },
											finish: { opacity:1 }
										}
							};											
							
							// run transition or animation
							plugin.startSwipe({ current:current, next:next, props:props, accelerate:plugin.data.use3D });
				
						break;
	
				case 'slidein' : 
				
							// calculate and set properties for tranistion or animation
							var left = width*direction;
							
							props = {

								current : {
											start: { 'position' : 'relative', 'top' : '0px', 'left' : '0px', 'z-index' : '1'},
											finish: { 'left' : '0px' },
										},

								next: {
											start: { 'position' : 'absolute', 'top' : '0px', 'left' : left+'px', 'width' : width+'px', 'height' : height+'px', 'display': 'block', 'z-index' : '10'},
											finish: { 'left':'0px' },
											transform : 'translate3d('+(-left)+'px,0px,0px)'
										}
							};
							
							// run transition or animation
							plugin.startSwipe({ current:current, next:next, props:props, accelerate:plugin.data.use3D });
							
						break;
						
				case 'slideinout' : 
				
							// set properties for tranistion or animation
							
							props = {
								
								current : {
											start: { 'position' : 'relative', 'top' : '0px', 'left' : '0px' },
											finish: { 'left' : (width*direction*-1)+'px' },
											transform : 'translate3d('+(width*direction*-1)+'px,0,0)'
										},
								next: {
											start: { 'position' : 'absolute', 'top' : '0px', 'left' : (width*direction-3*direction)+'px', 'width' : width+'px', 'height' : height+'px', 'display' : 'block' },
											finish: { 'left':'0px' },
											transform : 'translate3d('+(width*direction*-1)+'px,0px,0px)'
										}
							};
							
							// run transition or animation
							plugin.startSwipe({ current:current, next:next, props:props, accelerate:plugin.data.use3D });
										
						break;
						
				case 'toss' : 	
				
							// calculate set properties for tranistion or animation
				
							var top  = $element.offset().top-$(window).scrollTop();
							var left = $element.offset().left-$(window).scrollLeft();
				
							var targetLeft = (left-width)*direction;
							var targetTop  = (top-height)*direction;
				
							props = {
								
								apply : true,
								current : {
											start: { 'position' : 'fixed',	'left' : left+'px',	'top' : top+'px', 'width':width+'px', 'height' : height+'px', 'opacity' : '1' },
											finish: { 'opacity' : '0', 'left':targetLeft+'px', 'top':targetTop+'px' },
											transform : 'translate3d('+targetLeft+'px'+','+targetTop+'px,0px)'
										},
								next: {
											start: { 'position' : 'static', 'left' : '0px', 'top' : '0px', 'opacity' : '0', 'display' : 'block' },
											finish: { 'opacity' : '1' },
											transform : 'translate3d(0px,0px,0px)'
										}
							};
							
							// run transition or animation
							plugin.startSwipe({ 'current':current, 'next':next, 'props':props, 'accelerate':plugin.data.use3D });	
				
						break;										
	
			}
	
			// store last gamma and last time swipe was performed
			plugin.data.lastAction = gamma;	
			plugin.data.lastTime   = time ? time : Date.now()
//			plugin.data.lastTime=time;
			
		}

		/**
			add a new element at [pos] or if [pos] not given - at actual position
		
			@function
			@description add a new element at [pos] or if [pos] not given - at actual position
			@param {dom element} the element to insert
			@param {integer} position
		*/	
		plugin.add = function (elem, pos)
		{
			var newPos = pos ? pos : plugin.data.pos;
			
			var bgc = getBackgroundColor($element);
			
			$(elem).css({
						'cursor' : 'move',
						'background-color' : bgc,
						'display' : 'none'
						
					}).addClass('last-inserted');
					
			$element.find(':nth-child(' + (newPos+1) + ')').after(elem).trigger('create');
			
			var $elem = $element.find(".last-inserted").removeClass('last-inserted');
			
			bindEvents($elem);
			
			if (typeof elem != 'img') { 
			
				if (!pos) plugin.swipe(1);
				
				return;
			}
			
			// its an image - so we have to wait until its fully loaded
			if ($elem.prop('complete')) {
				
				if (!pos) plugin.swipe(1);
				
			}
			else
				$elem.load(function() {  
		
						if (!pos) plugin.swipe(1);
							
			   });
		}

		/**
			swipe to previous position // external call
		
			@function
			@description swipe to previous position // external call
		*/		
		plugin.prev = function ()
		{
			plugin.swipe(-1);
		}

		/**
			swipe to next position // external call
		
			@function
			@description swipe to next position // external call
		*/		
		plugin.next = function ()
		{
			plugin.swipe(1);
		}

		/**
			start transition or javascript/jquery animation - depends on parameter accelerate
			toDo: clean up messy code
		
			@function
			@description start transition or javascript/jquery animation - depends on parameter accelerate
			@param {dom element} The Element to finish and clean up
			@param {dom element} The other Element to finish and clean up
			@param {object} css properties
			@param {boolean} true=use transition false=use javascript/jquery animation
			@param {boolean} duration of transition / animation
			@param {function} callback functions
		*/	
		plugin.startSwipe = function(options) 
		{
			// current, next, props, accelerate, speed
			var options =  $.extend({ // Default values
		
					current		: null,
					next		: null,
					props		: null,
					accelerate	: true,
					duration	: -1,
					callback	: null,
					
			}, options);
		
			var speed = options.duration >-1 ? options.duration : plugin.settings.effectDuration;
		
			var accelerate = options.accelerate && ((options.props.current && options.props.current.transform) || (options.props.next && options.props.next.transform));
			
			// use harware accelarated transitions
			if (accelerate) {
				
				// delete properties already set in "transform"
				if (options.props.current) delete options.props.current.finish.left;
				if (options.props.current) delete options.props.current.finish.top;
				if (options.props.next) delete options.props.next.finish.left;
				if (options.props.next) delete options.props.next.finish.top;
				
				var currentProps = options.props.apply ? options.props.current.finish : null;
				var nextProps = options.props.apply&&options.props.next ? options.props.next.finish : null;
				
				// prepare transition
				if (options.props.current && options.props.current.start) prepareTransition(options.current, options.props.current.start, options.duration);
				if (options.props.next && options.props.next.start) prepareTransition(options.next, options.props.next.start, options.duration);
				
				// start Transition
				if (options.props.current) startTransition(options.current, currentProps, options.props.current.transform);
				if (options.props.next) startTransition(options.next, nextProps, options.props.next.transform);
	
				// set on transition end
				if (options.duration<0 || options.callback!=null && !options.done) setTimeOut(options.current, options.next, options.callback);
				// durtation >0 meens user defined transition / end transition is set manually
				
			}
			// use javascript/jquery animation instead
			else {
				
				// prepare animation
				if (options.props.current && options.props.current.start) prepareAnimation(options.current, options.props.current.start);
				if (options.props.next && options.props.next.start) prepareAnimation(options.next, options.props.next.start);
				
				// start animation
				if (options.props.current) startAnimation(options.current, null, options.props.current.finish, options.duration);
				if (options.props.next) startAnimation(options.current, options.next, options.props.next.finish, options.duration);
				
			}
			
			return accelerate;
						
		}
	
		/**
			quick fix for responsive design
		
			@function
			@description quick fix for responsive design
			@param {dom element} the element to work with
			@width {integer} new width
			@height {integer} new height
			@speed {integer} duration of animation
		*/			
		plugin.responsive = function (elem, width, height, speed)
		{
			
			var props = {
				
					apply:true,
					
					current: {
								start: { 'position': 'relative', 'left':'0px', 'top':'0px' },
								finish: { 'width' : width+'px', 'height' : height+'px' },
								transform : 'translate3d(0px,0px,0px)'
							 }
							 
			};
			
			// run transition or animation
			var accelerated = plugin.startSwipe( { 'current': elem, 'props': props, 'accelerate' : plugin.data.use3D, 'duration': speed } );
			
			if (accelerated)
				$(elem).bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', 
				/*setTimeout(*/function() {
					
					var transition = {};
					transition[plugin.data.prefix+'transition-property'] = 'none';
					transition[plugin.data.prefix+'transition-duration'] = '';
					transition[plugin.data.prefix+'transition-timing-function'] = '';
					transition[plugin.data.prefix+'transform'] = '';
					
					$(elem).css(transition)
						   .css({
		
								'position' 	: 'static',
								'height' 	: plugin.settings.responsiveWidth,
								'width'  	: plugin.settings.responsiveHeight
								
							});
					
					$(elem).unbind ('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
					
					plugin.data.inSwipe=false;
				
					if (plugin.settings.callback!=null && typeof(plugin.settings.callback) === "function")
						plugin.settings.callback.call();
					
				})/*, speed+50)*/;
			
		}
	
		/**
			destroy plugin, final clean up and remove event handler
		
			@function
			@description destroy plugin, final clean up and remove event handler
		*/		
		plugin.destroy = function ()
		{			
			// unbind global event listener
			if (plugin.data.eventHandler) window.removeEventListener('devicemotion deviceorientation', plugin.data.eventHandler, true);
			
			// unbind events on childrens
			$elements.children().unbind('mousedown touchstart touchmove mouseup touchend');
			
		}
		

        // private methods
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)

		/**
			starts hardware accelerated transition on "elem" with css properties "props" and transform method "transform"
		
			@function
			@description starts hardware accelerated transition on "elem" with css properties "props" and transform method "transform"
			@param {dom element} The Element for transition
			@param {object} css properties
			@param {string} eg 'translate3d(0,0,0px)'
		*/
		var startTransition = function (elem, props, transform) {
			
			var target 		= $(elem);
			
			var transition  = {};
				transition[plugin.data.prefix+'transform'] =  transform;
					
			//set transition properties
			if (props!=null) target.css(props);		
			
			// start transition
			target.css( transition );
			
		}
		
		/**
			prepare hardware accelerated transition on "elem" with css properties "props"
		
			@function
			@description prepare hardware accelerated transition on "elem" with css properties "props"
			@param {dom element} The Element for transition
			@param {object} css properties
		*/
		var prepareTransition = function (elem, props, duration) {
					
			duration = duration >-1 ? duration : plugin.settings.effectDuration;
			
			var transition = {};
				transition[plugin.data.prefix+'transition-property'] = 'all';
				transition[plugin.data.prefix+'transition-duration'] = duration + 'ms';
				transition[plugin.data.prefix+'transition-timing-function'] = 'ease-in-out';
			
			var target = $(elem);
			
			if (props!=null) {
				target.css(props);
			}
	
			var cStyle = window.getComputedStyle(elem, null);
			for(var prop in props){
					target.css(prop, cStyle.getPropertyValue(prop));
			}
	
			 target.css( transition );		
		}
	
		/**
			prepare javascript/jquery animation on "elem" with css properties "props"
		
			@function
			@description prepare javascript/jquery animation on "elem" with css properties "props"
			@param {dom element} The Element for animation
			@param {object} css properties
		*/	
		var prepareAnimation = function (elem, props)
		{
			var target = $(elem);
			if (props!=null) {
				target.css(props);
			}
		}
		
		/**
			start javascript/jquery animation on "current" or "elem" with css properties "props"
		
			@function
			@description start javascript/jquery animation on "current" or "elem" with css properties "props"
			@param {dom element} The Element for animation
			@param {dom element} The other Element for animation
			@param {object} css properties
		*/		
		var startAnimation = function (current, elem, props, speed) {

			var target = elem != null ? $(elem) : $(current);
			
			var duration = speed >-1 ? speed : plugin.settings.effectDuration;

			//set animation properties
			target.animate(
								
					props
													
					, duration, function() {
						
							if (plugin.settings.responsive && (speed<0 && elem!=null)) {
								
							if (current!=null && elem!=null)
								$(current).css('display' , 'none' );
						
								plugin.responsive( target, 
								plugin.data.width, 
								plugin.data.height, 
								plugin.settings.responsiveSpeed);	
								
							}
								
							else {				
							
								if (speed>-1) return; // speed >-1 means user defined finish
							
								if (current!=null) 
									$(current).css(props).css('display', 'none');
							
								if (elem!=null)
									target.css(props).css('position', 'static');
						
								if (elem!=null && plugin.settings.responsive)
									target.css({
										
										'height' : plugin.settings.responsiveWidth,
										'width'  : plugin.settings.responsiveHeight						
								
								});
								
								// call callback method if exists
								if (plugin.settings.callback!=null && typeof(plugin.settings.callback) === "function") {
								
									plugin.settings.callback.call();
		
								}							
								
							}
		
							plugin.data.inSwipe=false;
	
					});
		}
		
		/**
			timeout function - get called after transition is done.
		
			@function
			@description timeout function - get called after transition is done.
			@param {dom element} The Element to finish and clean up
			@param {dom element} The other Element to finish and clean up
			@param {object} css properties
		*/		
		var setTimeOut = function (current, next, userDefinedCallback) {
			
			// user defined callback = experimental mini transition framework
			if (userDefinedCallback!=null) {
				
				var $elem = next !=null ? $(next) : $(current);
				
				$elem.bind ('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', userDefinedCallback);
				
			}
			else {
			
				$(next).bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', 
				
				/*var timeoutId = setTimeout(*/function() {
		
				var transition = {};
				
					transition[plugin.data.prefix+'transition-property'] = 'none';
					transition[plugin.data.prefix+'transition-duration'] = '';
					transition[plugin.data.prefix+'transition-timing-function'] = '';
					transition[plugin.data.prefix+'transform'] = '';
	
					
					if (current!=null)
						$(current).css(transition).css('display' , 'none' );
						
					$(next).css(transition).css( { 'position' : 'static' });
					
					if (plugin.settings.responsive) {
						plugin.responsive( next, 
											plugin.data.width, 
											plugin.data.height, 
											plugin.settings.responsiveSpeed );
											
					}
					else {
						
						$(next).unbind ('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
					
						if (plugin.settings.callback!=null && typeof(plugin.settings.callback) === "function")
							plugin.settings.callback.call();
							
						plugin.data.inSwipe=false;
					}
					
				}
				/*,plugin.settings.effectDuration*/);
			}
		}

		/**
			start plugin and bind event handler
		
			@function
			@description start plugin and bind event handler
		*/		
		var bindEvents = function (elem)
		{
			plugin.data.lastTime = Date.now();
			
			var children = elem ? elem : $element.children();
			
			children.each(function() {
				
					$(this)
					// bind events for mousedown and touchstars. mouseddown only for desktop support. is not needed for mobile devices
					.bind('mousedown touchstart', function(e) {
				
						if (e.originalEvent.touches) {
							plugin.data.mouseDown = e.originalEvent.touches[0].pageX;
							plugin.data.scrollY = e.originalEvent.touches[0].pageY;
						}
						else {
							plugin.data.mouseDown = e.pageX;
							plugin.data.scrollY = e.pageY;
							
							e.stopPropagation();
							
							return false;
						}
						
					})
					// bind event for touchmove. enables touch functionality on certain devices. not needed, but nice to have this too as a fallback
					.bind('touchmove', function(e) {
						
						plugin.data.mouseUp = e.originalEvent.touches[0].pageX;
						var scrollY = e.originalEvent.touches[0].pageY;
	
						if (Math.abs(plugin.data.mouseUp - plugin.data.mouseDown) > Math.abs(scrollY - plugin.data.scrollY)) {
							e.stopPropagation();
							return false;					
						}
						
					})
					// bind events for mouseup and touchend. mousedup only for desktop support. is not needed for mobile devices
					.bind('mouseup touchend', function(e) {
											
						if (!e.originalEvent.touches) plugin.data.mouseUp = e.pageX;
										
						var motion = plugin.data.mouseUp-plugin.data.mouseDown;
						
						var containerWidth = $element.outerWidth();
						var pixelWidth	   = plugin.settings.movePercent*containerWidth/100;
						
						if (Math.abs(motion)>pixelWidth) {
							
							plugin.swipe( motion, 0);
							
							e.preventDefault();
							
							return false;
							
						}
						
					})
					.bind('dragstart', function(event) { event.preventDefault(); });
			});
			
			//
			//	bind deviceorientation event listener	
			//
			
			if (plugin.settings.on == 'orientation' && !elem) {
			
				window.addEventListener('deviceorientation', plugin.data.eventHandler = function(event) {
					
						var gamma = event.gamma;
						
						var time = Date.now();
						
						// certain time elapsed since last swipe?
						if (time-plugin.data.lastTime<plugin.settings.minTime) return false;
						
						// gamma > options.resetGamma // device is in startposition?
						if (gamma>=-plugin.settings.resetGamma && gamma <= plugin.settings.resetGamma) plugin.data.lastAction=0;
						
						// gamma > options.resetGamma and gamma > or < as options.minGamma // user has done something with his device
						if (plugin.data.lastAction<=-plugin.settings.minGamma && gamma <=-plugin.settings.minGamma) return;
						if (plugin.data.lastAction>=plugin.settings.minGamma && gamma >=plugin.settings.minGamma) return;
						
						if (gamma>=plugin.settings.minGamma || gamma<=-plugin.settings.minGamma) {
							
							plugin.swipe(gamma, time);
							
						}
		
					return true;
		
				}, true);
			}
			else 
			if (plugin.settings.on == 'motion' && !elem) {
				window.ondevicemotion = function(coords) {
					
					var accX = coords.acceleration.x;
					
					var time = Date.now();
					
					// certain time elapsed since last swipe?
					if (time-plugin.settings.lastTime<plugin.settings.minTime) return false;
					
					// accX > options.sensibilty or < as options.sensibilty // user has done something with his device
					if (accX>=plugin.settings.sensibility || accX<=-plugin.settings.sensibility) {
						
						plugin.swipe(accX, time);
						
					}
				}			
			}
			
			return plugin.data;
		}

		/**
			Check for browser support of CSS3 transitions
		
			@function
			@description Check if this browser supports CSS3 transitions
			@return {string} browser prefix or "no" if not supported
		*/	
		var has3DSupport = function() {
			
				var browser = getBrowser();
			
				if (browser.msie && browser.version < 10) return 'no';
				if (browser.opera && browser.version < 15) return 'no';
			
				var test     = document.createElement("div"),
					prefixes = ["-webkit-", "-moz-", "-o-", ""],
					i        = prefixes.length,
					prefix;
				
				while (i--) {
					prefix = prefixes[i];
					try {
						test.style.cssText = prefix.toLowerCase() +
							"transform:translate3d(0,0,0);";
						if (typeof test.style[prefix + "transform"] != "undefined")
							return prefix;
					}
					catch (e)
						{ }
				}
				
				return 'no';		
		}
		
		/**
			returns the actual background color of a given jquery element
		
			@function
			@description returns the actual background color of a given element
			@return {string} background color
		*/		
		var getBackgroundColor = function (elem) {
		// Is current element's background color set?
			var color = elem.css("background-color");
			
			if (color.length==0) color=elem.css("background");
			
			if (color == 'rgba(0, 0, 0, 0)' || color=='transparent') color='';
			
			// if not: are you at the body element?
			if (color.length>0 || elem.is("body")) {
				// return known 'false' value
				return color;
			} else {
				// call getBackgroundColor with parent item
				return getBackgroundColor(elem.parent());
			}
		}
		
		/**
			@function
			@description replacement for newer JQuery Versions
		*/	
		var uaMatch = function( ua ) {
			ua = ua.toLowerCase();
		
			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];
		
			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		}
		
		/**
			@function
			@description replacement for newer JQuery Versions
		*/	
		var getBrowser = function () {
			
			var matched = uaMatch( navigator.userAgent );
			var browser = {};		
			
			if ( matched.browser ) {
				browser[ matched.browser ] = true;
				browser.version = matched.version;
			}
			
			// Chrome is Webkit, but Webkit is also Safari.
			if ( browser.chrome ) {
				browser.webkit = true;
			} else if ( browser.webkit ) {
				browser.safari = true;
			}		
			
			return browser;
		}

        // fire up the plugin!
        // call the "constructor" method
        plugin.init();

    }

    // add the plugin to the jQuery.fn object
    $.fn.accelerometerSlider = function(options) {

        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {

            // if plugin has not already been attached to the element
            if (undefined == $(this).data('accelerometerSlider')) {

                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $.accelerometerSlider(this, options);

                // in the jQuery version of the element
                // store a reference to the plugin object
                // you can later access the plugin and its methods and properties like
                // element.data('pluginName').publicMethod(arg1, arg2, ... argn) or
                // element.data('pluginName').settings.propertyName
                $(this).data('accelerometerSlider', plugin);

            }

        });

    }

})(jQuery);
