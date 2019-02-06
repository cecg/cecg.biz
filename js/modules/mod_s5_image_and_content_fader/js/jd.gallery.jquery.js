/*
    This file is part of JonDesign's SmoothGallery v2.1beta1.

    JonDesign's SmoothGallery is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    JonDesign's SmoothGallery is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JonDesign's SmoothGallery; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

    Main Developer: Jonathan Schemoul (JonDesign: http://www.jondesign.net/)
    Contributed code by:
    - Christian Ehret (bugfix)
	- Nitrix (bugfix)
	- Valerio from Mad4Milk for his great help with the carousel scrolling and many other things.
	- Archie Cowan for helping me find a bugfix on carousel inner width problem.
	- Tomocchino from #mootools for the preloader class
	Many thanks to:
	- The mootools team for the great mootools lib, and it's help and support throughout the project.
	- Harald Kirschner (digitarald: http://digitarald.de/) for all his great libs. Some used here as plugins.
*/

/* some quirks to circumvent broken stuff in mt1.2 */

Array.prototype.from=function (item){
	if (item == null) return [];
	return (typeof(item) == 'array') ? item :   [item];
};
$A=function (i){return Array.prototype.from(i).slice();};
Array.prototype.extend=function (a){this.push.apply(this,a);return this}
if(Function.prototype.passx==undefined){
	Function.prototype.passx=function (args, bind){
		var self = this;
		if (args != null) args = Array.prototype.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	};
}
Function.prototype.chain=function(f){f();return window.chainjdgallery;}
window.chainjdgallery=function(){};


if(undefined == Function.prototype.bind){
	Function.prototype.bind=function(that){
		var self = this,
			args = arguments.length > 1 ? Array.slice(arguments, 1) : null,
			F = function(){};

		var bound = function(){
			var context = that, length = arguments.length;
			if (this instanceof bound){
				F.prototype = self.prototype;
				context = new F;
			}
			var result = (!args && !length)
				? self.call(context)
				: self.apply(context, args && length ? args.concat(Array.slice(arguments)) : args || arguments);
			return context == that ? result : context;
		};
		return bound;
	}
};
Function.prototype.periodical=function (c,b,a){return setInterval(this.passx((a==null?[]:a),b),c);};

$defined=function (i){return(i!=null);};
$clear=function (i){clearTimeout(i);clearInterval(i);return null;};
Function.prototype.delay=function (b,c,a){return setTimeout(this.passx(a,c),b)}

function morphx(elm,opts){
	this.element=elm;
	this.complete=function(){};
	this.options={easing:'linear',duration:1000,complete:this.complete,queue:false};
	if(opts) this.options=jQuery.extend(this.options,opts);
}
morphx.prototype.data=function(){
	if(arguments.length==1)
		return this.element.data(arguments[0]);
	else if(arguments.length==2)
		return this.element.data(arguments[0], arguments[0]);
}
morphx.prototype.start=function(obj,opts){
	//this.element.stop();
	if(opts)this.options=jQuery.extend(this.options,opts);
	this.element.animate(obj, this.options);
	return this;
}
morphx.prototype.stop=function(){
	this.element.stop();
}
morphx.prototype.cancel=function(){
	this.element.stop();
}
morphx.prototype.chain=Function.prototype.chain;
morphx.prototype.completefunc=function(f){
	var old=this.options.complete;
	this.options.complete=function(){old();f();}.bind(this);
	return this;
}
morphx.prototype.clearChain=function(){
	window.morphxchain=function(){};
}
morphx.prototype.css=function(obj){
	this.element.css(obj);
	return this;
}

var s5_dropdowntext2 = s5_dropdowntext;

(function($){
	var Scroller = function(element, options){

	this.options= {
		area: 20,
		velocity: 1,
		onChange: function(x, y){
			//console.log(x,y);
			this.element.scrollTo(x, y);
		}.bind(this),
		fps: 50
		
	};
	this.element=null;
	this.docBody=null;
	this.listener=null;
	this.timer=null;
	this.bound={};
	this.initialize(element, options);
}

	Scroller.prototype.initialize= function(element, options){
		this.options=$.extend(this.options,options);
		this.element = element[0];
		this.docBody = $('body')[0];
		if(this.element.nodeType!=1){
			this.listener =  this.docBody ;
			$(this.listener).attr('tag','body');
		}else{
			this.listener = this.element;
			$(this.listener).attr('tag','elm');
		}
		
		this.timer = null;
		this.bound = {
			attach: this.attach.bind(this),
			detach: this.detach.bind(this),
			getCoords: this.getCoords.bind(this)
		};
	};

	Scroller.prototype.start= function(){
		$(this.listener).bind('mouseover', this.bound.attach);
			$(this.listener).bind('mouseleave', this.bound.detach);
		return this;
	};

	Scroller.prototype.stop= function(){
		$(this.listener).unbind('mouseover');
		$(this.listener).unbind('mouseleave');	
		this.detach();
		this.timer = clearInterval(this.timer);
		return this;
	};

	Scroller.prototype.attach= function(){
		$(this.listener).bind('mousemove', this.bound.getCoords);
	};

	Scroller.prototype.detach= function(){
		$(this.listener).unbind('mousemove');
		this.timer = clearInterval(this.timer);
	},

	Scroller.prototype.getCoords= function(event){
		event.client={x:event.clientX,y:event.clientY};
		event.page={x:event.pageX,y:event.pageY};
		this.page = ($(this.listener).attr('tag') == 'body') ? event.client : event.page;
		if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
	},

	Scroller.prototype.scroll= function(){
		var size = {x:$(this.element).width(),y:$(this.element).height()},
			scroll = {x:$(this.element).scrollLeft(),y:$(this.element).scrollTop()},
			pos = this.element != this.docBody ? {x:$(this.element).offset().left,y:$(this.element).offset().top} : {x: 0, y:0},
			scrollSize = {x:$(this.element).children(0).width(),y: $(this.element).children(0).height()},
			change = {x: 0, y: 0},
			top = this.options.area.top || this.options.area,
			bottom = this.options.area.bottom || this.options.area;
		for (var z in this.page){
			if (this.page[z] < (top + pos[z]) && scroll[z] != 0){
				change[z] = (this.page[z] - top - pos[z]) * this.options.velocity;
			} else if (this.page[z] + bottom > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z]){
				change[z] = (this.page[z] - size[z] + bottom - pos[z]) * this.options.velocity;
			}
			change[z] = change[z].round();
		}
		if (change.y || change.x) this.options.onChange(scroll.x + change.x, scroll.y + change.y);
	}


// declaring the class
var gallery =window.gallery= function(element, options) {
	this.options= {
		embedLinks: true,
		fadeDuration: 500,
		timed: false,
		preloader: true,
		preloaderImage: true,
		preloaderErrorImage: true,
		/* Data retrieval */
		manualData: null,
		populateFrom: false,
		populateData: true,
		destroyAfterPopulate: true,
		elementSelector: "div.imageElement",
		titleSelector: "h3",
		subtitleSelector: "p",
		linkSelector: "a.open",
		imageSelector: "img.full",
		thumbnailSelector: "img.thumbnail",
		defaultTransition: "fade",
		/* InfoPane options */
		slideInfoZoneOpacity: 0.7,
		slideInfoZoneSlide: true,
		/* Carousel options */
		carouselMinimizedOpacity: 0.4,
		carouselMinimizedHeight: 20,
		carouselMaximizedOpacity: 0.9,
		thumbHeight: 75,
		thumbWidth: 100,
		thumbSpacing: 10,
		thumbIdleOpacity: 0.2,
		textShowCarousel: s5_dropdowntext2,
		showCarouselLabel: true,
		thumbCloseCarousel: true,
		useThumbGenerator: false,
		thumbGenerator: 'resizer.php',
		useExternalCarousel: false,
		carouselElement: false,
		carouselHorizontal: true,
		activateCarouselScroller: true,
		carouselPreloader: true,
		textPreloadingCarousel: 'Loading...',
		/* CSS Classes */
		baseClass: 'jdGallery',
		withArrowsClass: 'withArrows',
		/* Plugins: HistoryManager */
		useHistoryManager: false,
		customHistoryKey: false,
		/* Plugins: ReMooz */
		useReMooz: false
	};

	this.initialize(element, options);
	
}
	gallery.prototype.initialize= function(element, options) {
		this.options=$.extend(this.options, options);
		$(this).trigger('onInit');
		this.currentIter = 0;
		this.lastIter = 0;
		this.maxIter = 0;
		this.galleryElement = element;
		this.galleryData = this.options.manualData;
		this.galleryInit = 1;
		this.galleryElements = Array();
		this.thumbnailElements = Array();
		$(this.galleryElement).addClass(this.options.baseClass);
		
		if (this.options.useReMooz&&(this.options.defaultTransition=="fade"))
			this.options.defaultTransition="crossfade";
		
		this.populateFrom = element;
		if (this.options.populateFrom)
			this.populateFrom = this.options.populateFrom;		
		if (this.options.populateData)
			this.populateData();
		element.css('display',"block");
		
		if (this.options.useHistoryManager)
			this.initHistory();
		
		if ((this.options.embedLinks)|(this.options.useReMooz))
		{
			this.currentLink = $('<a class="open"></a>').attr({href:'#',title:''}).appendTo(element);
			if ((!this.options.showArrows) && (!this.options.showCarousel))
				this.galleryElement = element = this.currentLink;
			else
				this.currentLink.css('display', 'none');
		}
		
		this.constructElements();
		if ((this.galleryData.length>1)&&(this.options.showArrows))
		{
			var leftArrow = $('<a class="left"></a>').bind(
				'click',
				this.prevItem.bind(this)
			).appendTo(element);
			var rightArrow = $('<a class="right"></a>').bind(
				'click',
				this.nextItem.bind(this)
			).appendTo(element);
			$(this.galleryElement).addClass(this.options.withArrowsClass);
		}
		this.loadingElement = $('<div class="loadingElement"></div>').appendTo(element);
		if (this.options.showInfopane) this.initInfoSlideshow();
		if (this.options.showCarousel) this.initCarousel();
		this.doSlideShow(1);
	}
	gallery.prototype.populateData= function() {
		currentArrayPlace = $(this.galleryData).length;
		options = this.options;
		var data = $A(this.galleryData);
		data.extend(this.populateGallery(this.populateFrom, currentArrayPlace));
		this.galleryData = data;
		$(this).trigger('onPopulated');
	};
	gallery.prototype.populateGallery= function(element, startNumber) {
		var data = [];
		options = this.options;
		currentArrayPlace = parseInt(startNumber);
		$(options.elementSelector,element).each(function(i,el) {
			elementDict = new Object({
				image: $(options.imageSelector,el).attr('src'),
				number: currentArrayPlace,
				transition: this.options.defaultTransition
			});
			if ((options.showInfopane) | (options.showCarousel)){
				   elementDict.title= $(options.titleSelector,el)[0].innerHTML;
					elementDict.description= $(options.subtitleSelector,el)[0].innerHTML
			}	
			if ((options.embedLinks) | (options.useReMooz)){
				elementDict.link=$(options.linkSelector,el)[0].href||false;
					// hides false and open image tooltip popups // linkTitle: el.getElement(options.linkSelector).title||false,
				elementDict.linkTarget= $(options.linkSelector,el).attr('target')||false;
			}
			if ((!options.useThumbGenerator) && (options.showCarousel)){
				elementDict.thumbnail=$(options.thumbnailSelector,el).attr('src');
			}else if (options.useThumbGenerator)
				elementDict.thumbnail= options.thumbGenerator + '?imgfile=' + elementDict.image + '&max_width=' + options.thumbWidth + '&max_height=' + options.thumbHeight;
			data.extend([elementDict]);
			currentArrayPlace++;
			if (this.options.destroyAfterPopulate)
				$(el).remove();
		}.bind(this));
		return data;
	},
	gallery.prototype.constructElements= function() {
		el = this.galleryElement;
		if (this.options.embedLinks && (!this.options.showArrows))
			el = this.currentLink;
		this.maxIter = this.galleryData.length;
		var currentImg;
		for(i=0;i<$(this.galleryData).length;i++)
		{
			var currentImg = 
				new morphx($('<div class="slideElement"></div>').css({
					'position':'absolute',
					'left':'0px',
					'right':'0px',
					'margin':'0px',
					'padding':'0px',
					'backgroundPosition':"center center",
					'opacity':'0'
				}).appendTo(el),{duration: this.options.fadeDuration});
				
			if (this.options.preloader)
			{
				
				currentImg.element.source = this.galleryData[i].image;
				currentImg.element.loaded=false;
	
				currentImg.element.load = function(params) {
					var imageStyle=params[0];
					var i=params[1];

					if (!imageStyle.loaded)	{
						var imgx=new Image();
						this.galleryData[i].imgloader = imgx.onload=function(params2){
													img=params2[0];
													i=params2[1];
													img.css(
													'backgroundImage',
													"url('" + img.source + "')")
													img.loaded = true;
													img.width = this.galleryData[i].imgloader.width;
													img.height = this.galleryData[i].imgloader.height;
												}.passx([imageStyle, i], this);
						imgx.src=imageStyle.source;
						
					}
				}.passx([currentImg.element, i],this);
			} else {
				currentImg.element.css('backgroundImage',
									"url('" + this.galleryData[i].image + "')");
			}
			this.galleryElements[parseInt(i)] = currentImg;
		}
	},
	gallery.prototype.destroySlideShow= function(element) {
		var myClassName = element.className;
		var newElement = $('div class="myClassName"></div>');
		element.parentNode.replaceChild(newElement, element);
	},
	gallery.prototype.startSlideShow= function() {
		$(this).trigger('onStart');
		this.loadingElement[0].style.display = "none";
		this.lastIter = this.maxIter - 1;
		this.currentIter = 0;
		this.galleryInit = 0;
		this.galleryElements[parseInt(this.currentIter)].element.css({opacity: 1});
		if (this.options.showInfopane)
			this.showInfoSlideShow.delay(1000, this);
		if (this.options.useReMooz)
			this.makeReMooz.delay(1000, this);
		var textShowCarousel = formatString(this.options.textShowCarousel, this.currentIter+1, this.maxIter);
		if (this.options.showCarousel&&(!this.options.carouselPreloader)&&(!this.options.useExternalCarousel))
			this.carouselBtn.html(textShowCarousel).attr('title', textShowCarousel);
		this.prepareTimer();
		if (this.options.embedLinks)
			this.makeLink(this.currentIter);
	},
	gallery.prototype.nextItem= function() {
		$(this).trigger('onNextCalled');
		this.nextIter = this.currentIter+1;
		if (this.nextIter >= this.maxIter)
			this.nextIter = 0;
		this.galleryInit = 0;
		this.goTo(this.nextIter);
	},
	gallery.prototype.prevItem= function() {
		$(this).trigger('onPreviousCalled');
		this.nextIter = this.currentIter-1;
		if (this.nextIter <= -1)
			this.nextIter = this.maxIter - 1;
		this.galleryInit = 0;
		this.goTo(this.nextIter);
	},
	gallery.prototype.goTo= function(num) {
		//console.log(num);
		this.clearTimer();
		if(this.options.preloader)
		{
			this.galleryElements[num].element.load();
			if (num==0)
				this.galleryElements[this.maxIter - 1].element.load();
			else
				this.galleryElements[num - 1].element.load();
			if (num==(this.maxIter - 1))
				this.galleryElements[0].element.load();
			else
				this.galleryElements[num + 1].element.load();
				
		}
		if (this.options.embedLinks)
			this.clearLink();
		if (this.options.showInfopane)
		{
			this.slideInfoZone.clearChain();
			this.hideInfoSlideShow().chain(this.changeItem.passx(num, this));
		} else
			this.currentChangeDelay = this.changeItem.delay(500, this, num);
		if (this.options.embedLinks)
			this.makeLink(num);
		this.prepareTimer();
		/*if (this.options.showCarousel)
			this.clearThumbnailsHighlights();*/
	},
	gallery.prototype.changeItem= function(num) {
		//console.log(arguments.callee.caller);
		$(this).trigger('onStartChanging');
		this.galleryInit = 0;
		if (this.currentIter != num)
		{
			for(i=0;i<this.maxIter;i++)
			{
				if ((i != this.currentIter)) $(this.galleryElements[i]).css({opacity: 0});
			}
			//console.log(this.galleryData);
			gallery.Transitions[this.galleryData[num].transition].passx([
				this.galleryElements[this.currentIter],
				this.galleryElements[num],
				this.currentIter,
				num], this)();
			this.currentIter = num;
			if (this.options.useReMooz)
				this.makeReMooz();
		}
		var textShowCarousel = formatString(this.options.textShowCarousel, num+1, this.maxIter);
		if ((this.options.showCarousel)&&(!this.options.useExternalCarousel))
			this.carouselBtn.html(textShowCarousel).attr('title', textShowCarousel);
		this.doSlideShow.bind(this)();
		$(this).trigger('onChanged');
	},
	gallery.prototype.clearTimer= function() {
		if (this.options.timed)
			$clear(this.timer);
	},
	gallery.prototype.prepareTimer= function() {
		if (this.options.timed)
			this.timer = this.nextItem.delay(this.options.delay, this);
	},
	gallery.prototype.doSlideShow= function(position) {
   // start jv

        if(this.carousel){
            var thumbs = $('.thumbnail',this.carousel.element);
            thumbs.each(function(i,el){
                if($(el).hasClass('active')) $(el).removeClass('active');
            });

            $(thumbs[this.currentIter]).addClass('active');
            
        }
        var images = $('.slideElement',this.galleryElement);
        if(images.length){
            images.each(function(i,el){
                if($(el).hasClass('active')) $(el).removeClass('active');
            });
            $(images[this.currentIter]).addClass('active');
        }
        //end jv
	
	
		if (this.galleryInit == 1)
		{
			imgPreloader = new Image();
			imgPreloader.onload=function(){
				this.startSlideShow.delay(10, this);
			}.bind(this);
			imgPreloader.src = this.galleryData[0].image;
			if(this.options.preloader)
				this.galleryElements[0].element.load();
		} else {
			if (this.options.showInfopane)
			{
				if (this.options.showInfopane)
				{
					this.showInfoSlideShow.delay((500 + this.options.fadeDuration), this);
				} else
					if ((this.options.showCarousel)&&(this.options.activateCarouselScroller))
						this.centerCarouselOn(position);
			}
		}
	},
	gallery.prototype.createCarousel= function() {
		var carouselElement;
		if (!this.options.useExternalCarousel)
		{
			var carouselContainerElement = $('<div class="carouselContainer"></div>').appendTo(this.galleryElement);
			this.carouselContainer = new morphx(carouselContainerElement,{easing: 'easeOutExpo'});
			this.carouselContainer.element.normalHeight = carouselContainerElement.outerHeight();
			this.carouselContainer.element.css({'opacity': this.options.carouselMinimizedOpacity, 'top': (this.options.carouselMinimizedHeight - this.carouselContainer.element.normalHeight)});
			this.carouselBtn = $('<a class="carouselBtn"></a>').attr({
				title: this.options.textShowCarousel
			}).appendTo(carouselContainerElement);
			if(this.options.carouselPreloader)
				this.carouselBtn.html(this.options.textPreloadingCarousel);
			else
				this.carouselBtn.html(this.options.textShowCarousel);
			this.carouselBtn.bind(
				'click',
				(function () {
					this.carouselContainer.cancel();
					this.toggleCarousel();
				}).bind(this)
			);
			this.carouselActive = false;
	
			carouselElement = $('<div class="carousel"></div>').appendTo(carouselContainerElement);
			this.carousel = new morphx(carouselElement);
		} else {
			carouselElement = $(this.options.carouselElement).addClass('jdExtCarousel');
		}
		this.carouselElement = new morphx(carouselElement,{easing:'easeOutExpo'});
		this.carouselElement.element.normalHeight = carouselElement.offsetHeight;
		if (this.options.showCarouselLabel)
			this.carouselLabel = $('<p class="label"></p>').appendTo(carouselElement);
		carouselWrapper = $('<div class="carouselWrapper"></div>').appendTo(carouselElement);
		this.carouselWrapper =new morphx(carouselWrapper,{easing:'easeOutExpo'});
		this.carouselWrapper.element.normalHeight = carouselWrapper.offsetHeight;
		this.carouselInner = $('<div class="carouselInner"></div>').appendTo(carouselWrapper)[0];
		if (this.options.activateCarouselScroller)
		{
			this.carouselWrapper.element.scroller = new Scroller(carouselWrapper, {
				area: 100,
				velocity: 0.2
			})
			
		/*	this.carouselWrapper.elementScroller = new Fx.Scroll(carouselWrapper, {
				duration: 400,
				onStart: this.carouselWrapper.scroller.stop.bind(this.carouselWrapper.scroller),
				onComplete: this.carouselWrapper.scroller.start.bind(this.carouselWrapper.scroller)
			});*/
			this.carouselWrapper.element.elementScroller = (function(from,to){
						this.carouselWrapper.element.scroller.stop.bind(this.carouselWrapper.scroller);
						this.carouselWrapper.element.animate({left:[from,to]},{duration:400,easing:'linear',queue:false,complete:this.carouselWrapper.element.scroller.start.bind(this.carouselWrapper.element.scroller)}).bind(this);
					}).bind(this);
		}
	},
	gallery.prototype.fillCarousel= function() {
		this.constructThumbnails();
		this.carouselInner.normalWidth = ((this.maxIter * (this.options.thumbWidth + this.options.thumbSpacing + 2))+this.options.thumbSpacing) + "px";
		if (this.options.carouselHorizontal)
			this.carouselInner.style.width = this.carouselInner.normalWidth;
	},
	gallery.prototype.initCarousel= function () {
		this.createCarousel();
		this.fillCarousel();
		if (this.options.carouselPreloader)
			this.preloadThumbnails();
	},
	gallery.prototype.flushCarousel= function() {
		$(this.thumbnailElements).each(function(i,myFx) {
			myFx.element.remove();
			myFx = myFx.element = null;
		});
		this.thumbnailElements = [];
	},
	gallery.prototype.toggleCarousel= function() {
		if (this.carouselActive)
			this.hideCarousel();
		else
			this.showCarousel();
	},
	gallery.prototype.showCarousel= function () {
		$(this).trigger('onShowCarousel');
		this.carouselContainer.completefunc(function() {
			this.carouselActive = true;
			this.carouselWrapper.element.scroller.start();
			$(this).trigger('onCarouselShown');
			//this.carouselContainer.options.onComplete = null;
		}.bind(this)).start({
			'opacity': this.options.carouselMaximizedOpacity,
			'top': 0
		});
	},
	gallery.prototype.hideCarousel= function () {
		$(this).trigger('onHideCarousel');
		var targetTop = this.options.carouselMinimizedHeight - this.carouselContainer.element.normalHeight;
		this.carouselContainer.completefunc(function() {
			this.carouselActive = false;
			this.carouselWrapper.element.scroller.stop();
			$(this).trigger('onCarouselHidden');
			//this.carouselContainer.options.onComplete = null;
		}.bind(this)).start({
			'opacity': this.options.carouselMinimizedOpacity,
			'top': targetTop
		});
	},
	gallery.prototype.constructThumbnails= function () {
		element = this.carouselInner;
		for(i=0;i<this.galleryData.length;i++)
		{
			var currentImg = new morphx($('<div class="thumbnail"></div>').css({
					backgroundImage: "url('" + this.galleryData[i].thumbnail + "')",
					backgroundPosition: "center center",
					backgroundRepeat: 'no-repeat',
					marginLeft: this.options.thumbSpacing + "px",
					width: this.options.thumbWidth + "px",
					height: this.options.thumbHeight + "px"
				}).appendTo(element),{duration: 200,easing:'linear'});//.animate({'opacity': this.options.thumbIdleOpacity}, );
			currentImg.element.bind(
				'mouseover', function (myself) {
					myself.cancel();
					myself.start({'opacity': 0.99});
					if (this.options.showCarouselLabel)
						this.carouselLabel.html('<span class="number">' + (myself.element.data('relatedImage').number + 1) + "/" + this.maxIter + ":</span> " + myself.element.data('relatedImage').title);
				}.passx(currentImg, this));
				currentImg.element.bind('mouseout', (function (myself) {
					myself.cancel();
					myself.start({'opacity': this.options.thumbIdleOpacity});
				}).passx(currentImg, this));
				
				currentImg.element.bind('click', (function (myself) {
					this.galleryInit = 0;
					//console.log(myself.data('relatedImage').number);
					this.goTo(myself.data('relatedImage').number);
					if (this.options.thumbCloseCarousel&&(!this.options.useExternalCarousel))
						this.hideCarousel();
				}).passx(currentImg, this));
			
			currentImg.element.data('relatedImage', this.galleryData[i]);
			this.thumbnailElements[parseInt(i)] = currentImg;
		}
	},
	gallery.prototype.log= function(value) {
		if(console.log)
			console.log(value);
	},
	gallery.prototype.preloadThumbnails= function() {
		var thumbnails = [];
		for(i=0;i<this.galleryData.length;i++)
		{
			thumbnails[parseInt(i)] = this.galleryData[i].thumbnail;
		}
		this.thumbnailPreloader = new Preloader();
		if (!this.options.useExternalCarousel)
			$(this.thumbnailPreloader).bind('onComplete', function() {
				var textShowCarousel = formatString(this.options.textShowCarousel, this.currentIter+1, this.maxIter);
				this.carouselBtn.html(textShowCarousel).attr('title', textShowCarousel);
			}.bind(this));
		this.thumbnailPreloader.load(thumbnails);
	},
	gallery.prototype.clearThumbnailsHighlights= function()
	{
		for(i=0;i<this.galleryData.length;i++)
		{
			this.thumbnailElements[i].cancel();
			this.thumbnailElements[i].start(0.2);
		}
	},
	gallery.prototype.changeThumbnailsSize= function(width, height)
	{
		for(i=0;i<this.galleryData.length;i++)
		{
			this.thumbnailElements[i].cancel();
			this.thumbnailElements[i].element.css({
				'width': width + "px",
				'height': height + "px"
			});
		}
	},
	gallery.prototype.centerCarouselOn= function(num) {
		if (!this.carouselWallMode)
		{
			var carouselElement = this.thumbnailElements[num];
			var position = carouselElement.element.offsetLeft + (carouselElement.element.offsetWidth / 2);
			var carouselWidth = this.carouselWrapper.element.offsetWidth;
			var carouselInnerWidth = this.carouselInner.offsetWidth;
			var diffWidth = carouselWidth / 2;
			var scrollPos = position-diffWidth;
			this.carouselWrapper.element.elementScroller(scrollPos,0);
		}
	},
	gallery.prototype.initInfoSlideshow= function() {
		/*if (this.slideInfoZone.element)
			this.slideInfoZone.element.remove();*/
		this.slideInfoZone = new morphx($('<div class="slideInfoZone"></div>').appendTo($(this.galleryElement)).css({'opacity':0}));
		var slideInfoZoneTitle = $('<h2></h2>').appendTo(this.slideInfoZone.element);
		var slideInfoZoneDescription = $('<p></p>').appendTo(this.slideInfoZone.element);
		this.slideInfoZone.element.normalHeight = this.slideInfoZone.element[0].offsetHeight;
		this.slideInfoZone.element.css('opacity',0);
	},
	gallery.prototype.changeInfoSlideShow= function()
	{
		this.hideInfoSlideShow.delay(10, this);
		this.showInfoSlideShow.delay(500, this);
	},
	gallery.prototype.showInfoSlideShow= function() {
		$(this).trigger('onShowInfopane');
		$('.slideInfoZone').stop();
		element = this.slideInfoZone.element;
		$('h2',element).html( this.galleryData[this.currentIter].title);
		$('p',element).html( this.galleryData[this.currentIter].description);
		if(this.options.slideInfoZoneSlide)
			this.slideInfoZone.start({'opacity': this.options.slideInfoZoneOpacity, 'height': this.slideInfoZone.element.normalHeight},{duration:600,easing:'easeOutExpo'});
		else
			this.slideInfoZone.start({'opacity':this.options.slideInfoZoneOpacity},{duration:1000,easing:'easeOutExpo'});
		if (this.options.showCarousel)
			this.slideInfoZone.completefunc(this.centerCarouselOn.passx(this.currentIter, this));
		return this.slideInfoZone;
	},
	gallery.prototype.hideInfoSlideShow= function() {
		$(this).trigger('onHideInfopane');
		this.slideInfoZone.cancel();
		if(this.options.slideInfoZoneSlide)
			this.slideInfoZone.start({'opacity': 0, 'height': 0},{duration:1000,easing:'easeOutExpo'});
		else
			this.slideInfoZone.start({'opacity': 0});
		return this.slideInfoZone;
	},
	gallery.prototype.makeLink=function(num) {
		this.currentLink.attr({
			href: this.galleryData[num].link,
			title: this.galleryData[num].linkTitle
		});
		if (!((this.options.embedLinks) && (!this.options.showArrows) && (!this.options.showCarousel)))
			this.currentLink.css('display', 'block');
	},
	gallery.prototype.clearLink= function() {
		this.currentLink.attr({href: '', title: ''});
		if (!((this.options.embedLinks) && (!this.options.showArrows) && (!this.options.showCarousel)))
			this.currentLink.css('display', 'none');
	},
	gallery.prototype.makeReMooz= function() {
		this.currentLink.attr({
			href: '#'
		});
		this.currentLink.css({
			'display': 'block'
		});
		
		this.galleryElements[this.currentIter].element.attr('title', this.galleryData[this.currentIter].title + ' :: ' + this.galleryData[this.currentIter].description);
		this.ReMooz = new ReMooz(this.galleryElements[this.currentIter].element, {
			link: this.galleryData[this.currentIter].link,
			shadow: false,
			dragging: false,
			addClick: false,
			resizeOpacity: 1
		});
		var img = this.galleryElements[this.currentIter];
		var coords = img.element.offset();
		coords.width=img.element.width();
		coords.height=img.element.height();
		widthDiff = coords.width - img.width;
		heightDiff = coords.height - img.height;
		
		coords.width = img.width;
		coords.height = img.height;
		
		coords.left += Math.ceil(widthDiff/2)+1;
		coords.top += Math.ceil(heightDiff/2)+1;
		
		this.ReMooz.getOriginCoordinates = (function(coords) {
			return coords;
		}).bind(this, coords);
		this.currentLink.onclick = function () {
			this.ReMooz.open.bind(this.ReMooz)();
			return false;
		}.bind(this);
	},
	/* To change the gallery data, those two functions : */
	gallery.prototype.flushGallery= function() {
		$(this.galleryElements).each(function(i,myFx) {
			myFx.element.remove();
			myFx = myFx.element = null;
		});
		this.galleryElements = [];
	},
	gallery.prototype.changeData= function(data) {
		this.galleryData = data;
		this.clearTimer();
		this.flushGallery();
		if (this.options.showCarousel) this.flushCarousel();
		this.constructElements();
		if (this.options.showCarousel) this.fillCarousel();
		if (this.options.showInfopane) this.hideInfoSlideShow();
		this.galleryInit=1;
		this.lastIter=0;
		this.currentIter=0;
		this.doSlideShow(1);
	},
	/* Plugins: HistoryManager */
	gallery.prototype.initHistory= function() {
		$(this).trigger('onHistoryInit');
		this.historyKey = this.galleryElement.id + '-picture';
		if (this.options.customHistoryKey)
			this.historyKey = this.options.customHistoryKey;
		
		this.history = new History.Route({
			defaults: [1],
			pattern: this.historyKey + '\\((\\d+)\\)',
			generate: function(values) {
				return [this.historyKey, '(', values[0], ')'].join('')
			}.bind(this),
			onMatch: function(values, defaults) {
				if (parseInt(values[0])-1 < this.maxIter)
					this.goTo(parseInt(values[0])-1);
			}.bind(this)
		});
		this.bind('onChanged', function(){
			this.history.setValue(0, this.currentIter+1);
			this.history.defaults=[this.currentIter+1];
		}.bind(this));
		$(this).trigger('onHistoryInited');
	}



gallery.Transitions = new Object ({
	fade: function(/*oldFx, newFx, oldPos, newPos*/){
		//console.log(arguments);
		oldFx=arguments[0][0];
		newFx=arguments[0][1];
		oldPos=arguments[0][2];
		newPos=arguments[0][3];
		oldFx.options.easing = newFx.options.easing =  'linear';
		oldFx.options.duration = newFx.options.duration = this.options.fadeDuration;
		if (newPos > oldPos) newFx.start({opacity: 1});
		else
		{
			newFx.element.css({opacity: 1});
			oldFx.start({opacity: 0});
		}
	},
	crossfade: function(/*oldFx, newFx, oldPos, newPos*/){
		oldFx=arguments[0][0];
		newFx=arguments[0][1];
		oldPos=arguments[0][2];
		newPos=arguments[0][3];
		oldFx.options.easing = newFx.options.easing =  'linear';
		oldFx.options.duration = newFx.options.duration = this.options.fadeDuration;
		newFx.start({opacity: 1});
		oldFx.start({opacity: 0});
	},
	fadebg: function(/*oldFx, newFx, oldPos, newPos*/){
		oldFx=arguments[0][0];
		newFx=arguments[0][1];
		oldPos=arguments[0][2];
		newPos=arguments[0][3];
		oldFx.options.easing = newFx.options.easing = 'linear';
		oldFx.options.duration = newFx.options.duration = this.options.fadeDuration / 2;
		oldFx.completefunc(newFx.start.passx([{opacity: 1}], newFx)).start({opacity: 0});
	}
});

/* All code copyright 2007 Jonathan Schemoul */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Follows: Preloader (class)
 * Simple class for preloading images with support for progress reporting
 * Copyright 2007 Tomocchino.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Preloader = function(options){
  

  this.options= {
    root        : '',
    period      : 100
  }
  if(options) this.options=$.extend(this.options,options);
}
  
    Preloader.prototype.load= function(sources) {
    this.index = 0;
    this.images = [];
    this.sources = this.temps = sources;
    this.total = this. sources.length;
    
    $(this).trigger('onStart', [this.index, this.total]);
    try{var per=this.options.period;}catch(e){return;}
    this.timer = this.progress.periodical(per, this);
    
    $(this.sources).each((function( index, source){
      this.images[index] = $('<img/>').attr('src',this.options.root + source);
        this.images[index].bind('load'  ,function(){ this.index++; if(this.images[index]) $(this).trigger('onLoad', [this.images[index], index, source]); }.bind(this)).bind(this);
        this.images[index].bind('error' ,function(){ this.index++; $(this).trigger('onError', [this.images.splice(index, 1), index, source]); }.bind(this)).bind(this);
        this.images[index].bind('abort' ,function(){ this.index++; $(this).trigger('onError', [this.images.splice(index, 1), index, source]); }.bind(this)).bind(this);
    }).bind( this));
  }
  
  Preloader.prototype.progress= function() {
    $(this).trigger('onProgress', [Math.min(this.index, this.total), this.total]);
    if(this.index >= this.total) this.complete();
  },
  
  Preloader.prototype.complete= function(){
    $clear(this.timer);
    $(this).trigger('onComplete', [this.images]);
  };
  
  Preloader.prototype.cancel= function(){
    $clear(this.timer);
  }
  
})(jQuery);
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Follows: formatString (function)
 * Original name: Yahoo.Tools.printf
 * Copyright Yahoo.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function formatString() {
	var num = arguments.length;
	var oStr = arguments[0];
	for (var i = 1; i < num; i++) {
		var pattern = "\\{" + (i-1) + "\\}"; 
		var re = new RegExp(pattern, "g");
		oStr = oStr.replace(re, arguments[i]);
	}
	return oStr; 
}
