
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
window.matchMedia = window.matchMedia || (function(doc, undefined){
  
  var bool,
      docElem  = doc.documentElement,
      refNode  = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement('body'),
      div      = doc.createElement('div');
  
  div.id = 'mq-test-1';
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);
  
  return function(q){
    
    div.innerHTML = '&shy;<style media="'+q+'"> #mq-test-1 { width: 42px; }</style>';
    
    docElem.insertBefore(fakeBody, refNode);
    bool = div.offsetWidth == 42;  
    docElem.removeChild(fakeBody);
    
    return { matches: bool, media: q };
  };
  
})(document);




/*! Respond.js v1.1.0: min/max-width media query polyfill. (c) Scott Jehl. MIT/GPLv2 Lic. j.mp/respondjs  */
(function( win ){
	//exposed namespace
	win.respond		= {};
	
	//define update even in native-mq-supporting browsers, to avoid errors
	respond.update	= function(){};
	
	//expose media query support flag for external use
	respond.mediaQueriesSupported	= win.matchMedia && win.matchMedia( "only all" ).matches;
	
	//if media queries are supported, exit here
	if( respond.mediaQueriesSupported ){ return; }
	
	//define vars
	var doc 			= win.document,
		docElem 		= doc.documentElement,
		mediastyles		= [],
		rules			= [],
		appendedEls 	= [],
		parsedSheets 	= {},
		resizeThrottle	= 30,
		head 			= doc.getElementsByTagName( "head" )[0] || docElem,
		base			= doc.getElementsByTagName( "base" )[0],
		links			= head.getElementsByTagName( "link" ),
		requestQueue	= [],
		
		//loop stylesheets, send text content to translate
		ripCSS			= function(){
			var sheets 	= links,
				sl 		= sheets.length,
				i		= 0,
				//vars for loop:
				sheet, href, media, isCSS;

			for( ; i < sl; i++ ){
				sheet	= sheets[ i ],
				href	= sheet.href,
				media	= sheet.media,
				isCSS	= sheet.rel && sheet.rel.toLowerCase() === "stylesheet";

				//only links plz and prevent re-parsing
				if( !!href && isCSS && !parsedSheets[ href ] ){
					// selectivizr exposes css through the rawCssText expando
					if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
						translate( sheet.styleSheet.rawCssText, href, media );
						parsedSheets[ href ] = true;
					} else {
						if( (!/^([a-zA-Z:]*\/\/)/.test( href ) && !base)
							|| href.replace( RegExp.$1, "" ).split( "/" )[0] === win.location.host ){
							requestQueue.push( {
								href: href,
								media: media
							} );
						}
					}
				}
			}
			makeRequests();
		},
		
		//recurse through request queue, get css text
		makeRequests	= function(){
			if( requestQueue.length ){
				var thisRequest = requestQueue.shift();
				
				ajax( thisRequest.href, function( styles ){
					translate( styles, thisRequest.href, thisRequest.media );
					parsedSheets[ thisRequest.href ] = true;
					makeRequests();
				} );
			}
		},
		
		//find media blocks in css text, convert to style blocks
		translate			= function( styles, href, media ){
			var qs			= styles.match(  /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi ),
				ql			= qs && qs.length || 0,
				//try to get CSS path
				href		= href.substring( 0, href.lastIndexOf( "/" )),
				repUrls		= function( css ){
					return css.replace( /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + href + "$2$3" );
				},
				useMedia	= !ql && media,
				//vars used in loop
				i			= 0,
				j, fullq, thisq, eachq, eql;

			//if path exists, tack on trailing slash
			if( href.length ){ href += "/"; }	
				
			//if no internal queries exist, but media attr does, use that	
			//note: this currently lacks support for situations where a media attr is specified on a link AND
				//its associated stylesheet has internal CSS media queries.
				//In those cases, the media attribute will currently be ignored.
			if( useMedia ){
				ql = 1;
			}
			

			for( ; i < ql; i++ ){
				j	= 0;
				
				//media attr
				if( useMedia ){
					fullq = media;
					rules.push( repUrls( styles ) );
				}
				//parse for styles
				else{
					fullq	= qs[ i ].match( /@media *([^\{]+)\{([\S\s]+?)$/ ) && RegExp.$1;
					rules.push( RegExp.$2 && repUrls( RegExp.$2 ) );
				}
				
				eachq	= fullq.split( "," );
				eql		= eachq.length;
					
				for( ; j < eql; j++ ){
					thisq	= eachq[ j ];
					mediastyles.push( { 
						media	: thisq.split( "(" )[ 0 ].match( /(only\s+)?([a-zA-Z]+)\s?/ ) && RegExp.$2 || "all",
						rules	: rules.length - 1,
						hasquery: thisq.indexOf("(") > -1,
						minw	: thisq.match( /\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ), 
						maxw	: thisq.match( /\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" )
					} );
				}	
			}

			applyMedia();
		},
        	
		lastCall,
		
		resizeDefer,
		
		// returns the value of 1em in pixels
		getEmValue		= function() {
			var ret,
				div = doc.createElement('div'),
				body = doc.body,
				fakeUsed = false;
									
			div.style.cssText = "position:absolute;font-size:1em;width:1em";
					
			if( !body ){
				body = fakeUsed = doc.createElement( "body" );
				body.style.background = "none";
			}
					
			body.appendChild( div );
								
			docElem.insertBefore( body, docElem.firstChild );
								
			ret = div.offsetWidth;
								
			if( fakeUsed ){
				docElem.removeChild( body );
			}
			else {
				body.removeChild( div );
			}
			
			//also update eminpx before returning
			ret = eminpx = parseFloat(ret);
								
			return ret;
		},
		
		//cached container for 1em value, populated the first time it's needed 
		eminpx,
		
		//enable/disable styles
		applyMedia			= function( fromResize ){
			var name		= "clientWidth",
				docElemProp	= docElem[ name ],
				currWidth 	= doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp,
				styleBlocks	= {},
				lastLink	= links[ links.length-1 ],
				now 		= (new Date()).getTime();

			//throttle resize calls	
			if( fromResize && lastCall && now - lastCall < resizeThrottle ){
				clearTimeout( resizeDefer );
				resizeDefer = setTimeout( applyMedia, resizeThrottle );
				return;
			}
			else {
				lastCall	= now;
			}
										
			for( var i in mediastyles ){
				var thisstyle = mediastyles[ i ],
					min = thisstyle.minw,
					max = thisstyle.maxw,
					minnull = min === null,
					maxnull = max === null,
					em = "em";
				
				if( !!min ){
					min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
				}
				if( !!max ){
					max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
				}
				
				// if there's no media query at all (the () part), or min or max is not null, and if either is present, they're true
				if( !thisstyle.hasquery || ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max ) ){
						if( !styleBlocks[ thisstyle.media ] ){
							styleBlocks[ thisstyle.media ] = [];
						}
						styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] );
				}
			}
			
			//remove any existing respond style element(s)
			for( var i in appendedEls ){
				if( appendedEls[ i ] && appendedEls[ i ].parentNode === head ){
					head.removeChild( appendedEls[ i ] );
				}
			}
			
			//inject active styles, grouped by media type
			for( var i in styleBlocks ){
				var ss		= doc.createElement( "style" ),
					css		= styleBlocks[ i ].join( "\n" );
				
				ss.type = "text/css";	
				ss.media	= i;
				
				//originally, ss was appended to a documentFragment and sheets were appended in bulk.
				//this caused crashes in IE in a number of circumstances, such as when the HTML element had a bg image set, so appending beforehand seems best. Thanks to @dvelyk for the initial research on this one!
				head.insertBefore( ss, lastLink.nextSibling );
				
				if ( ss.styleSheet ){ 
		        	ss.styleSheet.cssText = css;
		        } 
		        else {
					ss.appendChild( doc.createTextNode( css ) );
		        }
		        
				//push to appendedEls to track for later removal
				appendedEls.push( ss );
			}
		},
		//tweaked Ajax functions from Quirksmode
		ajax = function( url, callback ) {
			var req = xmlHttp();
			if (!req){
				return;
			}	
			req.open( "GET", url, true );
			req.onreadystatechange = function () {
				if ( req.readyState != 4 || req.status != 200 && req.status != 304 ){
					return;
				}
				callback( req.responseText );
			}
			if ( req.readyState == 4 ){
				return;
			}
			req.send( null );
		},
		//define ajax obj 
		xmlHttp = (function() {
			var xmlhttpmethod = false;	
			try {
				xmlhttpmethod = new XMLHttpRequest();
			}
			catch( e ){
				xmlhttpmethod = new ActiveXObject( "Microsoft.XMLHTTP" );
			}
			return function(){
				return xmlhttpmethod;
			};
		})();
	
	//translate CSS
	ripCSS();
	
	//expose update for re-running respond later on
	respond.update = ripCSS;
	
	//adjust on resize
	function callMedia(){
		applyMedia( true );
	}
	if( win.addEventListener ){
		win.addEventListener( "resize", callMedia, false );
	}
	else if( win.attachEvent ){
		win.attachEvent( "onresize", callMedia );
	}
})(this);







function s5_rsp_hide_tablet() {
	if (s5_responsive_hide_tablet != "") {
		var s5_responsive_hide_tablet_counter = 0;
		var s5_responsive_hide_tablet_divs = document.getElementById("s5_body").getElementsByTagName("DIV");
		for (var s5_responsive_hide_tablet_divs_y=0; s5_responsive_hide_tablet_divs_y<s5_responsive_hide_tablet_divs.length; s5_responsive_hide_tablet_divs_y++) {
			if (s5_responsive_hide_tablet_divs[s5_responsive_hide_tablet_divs_y].id == s5_responsive_hide_tablet_array[s5_responsive_hide_tablet_counter]) {
				s5_responsive_hide_tablet_divs[s5_responsive_hide_tablet_divs_y].style.display = "none";
				s5_responsive_hide_tablet_counter = s5_responsive_hide_tablet_counter + 1;
			}
		}
	}
}

function s5_rsp_hide_mobile() {
	if (s5_responsive_hide_mobile != "") {
		var s5_responsive_hide_mobile_counter = 0;
		var s5_responsive_hide_mobile_divs = document.getElementById("s5_body").getElementsByTagName("DIV");
		for (var s5_responsive_hide_mobile_divs_y=0; s5_responsive_hide_mobile_divs_y<s5_responsive_hide_mobile_divs.length; s5_responsive_hide_mobile_divs_y++) {
			if (s5_responsive_hide_mobile_divs[s5_responsive_hide_mobile_divs_y].id == s5_responsive_hide_mobile_array[s5_responsive_hide_mobile_counter]) {
				s5_responsive_hide_mobile_divs[s5_responsive_hide_mobile_divs_y].style.display = "none";
				s5_responsive_hide_mobile_counter = s5_responsive_hide_mobile_counter + 1;
			}
		}
	}
}

function s5_rsp_show_tablet() {
	if (s5_responsive_hide_tablet != "") {
		var s5_responsive_hide_tablet_counter = 0;
		var s5_responsive_hide_tablet_divs = document.getElementById("s5_body").getElementsByTagName("DIV");
		for (var s5_responsive_hide_tablet_divs_y=0; s5_responsive_hide_tablet_divs_y<s5_responsive_hide_tablet_divs.length; s5_responsive_hide_tablet_divs_y++) {
			if (s5_responsive_hide_tablet_divs[s5_responsive_hide_tablet_divs_y].id == s5_responsive_hide_tablet_array[s5_responsive_hide_tablet_counter]) {
				s5_responsive_hide_tablet_divs[s5_responsive_hide_tablet_divs_y].style.display = "block";
				s5_responsive_hide_tablet_counter = s5_responsive_hide_tablet_counter + 1;
			}
		}
	}
}

function s5_rsp_show_mobile() {
	if (s5_responsive_hide_mobile != "") {
		var s5_responsive_hide_mobile_counter = 0;
		var s5_responsive_hide_mobile_divs = document.getElementById("s5_body").getElementsByTagName("DIV");
		for (var s5_responsive_hide_mobile_divs_y=0; s5_responsive_hide_mobile_divs_y<s5_responsive_hide_mobile_divs.length; s5_responsive_hide_mobile_divs_y++) {
			if (s5_responsive_hide_mobile_divs[s5_responsive_hide_mobile_divs_y].id == s5_responsive_hide_mobile_array[s5_responsive_hide_mobile_counter]) {
				s5_responsive_hide_mobile_divs[s5_responsive_hide_mobile_divs_y].style.display = "block";
				s5_responsive_hide_mobile_counter = s5_responsive_hide_mobile_counter + 1;
			}
		}
	}
}


function s5_rsp_width_check() {
		
	if (document.body.offsetWidth < 580) {
		s5_rsp_hide_tablet();
		s5_rsp_hide_mobile();
	}
	
	if (document.body.offsetWidth >= 580 && document.body.offsetWidth <= 970) {
		s5_rsp_hide_tablet();
		s5_rsp_show_mobile();
	}
	
	if (document.body.offsetWidth > 970) {
		s5_rsp_show_tablet();
		s5_rsp_show_mobile();
	}

	if (document.body.offsetWidth < 750) {
		if (document.getElementById("s5_responsive_mobile_bottom_bar_outer")) {
			document.getElementById("s5_body").className = "s5_body_ie7";
		}
	}
	else {
		document.getElementById("s5_body").className = "";
	}
	
	//Set a class for stacked center columns for small screens
	if (s5_responsive_columns_small_tablet == "single") {
		if (document.getElementById("s5_columns_wrap")) {
			if (document.body.offsetWidth <= 750 && document.body.offsetWidth >= 580) {
				document.getElementById("s5_columns_wrap").className = "s5_ie_single_column";
			}
			else {
				document.getElementById("s5_columns_wrap").className = "";
			}
		}
	}
	
	if (document.body.offsetWidth <= 970) {
	
		if (s5_responsive_columns_small_tablet == "reduce") {
			if (document.body.offsetWidth <= 750) {
				//Multiply column widths by 0.8 for small screens
				s5_rsp_right_largest_orig = s5_rsp_right_largest * 0.8;
				s5_rsp_left_largest_orig = s5_rsp_left_largest * 0.8;
			}
			else {
				s5_rsp_right_largest_orig = s5_rsp_right_largest;
				s5_rsp_left_largest_orig = s5_rsp_left_largest;
			}
		}

		//Make right and right_inset one column
		if (s5_right_width_orig > 0 || s5_right_inset_width_orig > 0) {
			if (s5_right_inset_width_orig > 0) {
				document.getElementById("s5_right_inset_wrap").style.width = s5_rsp_right_largest_orig + "px";
			}
			if (s5_right_width_orig > 0) {
				document.getElementById("s5_right_wrap").style.width = s5_rsp_right_largest_orig + "px";
			}
			document.getElementById("s5_right_column_wrap").style.width = s5_rsp_right_largest_orig + "px";
			document.getElementById("s5_right_column_wrap").style.marginLeft = "-" + (s5_rsp_right_largest_orig + s5_rsp_left_largest_orig) + "px";
			document.getElementById("s5_center_column_wrap_inner").style.marginRight = s5_rsp_right_largest_orig + "px";
			if (document.getElementById("s5_right_top_wrap")) {
				document.getElementById("s5_right_top_wrap").style.width = s5_rsp_right_largest_orig + "px";
			}
			if (document.getElementById("s5_right_bottom_wrap")) {
				document.getElementById("s5_right_bottom_wrap").style.width = s5_rsp_right_largest_orig + "px";
			}
		}
		
		//Make left and left_inset one column
		if (s5_left_width_orig > 0 || s5_left_inset_width_orig > 0) {
			if (s5_left_inset_width_orig > 0) {
				document.getElementById("s5_left_inset_wrap").style.width = s5_rsp_left_largest_orig + "px";
			}
			if (s5_left_width_orig > 0) {
				document.getElementById("s5_left_wrap").style.width = s5_rsp_left_largest_orig + "px";
			}
			document.getElementById("s5_left_column_wrap").style.width = s5_rsp_left_largest_orig + "px";
			document.getElementById("s5_center_column_wrap_inner").style.marginLeft = s5_rsp_left_largest_orig + "px";
			if (document.getElementById("s5_left_top_wrap")) {
				document.getElementById("s5_left_top_wrap").style.width = s5_rsp_left_largest_orig + "px";
			}
			if (document.getElementById("s5_left_bottom_wrap")) {
				document.getElementById("s5_left_bottom_wrap").style.width = s5_rsp_left_largest_orig + "px";
			}
		}
		
	}
	
	if (document.body.offsetWidth > 970) {
	
		if (s5_responsive_column_increase == "enabled" && s5_fixed_fluid == "%") {
			if (document.body.offsetWidth >= 1300 && s5_max_body_width >= 1300) {
				//Multiply column widths by 1.3 for large monitors
				s5_right_width_orig = s5_right_width_orig_stored * 1.3;
				s5_right_inset_width_orig = s5_right_inset_width_orig_stored * 1.3;
				s5_left_width_orig = s5_left_width_orig_stored * 1.3;
				s5_left_inset_width_orig = s5_left_inset_width_orig_stored * 1.3;
			}
			
			if (document.body.offsetWidth >= 1900 && s5_max_body_width >= 1900) {
				//Multiply column widths by 1.6 for extra large monitors
				s5_right_width_orig = s5_right_width_orig_stored * 1.6;
				s5_right_inset_width_orig = s5_right_inset_width_orig_stored * 1.6;
				s5_left_width_orig = s5_left_width_orig_stored * 1.6;
				s5_left_inset_width_orig = s5_left_inset_width_orig_stored * 1.6;
			}
			
			if (document.body.offsetWidth >= 2500 && s5_max_body_width >= 2500) {
				//Multiply column widths by 1.9 for extra large monitors
				s5_right_width_orig = s5_right_width_orig_stored * 1.9;
				s5_right_inset_width_orig = s5_right_inset_width_orig_stored * 1.9;
				s5_left_width_orig = s5_left_width_orig_stored * 1.9;
				s5_left_inset_width_orig = s5_left_inset_width_orig_stored * 1.9;
			}
		}
		
		if (document.body.offsetWidth <= 1299 || s5_responsive_column_increase == "disabled") {
			//Set columns back to original width for average size monitors
			s5_right_width_orig = s5_right_width_orig_stored;
			s5_right_inset_width_orig = s5_right_inset_width_orig_stored;
			s5_left_width_orig = s5_left_width_orig_stored;
			s5_left_inset_width_orig = s5_left_inset_width_orig_stored;
		}
		
		//Change right and right_inset back to original widths
		if (s5_right_inset_width_orig > 0 || s5_right_width_orig > 0) {
			if (document.getElementById("s5_right_inset_wrap")) {
				document.getElementById("s5_right_inset_wrap").style.width = s5_right_inset_width_orig + "px";
			}
			if (document.getElementById("s5_right_wrap")) {
				document.getElementById("s5_right_wrap").style.width = s5_right_width_orig + "px";
			}
			document.getElementById("s5_right_column_wrap").style.width = s5_right_width_orig + s5_right_inset_width_orig + "px";
			document.getElementById("s5_right_column_wrap").style.marginLeft = "-" + (s5_right_width_orig + s5_right_inset_width_orig + s5_left_width_orig + s5_left_inset_width_orig) + "px";
			document.getElementById("s5_center_column_wrap_inner").style.marginRight = s5_right_width_orig + s5_right_inset_width_orig + "px";
			if (document.getElementById("s5_right_top_wrap")) {
				document.getElementById("s5_right_top_wrap").style.width = s5_right_width_orig + s5_right_inset_width_orig + "px";
			}
			if (document.getElementById("s5_right_bottom_wrap")) {
				document.getElementById("s5_right_bottom_wrap").style.width = s5_right_width_orig + s5_right_inset_width_orig + "px";
			}
		}
		
		//Change left and left_inset back to original widths
		if (s5_left_inset_width_orig > 0 || s5_left_width_orig > 0) {
			if (document.getElementById("s5_left_inset_wrap")) {
				document.getElementById("s5_left_inset_wrap").style.width = s5_left_inset_width_orig + "px";
			}
			if (document.getElementById("s5_left_wrap")) {
				document.getElementById("s5_left_wrap").style.width = s5_left_width_orig + "px";
			}
			document.getElementById("s5_left_column_wrap").style.width = s5_left_width_orig + s5_left_inset_width_orig  + "px";
			document.getElementById("s5_center_column_wrap_inner").style.marginLeft = s5_left_width_orig + s5_left_inset_width_orig + "px";
			if (document.getElementById("s5_left_top_wrap")) {
				document.getElementById("s5_left_top_wrap").style.width = s5_left_width_orig + s5_left_inset_width_orig + "px";
			}
			if (document.getElementById("s5_left_bottom_wrap")) {
				document.getElementById("s5_left_bottom_wrap").style.width = s5_left_width_orig + s5_left_inset_width_orig + "px";
			}
		}
		
	}
	
}


// Which is larger? right or right_inset
var s5_rsp_right_largest = 0;
if (s5_right_width_orig > s5_right_inset_width_orig) {
	s5_rsp_right_largest = s5_right_width_orig;
}
else if (s5_right_width_orig < s5_right_inset_width_orig) {
	s5_rsp_right_largest = s5_right_inset_width_orig;
}
else {
	s5_rsp_right_largest = s5_right_width_orig;
}

// Which is larger? left or left_inset
var s5_rsp_left_largest = 0;
if (s5_left_width_orig > s5_left_inset_width_orig) {
	s5_rsp_left_largest = s5_left_width_orig;
}
else if (s5_left_width_orig < s5_left_inset_width_orig) {
	s5_rsp_left_largest = s5_left_inset_width_orig;
}
else {
	s5_rsp_left_largest = s5_left_width_orig;
}

// Store the original widths for left left_inset right and right_inset. Used on large screens with body width set to fluid.
var s5_right_width_orig_stored = s5_right_width_orig;
var s5_right_inset_width_orig_stored = s5_right_inset_width_orig;
var s5_left_width_orig_stored = s5_left_width_orig;
var s5_left_inset_width_orig_stored = s5_left_inset_width_orig;

if (s5_responsive_hide_tablet != "") {
	s5_responsive_hide_tablet = s5_responsive_hide_tablet.replace('#','');
	var s5_responsive_hide_tablet_array = new Array();
	s5_responsive_hide_tablet_array=s5_responsive_hide_tablet.split(",");
}

if (s5_responsive_hide_mobile != "") {
	s5_responsive_hide_mobile = s5_responsive_hide_mobile.replace('#','');
	var s5_responsive_hide_mobile_array = new Array();
	s5_responsive_hide_mobile_array=s5_responsive_hide_mobile.split(",");
}

window.addEvent('domready', function() {
	//Triggers width check and adjust body layout accordingly
	s5_rsp_width_check();
});

$(window).addEvent('resize',s5_rsp_width_check);
