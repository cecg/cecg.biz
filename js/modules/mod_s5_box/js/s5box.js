
var S5Box = new Class({
	Implements: [Events],
	options: {
		transition: s5_boxeffect,
		speed: 350,
		width: false,
		height: false,
		initialWidth: 100,
		initialHeight: 100,
		maxWidth: false,
		maxHeight: false,
		resize: true,
		inline: false,
		title: false,
		rel: false,
		opacity: 0.7,
		preloading: true,
		close: 'close',
		open: false,
		overlayClose: true
	},
	
	events: {
		windowResize: null,
		windowResizeIE6: null,
		windowScrollIE6: null
	},
	
	initialize: function(selector, options){
		$extend(this.options, options);
		var elements = $$(selector);
		if(elements.length){			
			var that = this, isInitialized = false;				
			this.cbox = $('colorbox');
			if(this.cbox){
				isInitialized = true;				
			}
			else{
				this.cbox = new Element('div', { 'id': 'colorbox'});
			}						
			this.overlay = $('cboxOverlay') || this.createDiv('Overlay').setStyle('display', 'none');;
			this.wrap = $('cboxWrapper') ||  this.createDiv('Wrapper');
			this.loaded = $('cboxLoadedContent') || this.createDiv('LoadedContent').setStyles({'width': 0, 'height': 0});
			this.loadingOverlay = $('cboxLoadingOverlay') || this.createDiv('LoadingOverlay');
			this.loadingGraphic = $('cboxLoadingGraphic') || this.createDiv('LoadingGraphic');
			this.current = $('cboxCurrent') || this.createDiv('Current');
			this.title = $('cboxTitle') || this.createDiv('Title');
			this.close = $('cboxClose') || this.createDiv('Close');
			this.content = $('cboxContent') || this.createDiv('Content').adopt(
				this.loaded,
				this.loadingOverlay,
				this.loadingGraphic,
				this.close
			);			
			this.topBorder = $('cboxTopCenter') || this.createDiv('TopCenter');
			this.leftBorder = $('cboxMiddleLeft') || this.createDiv('MiddleLeft');
			this.rightBorder = $('cboxMiddleRight') || this.createDiv('MiddleRight');
			this.bottomBorder = $('cboxBottomCenter') || this.createDiv('BottomCenter');			
			if(!isInitialized){
				this.wrap.adopt(
					new Element('div').adopt(
						$('cboxTopLeft') || this.createDiv('TopLeft'),
						this.topBorder,
						$('cboxTopRight') || this.createDiv('TopRight')
					),
					new Element('div').adopt(
						this.leftBorder,
						this.content,
						this.rightBorder
					),
					new Element('div').adopt(
						$('cboxBottomLeft') || this.createDiv('BottomLeft'),
						this.bottomBorder,
						$('cboxBottomRight') || this.createDiv('BottomRight')
					)
				).getChildren().getChildren().each(function(child){
					child.setStyle('float', 'left');
				});				
				this.cbox.adopt(this.wrap).inject(document.body, 'top');
				this.overlay.inject(document.body, 'top');				
				var isIE = this.ieVersion();
				if (isIE > 0 && isIE < 7) {
					this.overlay.setStyle('position', 'absolute');
				}
			}
			this.content.getChildren().each(function(child){
				child.addClass('hover')
					.addEvents({
						'mouseover': function () { this.addClass('hover'); },
						'mouseout': function () { this.removeClass('hover'); }
					})
					.setStyle('display', 'none');
			});			
			this.cbox.setStyle('display', 'block');
			this.interfaceHeight = this.topBorder.offsetHeight + this.bottomBorder.offsetHeight + this.content.getStyle('margin-top').toInt() + this.content.getStyle('margin-bottom').toInt();//Subtraction needed for IE6
			this.interfaceWidth = this.leftBorder.offsetWidth + this.rightBorder.offsetWidth + this.content.getStyle('margin-left').toInt() + this.content.getStyle('margin-right').toInt();
			this.loadedHeight = this.loaded.offsetHeight + this.loaded.getStyle('margin-top').toInt() + this.loaded.getStyle('margin-bottom').toInt();
			this.loadedWidth = this.loaded.offsetWidth + this.loaded.getStyle('margin-left').toInt() + this.loaded.getStyle('margin-right').toInt();
			this.cbox.setStyles({'padding-bottom': this.interfaceHeight, 'padding-right': this.interfaceWidth, 'display': 'none'});
			if(!isInitialized){
				this.cbox.fx = new Fx.Tween(this.cbox, {property: 'opacity', onComplete: function(){ if(that.ieVersion() > 0){ that.content.setStyle('filter', '');}}});
				this.overlay.fx = new Fx.Tween(this.overlay, {property: 'opacity', duration: 300});
				this.close.addEvent('click', this.closefn.bind(this));
				this.content.getChildren().removeClass('hover');
				this.cbox.open = false;
				if (this.options.overlayClose === true) {
					this.overlay.setStyle('cursor', 'pointer').addEvent('click', this.closefn.bind(this));
				}
			}
			var isIE = that.ieVersion();
			if(isIE > 0 && isIE < 7){
				this.events.windowResizeIE6 = this.events.windowScrollIE6 = function(){
					that.overlay.setStyle({
						'width': window.getWidth(),
						'height': window.getHeight(),
						'top': window.scrollTop(),
						'left': window.scrollLeft()
					});
				};
			}
			elements.each(function(element){
				element.colorbox = $extend({}, that.options);
			});
			elements.each(function(element, idx){
				element.removeEvents('click').addEvent('click', function(e){
					if(e){
						e.stop();
					}
					that.setting = element.colorbox;
					that.element = element;
					if(!that.cbox.open){
						that.cbox.open = true;
						that.fireEvent('cbox_open');
						that.close.innerHTML = that.setting.close;
						that.overlay.setStyles({'opacity': that.setting.opacity, 'display': 'block'});
						that.position(that.setSize(that.setting.initialWidth, 'x'), that.setSize(that.setting.initialHeight, 'y'), 0);
						var isIE = that.ieVersion();
						if(isIE > 0 && isIE < 7){
							window.addEvent('resize', that.events.windowResizeIE6);
							window.addEvent('scroll', that.events.windowScrollIE6);
							that.events.windowScrollIE6();
						}
					}
					element.blur();
					that.load();
				});
			});
		}		
	},
	setSize: function(size, dimension){
		dimension = dimension === 'x' ? document.documentElement.clientWidth : document.documentElement.clientHeight;
		return (typeof size === 'string') ? (size.match(/%/) ? (dimension / 100) * parseInt(size, 10) : parseInt(size, 10)) : size;
	},
	isImage: function(url){
		return this.setting.photo ? true : url.match(/\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i);
	},
	createDiv: function(id){
		return new Element('div', { 'id': 'cbox' + id });
	},
	ieVersion: function(){
		var rv = -1;
		if (navigator.appName == 'Microsoft Internet Explorer'){
			if (new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)
			rv = parseFloat( RegExp.$1 );
		}
		return rv;
	},
	position: function (mWidth, mHeight, speed, loadedCallback) {	
		var winHeight = document.documentElement.clientHeight,
			posTop = winHeight / 2 - mHeight / 2,
			posLeft = document.documentElement.clientWidth / 2 - mWidth / 2,
			duration = 0,
			that = this;
		if (mHeight > winHeight) { posTop -=(mHeight - winHeight); }
		if (posTop < 0) { posTop = 0; } 
		if (posLeft < 0) { posLeft = 0; }
		posTop += window.getScrollTop();
		posLeft += window.getScrollLeft();
		this.wrap.mWidth = mWidth - this.interfaceWidth;
		this.wrap.mHeight = mHeight - this.interfaceHeight;
		this.cbox.setStyle('display', 'block');
		duration = (this.cbox.offsetWidth === mWidth && this.cbox.offsetHeight === mHeight) ? 0 : speed;
		this.wrap.style.width = this.wrap.style.height = '9999px';
		if(!this.cbox.fxs){
			var fx = new Fx.Morph(this.cbox, {
				duration: duration,
				link: 'cancel'
			});
			fx.set  = function(now){				
				if (typeof now == 'string') now = this.search(now);
				for (var p in now) this.render(this.element, p, now[p], this.options.unit);
				that.topBorder.style.width = that.bottomBorder.style.width = that.content.style.width = that.cbox.style.width;
				that.loadingGraphic.style.height = that.loadingOverlay.style.height = that.content.style.height = that.leftBorder.style.height = that.rightBorder.style.height = that.cbox.style.height;
			};
			this.cbox.fxs = fx;
		}
		if(duration == 0){
			this.cbox.setStyles({
				height: this.wrap.mHeight,
				width: this.wrap.mWidth,
				top:posTop,
				left:posLeft,
				opacity: 1
			});	
			that.topBorder.style.width = that.bottomBorder.style.width = that.content.style.width = that.cbox.style.width;
			that.loadingGraphic.style.height = that.loadingOverlay.style.height = that.content.style.height = that.leftBorder.style.height = that.rightBorder.style.height = that.cbox.style.height;			
		//	this.wrap.style.width = (this.wrap.mWidth + this.interfaceWidth) + 'px';
		//	this.wrap.style.height = (this.wrap.mHeight + this.interfaceHeight) + 'px';			
			if(loadedCallback){
				loadedCallback();
			}
		}else{
			this.cbox.fxs.setOptions({duration: duration}).start({
				height: this.wrap.mHeight,
				width: this.wrap.mWidth,
				top:posTop,
				left:posLeft
			}).chain(function(){
				if(loadedCallback){
					loadedCallback();
				}
			});
		}
	},
	dimensions: function (object) {
		if(!this.cbox.open){ return; }
		window.removeEvent('resize', this.events.windowResize);
		var width, height, topMargin, photo, speed = this.setting.transition === 'none' ? 0 : this.setting.speed, that = this;
		try{
			var cboxLoadedContent = $('cboxLoadedContent');
			if(cboxLoadedContent){
				cboxLoadedContent.dispose();
			}
		}catch(e){}
		this.loaded = $(object).setStyle('display', 'block');
		function exameWidth(){
			if(that.setting.width){
				width = that.maxWidth;
			} else {
				width = that.maxWidth && that.maxWidth < that.loaded.offsetWidth ? that.maxWidth : that.loaded.offsetWidth;
			}
			return width;
		}
		function exameHeight(){
			if(that.setting.height){
				height = that.maxHeight;
			} else {
				height = that.maxHeight && that.maxHeight < that.loaded.offsetHeight ? that.maxHeight : that.loaded.offsetHeight;
			}
			return height;
		}
		this.loaded.inject(document.body)
			.setProperty('id', 'cboxLoadedContent')
			.setStyle('width', exameWidth())
			.setStyle('height', exameHeight())
			.inject(this.content, 'top');
		this.loaded.setStyle('display', 'none');
		var isIE = this.ieVersion();
		if (isIE > 0 && isIE < 7) {
			var allselects = $$('select');
			var cboxselects = $$('#colorbox select');
			allselects.filter(function(select){
				return cboxselects.indexOf(select) == -1;
			}).setStyle('visibility', 'hidden');
		}
		photo = $('#cboxPhoto');
		if (photo && this.setting.height) {
			topMargin = (height - parseInt(photo.style.height, 10)) /2;
			photo.style.marginTop = (topMargin > 0 ? topMargin : 0) + 'px';
		}
		function setPosition(s){
			var mWidth = width + that.loadedWidth + that.interfaceWidth, mHeight = height + that.loadedHeight + that.interfaceHeight;
			that.position(mWidth, mHeight, s, function(){
				if (!that.cbox.open) {
					return;
				}
				if (that.ieVersion() > 0){
					if(photo){
						new Fx.Tween(that.loaded, {property: 'opacity', duration: 100, wait: false}).start(1);
					}
					that.cbox.setStyle('filter', '');
				}
				that.content.getChildren().setStyle('display', 'block');
				var cboxIframeTemp = $('cboxIframeTemp');
					if(cboxIframeTemp){
					new Element('iframe', {
						'id': 'cboxIframe',
						'name': 'iframe_' + new Date().getTime(),
						'frameborder': 0,
						'src': (that.setting.href || this.element.href)
					}).insertAfter(cboxIframeTemp);
					cboxIframeTemp.dispose();
					cboxIframeTemp = null;
				}
				that.loadingOverlay.setStyle('display', 'none');
				that.loadingGraphic.setStyle('display', 'none');
				that.current.setStyle('display', 'none');
				that.title.innerHTML = (that.setting.title || that.element.title);
				that.fireEvent('cbox_complete');
				if (that.setting.transition === 'fade'){
					that.cbox.fx.setOptions({duration: speed}).start(1);
				}
				that.events.windowResize = function(){
					that.position(mWidth, mHeight, 0);
				};
				window.addEvent('resize', that.events.windowResize);
			});
		}
		if (that.setting.transition === 'fade') {
			that.cbox.fx.setOptions({duration: speed}).start(0).chain(function(){setPosition(0);});
		} 
		else if (document.body.offsetWidth <= 970) {
			if (isIE > 0) {
			setPosition(0);
			} else {
			that.cbox.fx.setOptions({transition: 'none'}).start(0).chain(function(){setPosition(0);});
			}
		} 
		else {
			setPosition(speed);
		}
	},
	
	load: function(){
	
		var height, width, href, loadingElement;
		var cboxInlineTemp = $('cboxInlineTemp');
		if(cboxInlineTemp && this.loaded){
			this.loaded.getChildren().inject(cboxInlineTemp, 'before');
			cboxInlineTemp.dispose();
			cboxInlineTemp = null;
		}
		this.fireEvent('cbox_load');
		height = this.setting.height ? this.setSize(this.setting.height, 'y') - this.loadedHeight - this.interfaceHeight : false;
		width = this.setting.width ? this.setSize(this.setting.width, 'x') - this.loadedWidth - this.interfaceWidth : false;
		this.href = this.setting.href || this.element.href;
		var hrefElm = $(this.href.substring(1));
		this.loadingOverlay.setStyle('display', 'block');
		this.loadingGraphic.setStyle('display', 'block');
		this.close.setStyle('display', 'block');
		if(this.setting.maxHeight){
			this.maxHeight = this.setting.maxHeight ? this.setSize(this.setting.maxHeight, 'y') - this.loadedHeight - this.interfaceHeight : false;
			height = height && height < this.maxHeight ? height : this.maxHeight;
		}
		if(this.setting.maxWidth){
			this.maxWidth = this.setting.maxWidth ? this.setSize(this.setting.maxWidth, 'x') - this.loadedWidth - this.interfaceWidth : false;
			width = width && width < this.maxWidth ? width : this.maxWidth;
		}
		this.maxHeight = height;
		this.maxWidth = width;
		if(this.setting.inline){
			this.createDiv('InlineTemp').setStyle('display', 'none').inject(hrefElm, 'before');
			this.dimensions(new Element('div').adopt(hrefElm));
		} else if (this.setting.iframe) {
			this.dimensions(new Element('div').adopt(this.createDiv('IframeTemp')));
		} else if (this.setting.html) {
			dimensions(new Element('div', {innerHTML: this.setting.html}));
		} else if (isImage(this.href)){
			var loadingElement = new Image(), that = this;
			loadingElement.onload = function(){
				loadingElement.onload = null;
				if((that.maxHeight || that.maxWidth) && that.setting.resize){
					var width = loadingElement.width,
						height = loadingElement.height,
						percent = 0;
					if( that.maxWidth && width > that.maxWidth ){
						percent = (that.maxWidth - width) / width;
						height += height * percent;
						width += width * percent;
						loadingElement.height = height;
						loadingElement.width = width;
					}
					if( that.maxHeight && height > that.maxHeight ){
						percent = (that.maxHeight - height) / height;
						height += height * percent;
						width += width * percent;
						loadingElement.height = height;
						loadingElement.width = width;
					}
				}
				dimensions(new Element('div', {
					styles: {
						width: loadingElement.width,
						height: loadingElement.height
					}
				}).adopt(loadingElement.height.setStyles({
					width: loadingElement.width,
					height:loadingElement.height,
					display:"block",
					margin:"auto",
					border:0
				}).setProperty('id', 'cboxPhoto')));
				
				if(that.ieVersion() == 7){
					loadingElement.style.msInterpolationMode='bicubic';
				}
			};
			loadingElement.src = this.href;
		} 
	},
	closefn: function(){
		
		var that = this;
		
		var cboxInlineTemp = $('cboxInlineTemp');
		//console.log($('cboxLoadedContent').getChildren());
		//console.log(this.loaded);
		
		if(cboxInlineTemp && $('cboxLoadedContent')){
			
			$('cboxLoadedContent').getChildren().inject(cboxInlineTemp, 'before');
		}
		this.fireEvent('cbox_close');
		cboxInlineTemp.destroy();
		var isIE = this.ieVersion();
		if (isIE > 0 && isIE < 7) {
			var allselects = $$('select');
			var cboxselects = $$('#colorbox select');
			allselects.filter(function(select){
				return cboxselects.indexOf(select) == -1;
			}).setStyle('visibility', 'hidden');
		}
		this.cbox.open = false;
		window.removeEvents('resize', this.events.windowResize);
		var isIE = that.ieVersion();
		if(isIE > 0 && isIE < 7){
			window.removeEvents('resize', this.events.windowResizeIE6);
			window.removeEvents('scroll', this.events.windowScrollIE6);		
		}
		this.overlay.setStyle('cursor', 'auto').fx.start(0).chain(function(){
			that.overlay.setStyle('display','none');
		});;
		this.content.getChildren().setStyle('display', 'none');	
		this.cbox.setProperty('className', '')
			.fx.start(0).chain(function(){
				var cboxLoadedContent = $('cboxLoadedContent');
				if(cboxLoadedContent){
					cboxLoadedContent.dispose();
				}
				that.loaded = null;
			});
			try{
				if (document.getElementById("s5_responsive_mobile_top_bar_wrap")) {
				window.addEvent('resize',s5_responsive_mobile_login_register);
				}
			}catch(e){}
		document.getElementById("colorbox").style.display = "none";
	}
});
