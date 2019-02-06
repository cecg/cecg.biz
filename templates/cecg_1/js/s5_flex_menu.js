function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};
Element.implement({
	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var el = this, position = {x: 0, y: 0};
		while (el){
			position.x += el.offsetLeft;
			position.y += el.offsetTop;
			el = el.offsetParent;
		}
		var rpos = (relative) ? $(relative).getPosition() : {x: 0, y: 0};
		return {x: position.x - rpos.x, y: position.y - rpos.y};
	}
});

var MenuMatic = new Class({
	Implements: Options,
	options: {
        id: 's5_nav',//the id of the main menu (ul or ol)
        subMenusContainerId:'subMenusContainer',//id of the container div that will be generated to hold the submenus 

		//subMenu behavior
		effect: 'slide & fade',// 'slide', 'fade', 'slide & fade', or  null
		duration: 600,//duration of the effect in milliseconds
		physics: Fx.Transitions.Pow.easeOut,//how the effect behaves
		hideDelay: 1000,//in milliseconds, how long you have after moving your mouse off of the submenus before they dissapear
		displayDelay: 0,//in milliseconds, how long you have after moving your mouse on the submenus before they appear

		//layout
		stretchMainMenu:false,//stretch main menu btn widths to fit within the width {set in the css} of the parent UL or OL
		matchWidthMode:false,//initial submenus match their parent button's width
		orientation: 'horizontal',//horizontal or vertical
		direction:{	x: 'right',	y: 'down' },//for submenus ( relative to the parent button )left or right, up or down
		tweakInitial:{ x:0, y:0	},//if you need to tweak the placement of the initial submenus
		tweakSubsequent:{ x:0, y:0 },//if you need to tweak the placement of the subsequent submenus
		center: false,// will attempt to center main nav element

		//dynamic style
		opacity: 95,//of the submenus
		mmbFocusedClassName:null,//main menu button classname, used for morphing to focused state
		mmbClassName:null,//main menu button classname, used for morphing back to original state
		killDivider:null,	

		fixHasLayoutBug:false,	

		onHideAllSubMenusNow_begin: (function(){}),
		onHideAllSubMenusNow_complete: (function(){}),

		onInit_begin: (function(){}),
		onInit_complete: (function(){})		
    },
	
	hideAllMenusTimeout:null,
	S5DisplayMenusTimeout:null,
	allSubMenus:[],
	subMenuZindex:1,
	
	initialize: function(options){
		//if(Browser.Engine.webkit419){return;}		
        this.setOptions(options);
		this.options.onInit_begin();
		if(this.options.opacity > 99){this.options.opacity = 99.9;}
		this.options.opacity = this.options.opacity /100;

		Element.implement({
		    getId: function(){
				//If this element does not have an id, give it a unique one
		        if(!this.id){ 
					var uniqueId = this.get('tag') + "-" + $time();
					while($(uniqueId)){
						//make sure it is absolutely unique
						uniqueId = this.get('tag') + "-" + $time();						
					}
					this.id = uniqueId;						
				}
			    return this.id;
		    }
		});

		//initialize directions
		this.options.direction.x = this.options.direction.x.toLowerCase();
		this.options.direction.y = this.options.direction.y.toLowerCase();
		if(this.options.direction.x === 'right'){
			this.options.direction.xInverse = 'left';
		}else if(this.options.direction.x === 'left'){
			this.options.direction.xInverse = 'right';
		}
		if(this.options.direction.y === 'up'){
			this.options.direction.yInverse = 'down';
		}else if(this.options.direction.y === 'down'){
			this.options.direction.yInverse = 'up';
		}

		var links = $(this.options.id).getElements('li, span.grouped_sub_parent_item');// $(this.options.id).getElements('a'); - silviu

		//silviu create an array to keep the child LI index
		var LiParent = new Array();

		links.each(function(item,index){
			//store parent links & child menu info
			item.store('parentLinks', item.getParent().getParents('li'));
			//item.store('parentLinks', item.getNext('a')); 

			//item.store('parentLinks',item.retrieve('parentLinks').erase(item.retrieve('parentLinks').getFirst()));
			//item.store('childMenu',item.getNext('ul') || item.getNext('ol'));

			if(item.getChildren('ul') && item.getChildren('ul').length >= 1){
				var child_Menu = item.getChildren('ul');
				LiParent[index] = "";
			}else{
				var child_Menu = null;
			}
			item.store('childMenu', child_Menu);

			//determine submenu type
			theSubMenuType = 'subsequent';

			//console.log($(this.options.id).getElements('ul, ol'));
			//console.log(item.getParent(['body ul,ol']));
			
			//console.log($(item.getParent('ul') || item.getParent('ol') ));
			
			if( $(item.getParent('ul') || item.getParent('ol') ).id === this.options.id){theSubMenuType = 'initial';	}
			item.store('subMenuType',theSubMenuType );
			
			//add classes to parents
			if(theSubMenuType === 'initial' && $(item.getChildren('ul') || item.getChildren('ol') )){
				item.addClass('mainMenuParentBtn');
			}else if($(item.getChildren('ul') || item.getChildren('ol') )){
				item.addClass('subMenuParentBtn');
			}			
		}.bind(this));
		
		//rip the submenus apart into separate divs inside of subMenusContainer
		var subMenusContainer = new Element('div', { 'id': this.options.subMenusContainerId	}).inject( $(document.body) ,'bottom');
		var existing_index = new Array();
		$(this.options.id).getElements('ul').each(function(item,index){

			//remove the ul elements inside a moduletable div, the module content which can contain ul
			if(!item.getParent('div.moduletable')){

				//new index found, add it to existing index and create the div content
				if(item.getParent('span.grouped_sub_parent_item')){
					var parent_li_index = links.indexOf(item.getParent('span.grouped_sub_parent_item'));				
				}else{
					var parent_li_index = links.indexOf(item.getParent('li'));
				}
	
				if(!existing_index[parent_li_index]){
					existing_index[parent_li_index] = 1;
					if(item.getParent().retrieve('subMenuType') == 'initial'){
						var subMenusContainersmOW = new Element('div',{'class': 's5_sub_wrap', 'id': 'ul_child_'+parent_li_index}).inject(subMenusContainer);
					}else{
						var subMenusContainersmOW = new Element('div',{'class': 's5_sub_wrap_lower', 'id': 'ul_child_'+parent_li_index}).inject(subMenusContainer);					
					}
					var subMenusContainerUl = new Element('ul').inject(subMenusContainersmOW);
					var subMenusContainerLI = new Element('li',{'id': 'li_child_'+parent_li_index}).inject(subMenusContainerUl).grab(item);
					//var subMenusContainers = new Element('div',{'class': 'smOW', 'id': 'ul_child_'+parent_li_index}).inject(subMenusContainer).grab(item);
				}else{
				//found existing index, so just add extra ul to the existing content
					if($('li_child_'+parent_li_index)){
						$('li_child_'+parent_li_index).grab(item);
					}			
					//if($('ul_child_'+parent_li_index)){
					//	$('ul_child_'+parent_li_index).grab(item);					
					//}
				}
				
			}
		}.bind(this));

		//set tabindex to -1 so tabbing through links in page does not go through hidden links in submenus container, since arrow keys can be used to navigate through submenus
		subMenusContainer.getElements('a').set('tabindex','-1'); 

		links.each(function(item,index){
			//only apply to links with subMenus
			if (!item.retrieve('childMenu')) {return;}

			//update childMenu pointer to look at smOW DIVs
			item.store('childMenu', $('ul_child_'+index));//item.retrieve('childMenu').getParent('div')

			//add to allSubMenus array
			this.allSubMenus.include(item.retrieve('childMenu'));
			//this.allSubMenus.include($("ul_child_"+index).getFirst());
			
			//var li_ul_children = $("li_child_"+index).getChildren('ul');
			//li_ul_children.each(function(item, index){
			//	this.allSubMenus.include(item);
			//}, this);
			
			//store parentSubMenus
			item.store('parentSubMenus',item.retrieve('parentLinks').retrieve('childMenu'));

			//now create the MenuMaticSubMenu class instances 
			var aSubMenu = new MenuMaticSubMenu(this.options,this,item,index);

		}.bind(this));

		//attach event handlers to non-parent main menu buttons
		var nonParentBtns = $(this.options.id).getElements('li').filter(function(item, index){ return !item.retrieve('childMenu'); }); // silviu removed a
		//var nonParentBtns1 = $$('div.moduletable');

		//var nonParentBtns = nonParentBtns0.concat(nonParentBtns1);		
		nonParentBtns.each(function(item, index){
			item.addEvents({
				'mouseenter': function(e){					
					e = new Event(e).stop();
					this.hideAllSubMenusNow();	
					if(this.options.mmbClassName && this.options.mmbFocusedClassName){
						$(item).retrieve('btnMorph', new Fx.Morph(item, { 'duration':(this.options.duration/2), transition:this.options.physics, link:'cancel'})).start(this.options.mmbFocusedClassName); 
					}								
				}.bind(this),
				
				'focus': function(e){
					e = new Event(e).stop();
					this.hideAllSubMenusNow();	
					if(this.options.mmbClassName && this.options.mmbFocusedClassName){
						$(item).retrieve('btnMorph', new Fx.Morph(item, { 'duration':(this.options.duration/2), transition:this.options.physics, link:'cancel'})).start(this.options.mmbFocusedClassName); 
					}
				}.bind(this),
				
				'mouseleave':function(e){
					e = new Event(e).stop();
					if (this.options.mmbClassName && this.options.mmbFocusedClassName) {						
						$(item).retrieve('btnMorph', new Fx.Morph(item, { 'duration': (this.options.duration * 5),transition: this.options.physics,link: 'cancel'	})).start(this.options.mmbClassName);
					}	
				}.bind(this),
				
				'blur':function(e){
					e = new Event(e).stop();
					if (this.options.mmbClassName && this.options.mmbFocusedClassName) {						
						$(item).retrieve('btnMorph', new Fx.Morph(item, {	'duration': (this.options.duration * 5),transition: this.options.physics,link: 'cancel'	})).start(this.options.mmbClassName);
					}					
				}.bind(this),
				
				'keydown' : function(e){
				    var event = new Event(e);
					if (e.key === 'up' || e.key === 'down' || e.key === 'left' || e.key === 'right') {	e.stop();	}
					
					if( e.key === 'left' && this.options.orientation === 'horizontal' || 
						e.key === 'up' && this.options.orientation === 'vertical'){
						
						if(item.getParent('li').getPrevious('li')){
							item.getParent('li').getPrevious('li').getFirst('a').focus();
						}else{
							item.getParent('li').getParent().getLast('li').getFirst('a').focus();
						}
					}else if(e.key === 'right' && this.options.orientation === 'horizontal' || 
							 e.key === 'down' && this.options.orientation === 'vertical'){
						if(item.getParent('li').getNext('li')){
							item.getParent('li').getNext('li').getFirst('a').focus();
						}else{
							item.getParent('li').getParent().getFirst('li').getFirst('a').focus();
						}	
					}
				}.bind(this)
			});
		}, this);

/*		var modulecontent = $$('div.S5_menu_module_parent_group');
		alert(modulecontent);
		modulecontent.each(function(item, index){
			$(item).addClass('subMenuBtn');

			item.addEvents({
				'mouseenter': function(e){
					this.childMenu.fireEvent('show');
					this.cancellHideAllSubMenus();
					this.hideOtherSubMenus();
				}.bind(this),

				'focus': function(e){
					this.childMenu.fireEvent('show');
					this.cancellHideAllSubMenus();		
					this.hideOtherSubMenus();
				}.bind(this),
				
				'mouseleave': function(e){
					this.cancellHideAllSubMenus();
					this.hideAllSubMenus();					
				}.bind(this),
				
				'blur': function(e){
					this.cancellHideAllSubMenus();
					this.hideAllSubMenus();
				}.bind(this),
				
				'keydown' : function(e){
				    var event = new Event(e);
					
					if (e.key === 'up' || e.key === 'down' || e.key === 'left' || e.key === 'right' || e.key === 'tab') {	e.stop();	}
					
					if(e.key === 'up'){
						if(item.getParent('li').getPrevious('li')){
							//move focus to the next link up if possible
							item.getParent('li').getPrevious('li').getFirst('a').focus();
						}else if(this.options.direction.y ==='down'){
							//move focus to the parent link
							this.btn.focus();
						}else if(this.options.direction.y ==='up'){
							//move focus to the last link in the subMenu
							item.getParent('li').getParent().getLast('li').getFirst('a').focus();
						}
					}else if(e.key === 'down'){
						if(item.getParent('li').getNext('li')){
							//move focus to the next link down if possible
							item.getParent('li').getNext('li').getFirst('a').focus();
						}else if(this.options.direction.y ==='down'){
							//move focus to the first link in the submenu
							item.getParent('li').getParent().getFirst('li').getFirst('a').focus();
						}else if(this.options.direction.y ==='up'){
							//move focus to the parent link
							this.btn.focus();
						}
					}else if(e.key === this.options.direction.xInverse){
						this.btn.focus();
					}
				}.bind(this)
			});
			
		}, this);*/
		
		this.stretch();
		this.killDivider();
		this.center();
		this.fixHasLayoutBug();
		this.options.onInit_complete();		
    },
	
	fixHasLayoutBug:function(){
		if(Browser.Engine.trident && this.options.fixHasLayoutBug){
			$(this.options.id).getParents().setStyle('zoom',1);
			$(this.options.id).setStyle('zoom',1);
			$(this.options.id).getChildren().setStyle('zoom',1);
			$(this.options.subMenusContainerId).setStyle('zoom',1);
			$(this.options.subMenusContainerId).getChildren().setStyle('zoom',1);
		}
	},
	
	center:function(){
		if(!this.options.center){return;}
		$(this.options.id).setStyles({'left':'50%','margin-left': -($(this.options.id).getSize().x/2) });
	},
	
	stretch:function(){
		//stretch main menu btn widths to fit within the width of the parent UL or OL
		if(this.options.stretchMainMenu  && this.options.orientation === 'horizontal'){
			var targetWidth = parseFloat($(this.options.id).getCoordinates().width) ;
			var totalBtnWidth = 0;
			var mainBtns = $(this.options.id).getElements('li'); // silviu removed a
			mainBtns.setStyles({'padding-left':0,'padding-right':0});
			mainBtns.each(function(item,index){ totalBtnWidth+= item.getSize().x; }.bind(this));
			if(targetWidth < totalBtnWidth){return;}
			var increment = (targetWidth - totalBtnWidth)/ mainBtns.length;
			mainBtns.each(function(item,index){ item.setStyle('width',item.getSize().x+increment);	}.bind(this));
			mainBtns.getLast().setStyle('width',mainBtns.getLast().getSize().x-1);
		}
	},
	
	killDivider:function(){
		if(this.options.killDivider && this.options.killDivider.toLowerCase() === 'first'){
			$($(this.options.id).getElements('li')[0]).setStyles({'background':'none'});
		}else if(this.options.killDivider && this.options.killDivider.toLowerCase() === 'last'){
			$($(this.options.id).getElements('li').getLast()).setStyles({'background':'none'});
		}
	},

	hideAllSubMenusNow: function(){
		this.options.onHideAllSubMenusNow_begin();
		$clear(this.hideAllMenusTimeout);
		$$(this.allSubMenus).fireEvent('hide');
		this.options.onHideAllSubMenusNow_complete();	
	} 
	
});

var MenuMaticSubMenu = new Class({
	Implements: Options,
	Extends: MenuMatic,
    options: {
		onSubMenuInit_begin: (function(subMenuClass){}),
		onSubMenuInit_complete: (function(subMenuClass){}),
		
		onMatchWidth_begin: (function(subMenuClass){}),
		onMatchWidth_complete: (function(subMenuClass){}),
		
		onHideSubMenu_begin: (function(subMenuClass){}),
		onHideSubMenu_complete: (function(subMenuClass){}),
		
		onHideOtherSubMenus_begin: (function(subMenuClass){}),
		onHideOtherSubMenus_complete: (function(subMenuClass){}),		
		
		onHideAllSubMenus_begin: (function(subMenuClass){}),
		onHideAllSubMenus_complete: (function(subMenuClass){}),
		
		onPositionSubMenu_begin: (function(subMenuClass){}),
		onPositionSubMenu_complete: (function(subMenuClass){}),
		
		onShowSubMenu_begin: (function(subMenuClass){}),
		onShowSubMenu_complete: (function(subMenuClass){})
	},
	root:null,
	btn:null,
	hidden:true,
	myEffect:null,

	initialize: function(options,root,btn,current_index){
		this.setOptions(options);
		this.root = root;
		this.btn = btn;
		this.childMenu = this.btn.retrieve('childMenu');
		this.subMenuType = this.btn.retrieve('subMenuType');
		//this.childMenu = this.btn.retrieve('childMenu');
		this.parentSubMenus =  $$(this.btn.retrieve('parentSubMenus'));
		this.parentLinks =  $$(this.btn.retrieve('parentLinks'));
		this.parentSubMenu = $(this.parentSubMenus[0]);
		if(this.parentSubMenu ){this.parentSubMenu =this.parentSubMenu.retrieve('class');}
		this.childMenu.store('class',this);
		this.btn.store('class',this);
		this.childMenu.store('status','closed')
		
		this.options.onSubMenuInit_begin(this);		

		//add hide Event
		this.childMenu.addEvent('hide',function(){this.hideSubMenu();}.bind(this)); // silviu commented
		
		//add show Event
		this.childMenu.addEvent('show',function(){this.showSubMenu();}.bind(this));

		if(this.options.effect){
			this.myEffect = new Fx.Morph(
				$(this.childMenu).getFirst(), {	duration: this.options.duration, transition: this.options.physics,  link: 'cancel' } 
			);
		}
		if(this.options.effect === 'slide' || this.options.effect === 'slide & fade'){
			if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' ) {
				this.childMenu.getFirst().setStyle('margin-top','0' );
			}else {
				this.childMenu.getFirst().setStyle('margin-left', '0');
			}
			
		}else if (this.options.effect === 'fade' || this.options.effect === 'slide & fade'){
			this.childMenu.getFirst().setStyle('opacity',0 );
		}
		
		if (this.options.effect != 'fade' && this.options.effect != 'slide & fade') {
			this.childMenu.getFirst().setStyle('opacity',this.options.opacity);
		}

		this.childMenu.getFirst().setStyle('float','left');
		
		//attach event handlers to non-parent sub menu buttons
		//var nonParentBtns = $(this.childMenu).getElements('li').filter(function(item, index){ return !item.retrieve('childMenu'); });
		var nonParentBtnsP = $("li_child_"+current_index).getElements('ul');
		nonParentBtnsP.each(function(item, index){
			var nonParentBtns = item.getElements('li').filter(function(item, index){ return !item.retrieve('childMenu'); });
			nonParentBtns.each(function(item, index){
				$(item).addClass('subMenuBtn');
	
				item.addEvents({
					'mouseenter': function(e){
						this.childMenu.fireEvent('show');
						this.cancellHideAllSubMenus();
						this.hideOtherSubMenus();
					}.bind(this),
	
					'focus': function(e){
						this.childMenu.fireEvent('show');
						this.cancellHideAllSubMenus();		
						this.hideOtherSubMenus();
					}.bind(this),
					
					'mouseleave': function(e){
						this.cancellHideAllSubMenus();
						this.hideAllSubMenus();					
					}.bind(this),
					
					'blur': function(e){
						this.cancellHideAllSubMenus();
						this.hideAllSubMenus();
					}.bind(this),
					
					'keydown' : function(e){
						var event = new Event(e);
						
						if (e.key === 'up' || e.key === 'down' || e.key === 'left' || e.key === 'right' || e.key === 'tab') {	e.stop();	}
						
						if(e.key === 'up'){
							if(item.getParent('li').getPrevious('li')){
								//move focus to the next link up if possible
								item.getParent('li').getPrevious('li').getFirst('a').focus();
							}else if(this.options.direction.y ==='down'){
								//move focus to the parent link
								this.btn.focus();
							}else if(this.options.direction.y ==='up'){
								//move focus to the last link in the subMenu
								item.getParent('li').getParent().getLast('li').getFirst('a').focus();
							}
						}else if(e.key === 'down'){
							if(item.getParent('li').getNext('li')){
								//move focus to the next link down if possible
								item.getParent('li').getNext('li').getFirst('a').focus();
							}else if(this.options.direction.y ==='down'){
								//move focus to the first link in the submenu
								item.getParent('li').getParent().getFirst('li').getFirst('a').focus();
							}else if(this.options.direction.y ==='up'){
								//move focus to the parent link
								this.btn.focus();
							}
						}else if(e.key === this.options.direction.xInverse){
							this.btn.focus();
						}
					}.bind(this)
				});
				
			}, this);
		}, this);		
		
		$(this.btn).removeClass('subMenuBtn');
		
		if (this.subMenuType == 'initial') {
			this.btn.addClass('mainParentBtn');	
		}else{	
			this.btn.addClass('subParentBtn');	
		}

		//attach event handlers to parent button
		$(this.btn).addEvents({
			'mouseenter' : function(e){
				e = new Event(e).stop();
				this.cancellHideAllSubMenus();
				this.hideOtherSubMenus();
				//alert(this.btn.getParent('ul').getStyle('opacity'));
				//alert(this.options.opacity);
				//if(this.options.opacity == this.btn.getParent('ul').getStyle('opacity') || this.btn.getParent('ul').getStyle('opacity') == 1){
					this.showSubMenu();//.delay(10)
				//}
				if(this.subMenuType === 'initial' && this.options.mmbClassName && this.options.mmbFocusedClassName){
					$(this.btn).retrieve('btnMorph', new Fx.Morph($(this.btn), { 'duration':(this.options.duration/2), transition:this.options.physics, link:'cancel' })).start(this.options.mmbFocusedClassName);
				}
			}.bind(this),
			
			'focus' : function(e){
				e = new Event(e).stop();
				this.cancellHideAllSubMenus();
				this.hideOtherSubMenus();
				this.showSubMenu();
				if(this.subMenuType === 'initial' && this.options.mmbClassName && this.options.mmbFocusedClassName){
					$(this.btn).retrieve('btnMorph', new Fx.Morph($(this.btn), { 'duration':(this.options.duration/2), transition:this.options.physics, link:'cancel' })).start(this.options.mmbFocusedClassName);
				}
			}.bind(this),
				
			'mouseleave': function(e){
				e = new Event(e).stop();
				this.cancellHideAllSubMenus();
				this.hideAllSubMenus();
			}.bind(this),
			
			'blur': function(e){
				e = new Event(e).stop();
				this.cancellHideAllSubMenus();
				this.hideAllSubMenus();
			}.bind(this),
			
			'keydown' : function(e){
			    e = new Event(e)
				if (e.key === 'up' || e.key === 'down' || e.key === 'left' || e.key === 'right') {	e.stop();	}
				
				if(!this.parentSubMenu){
					//main menu parent buttons
					if(
						this.options.orientation === 'horizontal' && e.key === this.options.direction.y ||
						this.options.orientation === 'vertical' && e.key === this.options.direction.x
					){
						if(this.options.direction.y ==='down'){
							//move focus to the first link in the child menu
							this.childMenu.getFirst().getFirst('li').getFirst('a').focus();
						}else if(this.options.direction.y ==='up'){
							//move focus to the first link in the child menu
							this.childMenu.getFirst().getLast('li').getFirst('a').focus();
						}
					}else if(
						this.options.orientation === 'horizontal' && e.key === 'left' ||
						this.options.orientation === 'vertical' && e.key === this.options.direction.yInverse 
					){
						//move focus to the previous link if possible, if not, move focus to the last link in the menu
						if(this.btn.getParent().getPrevious()){
							this.btn.getParent().getPrevious().getFirst().focus();
						}else{
							this.btn.getParent().getParent().getLast().getFirst().focus();
						}
					}else if(
						this.options.orientation === 'horizontal' && e.key === 'right' ||
						this.options.orientation === 'vertical' && e.key === this.options.direction.y 
					){
						//move focus to the next link if possible, if not, move focus to the first link in the menu
						if (this.btn.getParent().getNext()) {
							this.btn.getParent().getNext().getFirst().focus();
						}else{
							this.btn.getParent().getParent().getFirst().getFirst().focus();
						}
					}
				}else{
					if(e.key === 'tab'){e.stop();}
					//submenu parent buttons
					if (e.key === 'up') {
						if (this.btn.getParent('li').getPrevious('li')) {
							//move focus to the next link up
							this.btn.getParent('li').getPrevious('li').getFirst('a').focus();
						}else if(this.options.direction.y === 'down'){
							//move focus to the parent link
							this.parentSubMenu.btn.focus();
						}else if(this.options.direction.y === 'up'){
							//move focus to the bottom link in this submenu
							this.btn.getParent('li').getParent().getLast('li').getFirst('a').focus();
						}
					}else if(e.key === 'down'){
						if(this.btn.getParent('li').getNext('li')){
							//move focus to the next link down
							this.btn.getParent('li').getNext('li').getFirst('a').focus();
						}else if(this.options.direction.y === 'down'){
							//move focus to the top link in this submenu
							this.btn.getParent('li').getParent().getFirst('li').getFirst('a').focus();
						}else if(this.options.direction.y === 'up'){
							//move focus to the parent link
							this.parentSubMenu.btn.focus();
						}
					}else if(e.key === this.options.direction.xInverse){
						this.parentSubMenu.btn.focus();
					}else if(e.key === this.options.direction.x){
						if(this.options.direction.y === 'down'){
							this.childMenu.getFirst().getFirst('li').getFirst('a').focus();
						}else if(this.options.direction.y === 'up'){
						//	this.childMenu.getFirst().getLast('li').getFirst('a').focus();
						}
					}
				}
			}.bind(this)	
		});
		
		this.options.onSubMenuInit_complete(this);
		
    },
	
	matchWidth:function(){
		if (this.widthMatched || !this.options.matchWidthMode || this.subMenuType === 'subsequent'){return;}
		this.options.onMatchWidth_begin(this);
		var parentWidth = this.btn.getCoordinates().width;
		$(this.childMenu).getElements('li').each(function(item,index){// silviu removed a
			var borderWidth = parseFloat($(this.childMenu).getFirst().getStyle('border-left-width')) + parseFloat($(this.childMenu).getFirst().getStyle('border-right-width'));
			var paddingWidth = parseFloat(item.getStyle('padding-left')) +	 parseFloat(item.getStyle('padding-right'));
			var offset = borderWidth + paddingWidth ;
			if(parentWidth > item.getCoordinates().width){
				item.setStyle('width',parentWidth - offset);
				item.setStyle('margin-right',-borderWidth);
			}
		}.bind(this));
		this.width = this.childMenu.getFirst().getCoordinates().width;
		this.widthMatched = true;
		this.options.onMatchWidth_complete(this);
	},
	
	hideSubMenu: function() {	
		if(this.childMenu.retrieve('status') === 'closed'){return;}	
		this.options.onHideSubMenu_begin(this);
		if (this.subMenuType == 'initial') {
			if(this.options.mmbClassName && this.options.mmbFocusedClassName){
				$(this.btn).retrieve('btnMorph', new Fx.Morph($(this.btn), { 'duration':(this.options.duration), transition:this.options.physics, link:'cancel' })).start(this.options.mmbClassName )
				.chain(function(){
					$(this.btn).removeClass('mainMenuParentBtnFocused');
					$(this.btn).addClass('mainMenuParentBtn');
				}.bind(this));
			}else{
				$(this.btn).removeClass('mainMenuParentBtnFocused');
				$(this.btn).addClass('mainMenuParentBtn');
			}
		}else{
			$(this.btn).removeClass('subMenuParentBtnFocused');
			$(this.btn).addClass('subMenuParentBtn');
		}
		
		this.childMenu.setStyle('z-index',1);
		
		if(this.options.effect && this.options.effect.toLowerCase() === 'slide'){
			if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' && this.options.direction.y === 'down') {
				this.myEffect.start({ 'margin-top': -this.height }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' && this.options.direction.y === 'up') {
				this.myEffect.start({ 'margin-top': this.height }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if(this.options.direction.x === 'right'){
				this.myEffect.start({ 'margin-left': -this.width }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if(this.options.direction.x === 'left'){
				this.myEffect.start({ 'margin-left': this.width }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}
		}else if(this.options.effect == 'fade'){
			this.myEffect.start({ 'opacity': 0 }).chain(function(){	
			this.childMenu.style.left = "0px";
			this.childMenu.style.display = "none";	}.bind(this));
		}else if(this.options.effect == 'slide & fade'){

			if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' && this.options.direction.y === 'down') {
				this.myEffect.start({ 'margin-top': -this.height,opacity:0 }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' && this.options.direction.y === 'up') {
				this.myEffect.start({ 'margin-top': this.height,opacity:0 }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if(this.options.direction.x === 'right'){
				this.myEffect.start({ 'margin-left': -this.width,opacity:0 }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}else if(this.options.direction.x === 'left'){
				this.myEffect.start({ 'margin-left': this.width, opacity:0 }).chain(function(){	
				this.childMenu.style.left = "0px";
				this.childMenu.style.display = "none";	}.bind(this));
			}
		}else{
			this.childMenu.style.left = "0px";
			this.childMenu.style.display = "none";
		}
		this.childMenu.store('status','closed');
		this.options.onHideSubMenu_complete(this);
	},
	
	hideOtherSubMenus: function() {		
		this.options.onHideOtherSubMenus_begin(this);
		//set up otherSubMenus element collection
		if(!this.btn.retrieve('otherSubMenus')){
			this.btn.store('otherSubMenus', $$(this.root.allSubMenus.filter(function(item){ return !this.btn.retrieve('parentSubMenus').contains(item) && item != this.childMenu; }.bind(this)) ));
		}

		this.parentSubMenus.fireEvent('show');
		this.btn.retrieve('otherSubMenus').fireEvent('hide');
		this.options.onHideOtherSubMenus_complete(this);
	},
	
	hideAllSubMenus: function(){
		this.options.onHideAllSubMenus_begin(this);
		$clear(this.root.hideAllMenusTimeout);
		this.root.hideAllMenusTimeout = (function(){
			$clear(this.hideAllMenusTimeout);
			$$(this.root.allSubMenus).fireEvent('hide');			
		}).bind(this).delay(this.options.hideDelay);
		this.options.onHideAllSubMenus_complete(this);		
	},

	cancellHideAllSubMenus: function(){ 
		$clear(this.root.hideAllMenusTimeout);	
	},
	
	showSubMenu: function(){
		S5DisplayMenusTimeout = (function(){
			this.S5showSubMenu();			
		}).bind(this).delay(this.options.displayDelay);		
	},
	
	S5showSubMenu: function(now){
		if(this.childMenu.retrieve('status') === 'open'){return;}
		this.options.onShowSubMenu_begin(this);
		if (this.subMenuType == 'initial') {
			$(this.btn).removeClass('mainMenuParentBtn');
			$(this.btn).addClass('mainMenuParentBtnFocused');	
		}else{
			$(this.btn).removeClass('subMenuParentBtn');
			$(this.btn).addClass('subMenuParentBtnFocused');
		}
		this.root.subMenuZindex++;
		this.childMenu.setStyles({'display':'block','visibility':'hidden','z-index':this.root.subMenuZindex});

		if(!this.width || !this.height ){
			//this.height = this.childMenu.getFirst().getCoordinates().height;
			//silviu changes to get all the childrens content height
			//this.height = 0;

			this.height = this.childMenu.getFirst().getComputedSize()['totalHeight'];

			//this.Children_li = this.childMenu.getFirst().getChildren();
			//this.Children_li.each(function(item,index){
			//	this.Children_height = item.getFirst().getChildren();
			//	this.Children_height.each(function(item,index){
			//		this.height = this.height + item.getSize().y;
			//	}.bind(this));
			//}.bind(this));
			//silviu changes to get all the childrens content height			
			
			//this.width = this.childMenu.getFirst().getCoordinates().width;
			this.width = this.childMenu.getFirst().getComputedSize()['totalWidth'];
			
			this.childMenu.setStyle('height',this.height,'border');
			if(this.options.effect === 'slide' || this.options.effect === 'slide & fade'){
				if (this.subMenuType == 'initial' && this.options.orientation === 'horizontal' ) {					
					this.childMenu.getFirst().setStyle('margin-top','0' );					
					if(this.options.direction.y === 'down'){
						this.myEffect.set({ 'margin-top': - this.height });
					}else if(this.options.direction.y === 'up'){
						this.myEffect.set({ 'margin-top': this.height });
					}					
				}else {
					if(this.options.direction.x === 'left'){
						this.myEffect.set({ 'margin-left': this.width });
					}else{
						this.myEffect.set({ 'margin-left': -this.width });
					}
				}
			}
		}	
		this.matchWidth();
		this.positionSubMenu();
		
		if(this.options.effect === 'slide' ){
			this.childMenu.setStyles({'display':'block','visibility':'visible'});
			if (this.subMenuType === 'initial' && this.options.orientation === 'horizontal') {
				if(now){
					this.myEffect.set({ 'margin-top': 0 }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}else{
					this.myEffect.start({ 'margin-top': 0 }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}
			}else{
				if (now) {
					this.myEffect.set({ 'margin-left': 0 }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}else{
					this.myEffect.start({ 'margin-left': 0 }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}
			}
		}else if(this.options.effect === 'fade' ){
			this.childMenu.setStyles({'display':'block','visibility':'visible'});
			if (now) {
				this.myEffect.set({'opacity': this.options.opacity}).chain(function(){	this.showSubMenuComplete();	}.bind(this));
			}else{
				this.myEffect.start({'opacity': this.options.opacity}).chain(function(){	this.showSubMenuComplete();	}.bind(this));
			}
		}else if(this.options.effect == 'slide & fade'){
			this.childMenu.setStyles({'display':'block','visibility':'visible'});
			this.childMenu.getFirst().setStyles({'left':0});
			if (this.subMenuType === 'initial' && this.options.orientation === 'horizontal') {
				if (now) {
					this.myEffect.set({ 'margin-top': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}else{
					this.myEffect.start({ 'margin-top': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
				}
			}else{
				if (now) {
					if (this.options.direction.x === 'right') {
						this.myEffect.set({ 'margin-left': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
					}else if (this.options.direction.x === 'left') {
						this.myEffect.set({ 'margin-left': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
					}	
				}else{
					if (this.options.direction.x === 'right') {						
						this.myEffect.set({ 'margin-left': -this.width, 'opacity': this.options.opacity });						
						this.myEffect.start({ 'margin-left': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
					}else if (this.options.direction.x === 'left') {
						this.myEffect.start({ 'margin-left': 0, 'opacity': this.options.opacity }).chain(function(){	this.showSubMenuComplete();	}.bind(this));
					}
				}
			}
		}else{
			this.childMenu.setStyles({'display':'block','visibility':'visible'}).chain(function(){	this.showSubMenuComplete(this);	}.bind(this));
		}
		this.childMenu.store('status','open');
	},

	showSubMenuComplete:function(){
		this.options.onShowSubMenu_complete(this);
		//alert(this.btn.getPosition().y);
		//alert(this.childMenu.getPosition().y);
		//alert($(this.btn.getParent('div')).id);

		//alert(this.btn.getParent('div').style.top);
		//alert(this.btn.getCoordinates().top);
		//alert(this.childMenu.getCoordinates().top);
		//alert(this.childMenu.style.top);

		//S5 - silviu - rearange the submenu if mouse over fast bug
		if(this.childMenu.style.top != this.btn.getCoordinates().top && this.btn.getCoordinates().top != $(this.options.id).getCoordinates().top){
			//$(this.childMenu).setStyle('top', this.btn.getCoordinates().top);
			//this.myEffect.start({'top': this.btn.getCoordinates().top}).chain(function(){ this.showSubMenuComplete(); }.bind(this));
			var S5_reposition = new Fx.Morph($(this.childMenu), { 'duration':(this.options.duration), transition:this.options.physics, link:'cancel' });
			if(this.btn.retrieve('subMenuType') == 'initial'){
				S5_reposition.start({
					'top': [this.childMenu.style.top, this.btn.getCoordinates().bottom] // Morphs the 'height' style from 10px to 100px.
				});
			}else{
				S5_reposition.start({
					'top': [this.childMenu.style.top, this.btn.getCoordinates().top] // Morphs the 'height' style from 10px to 100px.
				});				
			}
		}
	},
	
	positionSubMenu: function(){
		this.options.onPositionSubMenu_begin(this);
		this.childMenu.setStyle('width',this.width) ;
		this.childMenu.getFirst().setStyle('width',this.width) ;

		//if parent is ltr className all childrens must be ltr 
		if(this.btn.getParent('div').className == 's5_sub_wrap_rtl' || this.btn.getParent('div').className == 's5_sub_wrap_lower_rtl'){
			//this.childMenu.className = 's5_sub_wrap_rtl';
			this.childMenu.className = 's5_sub_wrap_lower_rtl';			
		}

		//if any parent has bounced off a viewport edge, inherit that new direction
		if (this.subMenuType === 'subsequent') {
			if(this.parentSubMenu && this.options.direction.x != this.parentSubMenu.options.direction.x){
				if(this.parentSubMenu.options.direction.x === 'left' && this.options.effect && this.options.effect.contains('slide')){
					this.myEffect.set({ 'margin-left': this.width });	
				}
			}
			this.options.direction.x = this.parentSubMenu.options.direction.x;
			this.options.direction.xInverse = this.parentSubMenu.options.direction.xInverse;
			this.options.direction.y = this.parentSubMenu.options.direction.y;
			this.options.direction.yInverse = this.parentSubMenu.options.direction.yInverse;
		}

		var top;
		var overlap
		if(this.subMenuType == 'initial'){
			if(	this.options.direction.y === 'up'){				
				if(this.options.orientation === 'vertical'){
					top = this.btn.getCoordinates().bottom - this.height + this.options.tweakInitial.y ;
				}else{			
					top = this.btn.getCoordinates().top - this.height + this.options.tweakInitial.y ;
				}
				this.childMenu.style.top = top+ 'px';
			}else if(this.options.orientation == 'horizontal'){			
				this.childMenu.style.top = this.btn.getCoordinates().bottom + this.options.tweakInitial.y + 'px';
			}else if(this.options.orientation == 'vertical'){
				top = this.btn.getPosition().y + this.options.tweakInitial.y ;				
				if((top + this.childMenu.getSize().y) >= $(document.body).getScrollSize().y){
					overlap = (top + this.childMenu.getSize().y) - $(document.body).getScrollSize().y  ;
					top = top - overlap - 20;
				}	
				this.childMenu.style.top = top+ 'px';
			}
			if(	this.options.orientation == 'horizontal'){
				var child_width = this.childMenu.getSize().x;
				var mouse_poz = this.btn.getPosition().x;
				var btn_width = this.btn.getSize().x;
				//console.log(this.btn.getComputedSize().totalWidth);
				//var sceen = screen.width;
				var sceen = $(window).getWidth();
				 
				if(this.options.direction.x == 'left'){
/*					if((child_width + mouse_poz) > sceen){
						this.childMenu.style.left = (this.btn.getPosition().x - child_width + btn_width) + 'px';
					}else{
						//this.childMenu.style.left = this.btn.getPosition().x + this.options.tweakInitial.x + 'px';
						this.childMenu.style.left = this.btn.getCoordinates().right - this.childMenu.getSize().x + this.options.tweakInitial.x + 'px';					
					}*/
					//alert(this.btn.getPosition().x);
						//alert(child_width );
					if(( mouse_poz - child_width ) < 0 ){//console.log('debug1');
					//alert(1);
					//alert(sceen-child_width );
						//if(this.btn.getPosition().x + this.options.tweakInitial.x+child_width > sceen){console.log('debug3');
						
							if(this.btn.getPosition().x - child_width + btn_width < 0 && this.btn.getPosition().x+child_width>sceen ){//console.log(this.btn.getPosition().x + child_width > sceen);
							this.childMenu.style.width='auto';
							this.childMenu.style.height='auto';
							this.childMenu.style['cssFloat']='none';
							this.childMenu.getChildren().each(function(tt,ii){
								$(tt).style.float='none';
								if(document.all)
									$(tt).style['styleFloat']='none';
								else
									$(tt).style['cssFloat']='none';
								
								//$(tt).setAttribute('style','float:none;');
								$(tt).style.width='auto';
								
								var zz=tt.childNodes;
								
								for(var x=0;x<zz.length;x++){
									var zzz=zz[x].childNodes;
									
									for(var y=0;y<zzz.length;y++){
										zzz[y].style.float='none';
										if(document.all)
											zzz[y].style['styleFloat']='none';
										else
											zzz[y].style['cssFloat']='none';
										//zzz[y].setAttribute('style','float:none;');
										//console.log(zzz[y].style.float);
										//console.log(zzz[y].style);
									}
								}
							});
						}else{
							this.childMenu.style.width='auto';
							this.childMenu.style['cssFloat']='left';
							this.childMenu.getChildren().each(function(tt,ii){
								$(tt).style.float='left';
								if(document.all)
									$(tt).style['styleFloat']='left';
								else
									$(tt).style['cssFloat']='left';
								$(tt).style.width='auto';
								
								var zz=tt.childNodes;
								for(var x=0;x<zz.length;x++){
									var zzz=zz[x].childNodes;
									for(var y=0;y<zzz.length;y++){
										zzz[y].style.float='left';
										if(document.all)
											zzz[y].style['styleFloat']='left';
										else
											zzz[y].style['cssFloat']='left';
									}
								}
							});
						}
						child_width=this.childMenu.getSize().x;
						if(this.btn.getPosition().x-child_width+btn_width < 0){
							toleft=this.btn.getPosition().x;
							need=1;
							toleft-=24; // left+right padding of the menu item class 
						}else {
							toleft=this.btn.getPosition().x-child_width+btn_width;
							need=0;
						}
							
					/*	if(child_width+this.btn.getPosition().x < sceen)
							toleft=this.btn.getPosition().x;
						else{
							//var toleft=this.btn.getPosition().x - child_width + btn_width;
							var toleft=this.btn.getPosition().x + this.options.tweakInitial.x;
							if(toleft < 0)
								toleft=this.btn.getPosition().x;
						}*/
						//this.childMenu.style.background='white';
						this.childMenu.style.left = toleft+ 'px';
	
						//this.childMenu.style.left = toleft + 'px';
						if(need)
						this.childMenu.className = 's5_sub_wrap_rtl';			
						else 			this.childMenu.className = 's5_sub_wrap';			
					}else{//console.log('debug2');
					//alert(2);
						this.childMenu.style.width='auto';
						this.childMenu.style['cssFloat']='left';
						this.childMenu.style.float='left';
						//(this.childMenu.style.float);
						//console.log(this.childMenu.style);
						//console.log(this.childMenu.id);
						this.childMenu.getChildren().each(function(tt,ii){
							$(tt).style.float='left';
							if(document.all)
									$(tt).style['styleFloat']='left';
								else
									$(tt).style['cssFloat']='left';
							$(tt).style.width='auto';
							
							var zz=tt.childNodes;
							for(var x=0;x<zz.length;x++){
								var zzz=zz[x].childNodes;
								for(var y=0;y<zzz.length;y++){
									zzz[y].style.float='left';
									if(document.all)
											zzz[y].style['styleFloat']='left';
										else
											zzz[y].style['cssFloat']='left';
								}
							}
						});
						this.childMenu.className = 's5_sub_wrap';	
						this.childMenu.style.marginLeft='5px';		
						//this.childMenu.style.background='white';
						//this.childMenu.style.left = this.btn.getPosition().x + this.options.tweakInitial.x + 'px';
						this.childMenu.style.left = (this.btn.getPosition().x - child_width + btn_width) + 'px';//this.btn.getPosition().x + this.options.tweakInitial.x + 'px';
					}					
				}else{
					//console.log(this.childMenu.innerHTML);
					if((child_width + mouse_poz) > sceen){
						
						
						if(this.btn.getPosition().x - child_width + btn_width < 0){
							this.childMenu.style.width='auto';
							this.childMenu.style.height='auto';
							this.childMenu.style['cssFloat']='none';
							this.childMenu.getChildren().each(function(tt,ii){
								$(tt).style.float='none';
								if(document.all)
									$(tt).style['styleFloat']='none';
								else
									$(tt).style['cssFloat']='none';
								
								//$(tt).setAttribute('style','float:none;');
								$(tt).style.width='auto';
								
								var zz=tt.childNodes;
								
								for(var x=0;x<zz.length;x++){
									var zzz=zz[x].childNodes;
									
									for(var y=0;y<zzz.length;y++){
										zzz[y].style.float='none';
										if(document.all)
											zzz[y].style['styleFloat']='none';
										else
											zzz[y].style['cssFloat']='none';
										//zzz[y].setAttribute('style','float:none;');
										//console.log(zzz[y].style.float);
										//console.log(zzz[y].style);
									}
								}
							});
							this.childMenu.className='s5_sub_wrap_rtl';
						}else{
							this.childMenu.style.width='auto';
							this.childMenu.style['cssFloat']='left';
							this.childMenu.getChildren().each(function(tt,ii){
								$(tt).style.float='left';
								if(document.all)
									$(tt).style['styleFloat']='left';
								else
									$(tt).style['cssFloat']='left';
								$(tt).style.width='auto';
								
								var zz=tt.childNodes;
								for(var x=0;x<zz.length;x++){
									var zzz=zz[x].childNodes;
									for(var y=0;y<zzz.length;y++){
										zzz[y].style.float='left';
										if(document.all)
											zzz[y].style['styleFloat']='left';
										else
											zzz[y].style['cssFloat']='left';
									}
								}
							});
						}
						child_width=this.childMenu.getSize().x;
						if(child_width+this.btn.getPosition().x < sceen)
							toleft=this.btn.getPosition().x;
						else{
							var toleft=this.btn.getPosition().x - child_width + btn_width;
							if(toleft < 0)
								toleft=this.btn.getPosition().x;
						}
						//this.childMenu.style.background='white';
						this.childMenu.style.left = toleft+ 'px';
						if(child_width+this.btn.getPosition().x < sceen)this.childMenu.className = 's5_sub_wrap';
						else this.childMenu.className = 's5_sub_wrap_rtl';						
					}else{
						this.childMenu.style.width='auto';
						this.childMenu.style['cssFloat']='left';
						this.childMenu.getChildren().each(function(tt,ii){
							$(tt).style.float='left';
							if(document.all)
									$(tt).style['styleFloat']='left';
								else
									$(tt).style['cssFloat']='left';
							$(tt).style.width='auto';
							
							var zz=tt.childNodes;
							for(var x=0;x<zz.length;x++){
								var zzz=zz[x].childNodes;
								for(var y=0;y<zzz.length;y++){
									zzz[y].style.float='left';
									if(document.all)
											zzz[y].style['styleFloat']='left';
										else
											zzz[y].style['cssFloat']='left';
								}
							}
						});
						this.childMenu.className = 's5_sub_wrap';			
						//this.childMenu.style.background='white';
						this.childMenu.style.left = this.btn.getPosition().x + this.options.tweakInitial.x + 'px';
					}					
				}
			}else if(this.options.direction.x == 'left'){
				this.childMenu.style.left = this.btn.getPosition().x - this.childMenu.getCoordinates().width + this.options.tweakInitial.x + 'px';
			}else if(this.options.direction.x == 'right'){
				this.childMenu.style.left = this.btn.getCoordinates().right + this.options.tweakInitial.x + 'px';
			}
		}else if(this.subMenuType == 'subsequent'){
			if(this.options.direction.y === 'down'){
				if( (this.btn.getCoordinates().top + this.options.tweakSubsequent.y+ this.childMenu.getSize().y) >= $(document.body).getScrollSize().y ){
					overlap =  (this.btn.getCoordinates().top + this.options.tweakSubsequent.y+ this.childMenu.getSize().y) -$(document.body).getScrollSize().y  ;
					this.childMenu.style.top = (this.btn.getCoordinates().top + this.options.tweakSubsequent.y) - overlap - 20+ 'px';
				}else{
					this.childMenu.style.top = this.btn.getCoordinates().top + this.options.tweakSubsequent.y + 'px';
				}
			}else if(this.options.direction.y === 'up'){
				if((this.btn.getCoordinates().bottom - this.height + this.options.tweakSubsequent.y)< 1){
					this.options.direction.y = 'down';
					this.options.direction.yInverse = 'up';
					this.childMenu.style.top = this.btn.getCoordinates().top + this.options.tweakSubsequent.y + 'px';
				}else{
					this.childMenu.style.top = this.btn.getCoordinates().bottom - this.height + this.options.tweakSubsequent.y + 'px';
				}
			}
			if(this.options.direction.x == 'left'){
				this.childMenu.style.left = this.btn.getCoordinates().left - this.childMenu.getCoordinates().width + this.options.tweakSubsequent.x + 'px';
				
				if( this.childMenu.getPosition().x < 0){
					this.options.direction.x = 'right';
					this.options.direction.xInverse = 'left';
					
					this.childMenu.style.left = this.btn.getPosition().x + this.btn.getCoordinates().width + this.options.tweakSubsequent.x + 'px';
					this.childMenu.className = 's5_sub_wrap_lower_rtl';
					
					if(this.options.effect === 'slide' || this.options.effect === 'slide & fade'){
						this.myEffect.set({ 'margin-left': -this.width, 'opacity': this.options.opacity });						
					}
				}
			}else if(this.options.direction.x == 'right'){	
				this.childMenu.style.left = this.btn.getCoordinates().right + this.options.tweakSubsequent.x + 'px';
				var smRight = this.childMenu.getCoordinates().right;
				var viewportRightEdge = document.getCoordinates().width + window.getScroll().x;				
				if( smRight > viewportRightEdge ){
					this.options.direction.x = 'left';
					this.options.direction.xInverse = 'right';					
					
					var child_width = this.childMenu.getSize().y;
					var mouse_poz = this.btn.getPosition().x;
					//var sceen = screen.height;
					//var sceen = screen.width;
					var sceen = $(window).getWidth();
					//if((child_width + mouse_poz) > sceen){						
						//this.childMenu.style.top = 0 + 'px';
						//this.childMenu.style.right = 0 + 'px';
					//}
					if((child_width + mouse_poz) > sceen){						
						this.childMenu.style.right = this.btn.getCoordinates().left + this.options.tweakSubsequent.x + 'px';
					}					
					else{
						this.childMenu.style.left = this.btn.getCoordinates().left - this.childMenu.getCoordinates().width + this.options.tweakSubsequent.x + 'px';
						this.childMenu.className = 's5_sub_wrap_lower_rtl';
					}
					
					if (this.options.effect === 'slide' || this.options.effect === 'slide & fade') {
						this.myEffect.set({	'margin-left': this.width,	'opacity': this.options.opacity	});
					}
				}
			}
		}
		this.options.onPositionSubMenu_complete(this);
	}
});


function s5_create_separator_class() {
if (document.getElementById("subMenusContainer")) {
var s5_create_separator_class = document.getElementById("subMenusContainer").getElementsByTagName("A");
	for (var s5_create_separator_class_z=0; s5_create_separator_class_z<s5_create_separator_class.length; s5_create_separator_class_z++) {
		if (s5_create_separator_class[s5_create_separator_class_z].href == "javascript:;") {
		if (s5_create_separator_class[s5_create_separator_class_z].parentNode.className == "S5_submenu_item") {
			s5_create_separator_class[s5_create_separator_class_z].parentNode.parentNode.className = s5_create_separator_class[s5_create_separator_class_z].parentNode.parentNode.className + " subSepBtn";
		}
		}
	}
}
}
window.onload = s5_create_separator_class;
