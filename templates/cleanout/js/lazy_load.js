function s5_lazyload_all() {

	if (s5_lazyload  == "all") {

		if (document.getElementById("s5_top_row1_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_top_row1_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_top_row2_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_top_row2_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_top_row3_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_top_row3_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_center_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_center_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_bottom_row1_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_bottom_row1_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_bottom_row2_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_bottom_row2_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
		if (document.getElementById("s5_bottom_row3_area_inner")) {
			var s5_lazy_load_imgs = document.getElementById("s5_bottom_row3_area_inner").getElementsByTagName("IMG");
			for (var s5_lazy_load_imgs_y=0; s5_lazy_load_imgs_y<s5_lazy_load_imgs.length; s5_lazy_load_imgs_y++) {
				if (s5_lazy_load_imgs[s5_lazy_load_imgs_y].className == "") {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = "s5_lazyload";
				}
				else {
					s5_lazy_load_imgs[s5_lazy_load_imgs_y].className = s5_lazy_load_imgs[s5_lazy_load_imgs_y].className + " s5_lazyload";
				}
			}
		}
			
	}

}


/*
---

name: MooLazyloader

description: A lazy load script for MooTools Core 1.3.

authors: Stephane P. Pericat (@sppericat)

license: MIT-style license.

requires: [Core]

provides : MooLazyloader

...
*/

var MooLazyloader = new Class({
	Implements: [Options, Events],

	options: {
		container: window,
		items: '.s5_lazyload',
	},

	images: null,
	containerHeight: null,
	loaded: new Array(),

	initialize: function(options) {
		this.setOptions(options);
		if(this.options.items) {
			this.images = $$(this.options.items);
		} else {
			throw 'no pictures to lazyload';
		}
		this.containerHeight = this.options.container.getSize().y;
		this.images.each(function(item, id) {
			item.setStyle('opacity', 0);
			if(!item.get('src')) item.set('src', this.options.loader);
		}.bind(this));
		this.options.container.addEvent('scroll', function() {
			this.display(this.images, this.options.container.getScroll().y);
		}.bind(this));
        this.options.container.fireEvent("scroll");
	},

	display: function(images, scrollPosition) {
		bottom = scrollPosition + this.containerHeight; 
    	images.each(function(item, id) { 
    		if(this.loaded.contains(id)) return; 
    		if(item.getPosition().y < bottom && item.getPosition().y > scrollPosition) { 
    			this.loaded.push(id); 
    			item.set('src', item.get('src')); 
    			item.set('morph', {'duration': '400'});
				(function() {
					item.morph({'opacity': 1});
				}).delay(150);
    			
    		} 
       }.bind(this));
	}
});


	window.addEvent('domready', function() {
		s5_lazyload_all();
		var lazy = new MooLazyloader({
			items: '.s5_lazyload' //pass the class name of the images to lazy load
		});
	});
