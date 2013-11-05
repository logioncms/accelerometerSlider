AccelerometerSlider Version 0.9.7
=================================

A JQuery lightweight (3k zipped) Image / Content Slider with enabled accelerometer functionality and device orientation / device motion detection on accelerometer-equipped devices.

Just turn your Smartphone to the left or right side / or shake your smartphone if "on motion" is set.

Best used on touch devices - but works on desktop computers too.

Works in your existing responsive environment out of the box. You don't need to implement additional css - except of your own.

<a href="http://www.medienservice-ladewig.de/AccelerometerSlider">jQuery Plugin Homepage</a>

-------------------------
Additional functionality:
-------------------------

Detects single finger swipes and falls back to mouse 'drags' on the desktop.

Responsive Design ready (was a goal)

Works in your existing responsive environment out of the box.

Supports hardware accelerated transitions : -moz-transition, -webkit-transition, -o-transition, transition and falls back to Javascript CSS Animation if HW acceleration is not supported. So it works on older Browsers.

Experimental feature:
can be used as a lightweight content animator

--------
Example
--------
	<div id="slider">      	
        <img border="0" alt="" src="image-1.jpg" width="350" height="194">
        <img border="0" alt="" src="image-2.jpg" width="350" height="194">
        <img border="0" alt="" src="image-3.jpg" width="350" height="194">
        <img border="0" alt="" src="image-4.jpg" width="350" height="194">
        <div>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.
        </div>
        <div>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </div>                                
        <div class="slider-content">
        	<h3>your title</h3>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.
        </div>
	</div>
	
$('#slider').accelerometerSlider( { options } );

Where "#slider" is your content container. Every element in this container will be added to the slider. Except elements with class "slider-content" - or elements marked in your slider configuration.

-----------
Online Demo
-----------
devicemotion and deviceorientation will only work on accelerometer equipped devices (mobile)

<a href="http://www.medienservice-ladewig.de/demo/demo1.htm">demo #1</a> | 
<a href="http://www.medienservice-ladewig.de/demo/demo2.htm">demo #2</a> | 
<a href="http://www.medienservice-ladewig.de/demo/demo3.htm">demo #3 for responsive webdesign</a> | 
<a href="http://www.medienservice-ladewig.de/demo/demo4.htm">demo #4 for responsive webdesign</a> |
<a href="http://www.medienservice-ladewig.de/demo/demo5.htm">instance methods #5</a>

<a href="http://www.medienservice-ladewig.de/AccelerometerSlider">Plugin Homepage</a>


Simple Demonstration files are included in download file

-------
Options
-------
on	: 'orientation', 'motion' or 'none', // default = orientation

orientation	: 'west' or 'north' // default = west. turn your smartphone left/right (west) or up/down (north)

minGamma : 25 // min. movement of device (on device orientation) before slide starts

resetGamma : 15

sensibility	: 4 // sensibility of device movement (on device motion)

minTime	: 500 // min. time before next slide can start

callback : null // callback function after slide

effect : 'fade' // slide effect - 'fade', 'slidein', 'slideinout' or 'toss'

effectDuration : 500 // duration of effect (transition or animation)

movePercent	: 20 // min. finger movement on touchmove before slide starts - in percent

responsive : false or true // full responsive functionality

responsiveSpeed	: 200 // responsive speed

responsiveWidth	: '' // width will be set after slide - eq. 'auto' (you dont need to set this)

responsiveHeight: '' // height will be set after slide - eq. 'auto'  (you dont need to set this)

acceleration : true // hardware acceleration (css transition) will be used - if device supports it

exclude : '.slider-content' // slider content container to exclude from slide

----------------
Instance Methods
----------------
$('#slider').data('accelerometerSlider').next();

$('#slider').data('accelerometerSlider').prev();

var size = $('#slider').data('accelerometerSlider').add(dom element);

var size = $('#slider').data('accelerometerSlider').remove();

var position = $('#slider').data('accelerometerSlider').position();

var dom_element = $('#slider').data('accelerometerSlider').current();

var size = $('#slider').data('accelerometerSlider').size();

$('#slider').data('accelerometerSlider').destroy();

$('#slider').data('accelerometerSlider').startSwipe ( { options } )

$('#slider').data('accelerometerSlider').responsive ( dom element, width, height, duration )

---------------
Version History
---------------
<b>0.9.7</b> added possibility to turn smartphone north and south. not just west and east

<b>0.9.6</b> added public methods (position, current), tweaks

<b>0.9.5</b> added public method (remove), tweaks, minor bugfixes

<b>0.9.4</b> added public methods (prev, next, add, size)

<b>0.9.3</b> minor bugfixes

<b>0.9.2</b> first release
