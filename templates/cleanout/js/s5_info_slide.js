
Element.implement({  
     wrapInner:function(e){  
          this.clone(false,true).adopt(  
               $(e).set('html',this.get('html'))  
          ).replaces(this);  
     }  
});  
Element.implement({
 css: function(property,value) {
 var type = $type(property);
 if(value == undefined && type != 'object') {
 return this.getStyle(property);
 }
 else {
 var pvs = property;
 if(type != 'object') { pvs = {}; pvs[property] = value; }
 return this.setStyles(pvs);
 }
 },
 attr: function(property,value) {
 var type = $type(property);
 if(value == undefined && type != 'object') {
 return this.get(property);
 }
 else {
 var pvs = property;
 if(type != 'object') { pvs = {}; pvs[property] = value; }
  return this.set(pvs);
 }
 }
});

Slidex = new Class({
    initialize: function (options) {
        this.options = $extend({
            wrapperId: null,
            s5_is: "s5_is",
            items5_is_slide: "s5_is_slide",
			opacityClass: "s5_is_slide",
            fullsize: 1,
            opacity: 85,
			fxOptions:{transition:Fx.Transitions.Expo.easeOut}
        }, options || {});
        this.Fx = null;
        var itemsOpacity = $$("#" + this.options.wrapperId + " ." + this.options.opacityClass);
		
        var items = $$("#" + this.options.wrapperId + " ." + this.options.s5_is);
        var itemsCover = $$("#" + this.options.wrapperId + " ." + this.options.items5_is_slide);
        if ($defined(itemsOpacity)) {
			
            itemsOpacity.setStyles({
                'opacity': this.options.opacity / 100,
                'filter': 'alpha(opacity=' + this.options.opacity + ')'
				
            });
        }
		
		var s5_is_slide_class = "no";
		var s5_is_slide_class = document.getElementById("s5_body").getElementsByTagName("DIV");
		for (var s5_is_slide_class_y=0; s5_is_slide_class_y<s5_is_slide_class.length; s5_is_slide_class_y++) {
			if (s5_is_slide_class[s5_is_slide_class_y].className == "s5_is_slide") {
				s5_is_slide_class = "yes"
			}
		}
		
		if(s5_is_slide_class == "yes") {
        if ($defined(itemsCover)) {
			//alert(items[0].offsetHeight);
            items.setStyle("display", "block");
            if (this.options.fullsize == 1) {
                this.options.start = 0;
                
                this.options.end = items[0].offsetHeight;
             //   alert(this.options.end);
			}
			this.options.end = items[0].offsetHeight;
			itemsCover.each(function(itemc,index){
				//itemc.setStyle('height',this.options.end+'px');
				itemc.setStyle('height',items[0].offsetHeight+'px');
			});
            this.Fx = new Fx.Elements(itemsCover, $extend({
                wait: false,
                duration: 250
            }, this.options.fxOptions || {}));
            var params = {
                'items': items,
                'itemsCover': itemsCover,
				'itemsOpacity': itemsOpacity
            };
			return this['doit'](params);
        }
		}
    },

    doit: function (params) {
        params['items'].each(function (item, index) {
            item.addEvent('mouseenter', function () {
                var obj = {};
                obj[index] = {'height': [params['itemsCover'][index].getElement('h3').offsetHeight,params['items'][index].getElement('img').height]};
                params['itemsCover'].each(function (other, jindex) {
                    if (index != jindex) {
                        var end = other.getStyle('height').toInt();
                        if (end != this.options.start) {
                            obj[jindex] = {'height': [ params['itemsCover'][jindex].getElement('h3').offsetHeight]};
                        }
                    }
					params['itemsOpacity'][index].setStyle('height', params['itemsCover'][index].getElement('h3').offsetHeight);
                }.bind(this));
                this.Fx.cancel();
                this.Fx.start(obj);
            }.bind(this));
            item.addEvent('mouseleave', function () {
                var obj = {};
                params['itemsCover'].each(function (other, jindex) {
                    var end = other.getStyle('height').toInt();
					if(jindex==index)
                    obj[jindex] = {'height': [params['itemsCover'][jindex].getElement('h3').offsetHeight]};
                }.bind(this));
                this.Fx.cancel();
                this.Fx.start(obj);
            }.bind(this));
            params['itemsCover'][index].setStyle('height', params['itemsCover'][index].getElement('h3').offsetHeight);
			
			
			
        }.bind(this));
    }
});


	
	 var s5_is_tobind=function(){
		$$('.s5_is').each(function(item,index){
			item.getElement('.s5_is_slide').setStyle('width', item.getElement('img').width);
		});
		$$('.s5_is_slide').each(function(item,index){
			item.css('marginBottom',item.parentNode.getElement('img').css('borderBottom').match(/(\d+)px.+/)[1]+'px');
			item.css('marginLeft',item.parentNode.getElement('img').css('borderLeft').match(/(\d+)px.+/)[1]+'px');
		});
	};
	$(window).addEvent('resize',function(){s5_is_tobind();});
	$(window).addEvent('load',function(){s5_is_tobind();});

	
