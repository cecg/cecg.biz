//Size the active menu area based on screen size, hide if too small
function s5_responsive_mobile_active_show() {
	if (document.body.offsetWidth <= 750) {
		var s5_responsive_mobile_menu_width = 0;
		if (document.getElementById("s5_responsive_mobile_toggle_click_menu").style.display == "block") {
			s5_responsive_mobile_menu_width = document.getElementById("s5_responsive_mobile_toggle_click_menu").offsetWidth;
		}
		var s5_responsive_mobile_search_width = 0;
		if (document.getElementById("s5_responsive_mobile_toggle_click_search").style.display == "block") {
			s5_responsive_mobile_search_width = document.getElementById("s5_responsive_mobile_toggle_click_search").offsetWidth;
		}
		var s5_responsive_mobile_login_width = 0;
		if (document.getElementById("s5_responsive_mobile_toggle_click_login").style.display == "block") {
			s5_responsive_mobile_login_width = document.getElementById("s5_responsive_mobile_toggle_click_login").offsetWidth;
		}
		var s5_responsive_mobile_register_width = 0;
		if (document.getElementById("s5_responsive_mobile_toggle_click_register").style.display == "block") {
			s5_responsive_mobile_register_width = document.getElementById("s5_responsive_mobile_toggle_click_register").offsetWidth;
		}
		var s5_responsive_mobile_body_width = document.body.offsetWidth;
		var s5_responsive_mobile_combined_widths = s5_responsive_mobile_menu_width + s5_responsive_mobile_login_width + s5_responsive_mobile_register_width + s5_responsive_mobile_search_width;
		document.getElementById("s5_responsive_mobile_bar_active").style.width = ((s5_responsive_mobile_body_width - s5_responsive_mobile_combined_widths) - 35) + "px";
		if (document.getElementById("s5_responsive_mobile_bar_active").offsetWidth <= 50) {
			document.getElementById("s5_responsive_mobile_bar_active").style.display = "none";
		}
		else {
			document.getElementById("s5_responsive_mobile_bar_active").style.display = "block";
		}
	}
}

//Store the inner html of login and register modules
var s5_responsive_mobile_login_innerhtml = "";
var s5_responsive_mobile_register_innerhtml = "";
function s5_responsive_mobile_login_register_innerhtml() {
	if (document.getElementById("s5box_login")) {
		if(navigator.appVersion.indexOf('MSIE 7.')!=-1 || navigator.appVersion.indexOf('MSIE 8.')!=-1){
		document.getElementById("s5box_login").childNodes[0].childNodes[0].childNodes[0].childNodes[0].id = "s5box_login_inner";
		}
		else {
		document.getElementById("s5box_login").childNodes[1].childNodes[1].childNodes[1].childNodes[1].id = "s5box_login_inner";
		}
		s5_responsive_mobile_login_innerhtml = document.getElementById("s5box_login_inner").innerHTML;
	}
	if (document.getElementById("s5box_register")) {
		if(navigator.appVersion.indexOf('MSIE 7.')!=-1 || navigator.appVersion.indexOf('MSIE 8.')!=-1){
		document.getElementById("s5box_register").childNodes[0].childNodes[0].childNodes[0].childNodes[0].id = "s5box_register_inner";
		}
		else {
		document.getElementById("s5box_register").childNodes[1].childNodes[1].childNodes[1].childNodes[1].id = "s5box_register_inner";
		}
		s5_responsive_mobile_register_innerhtml = document.getElementById("s5box_register_inner").innerHTML;
	}
	s5_responsive_mobile_login_register();
}

//Load the login and register modules if s5 box is published
var s5_responsive_mobile_register_switched = "no";
var s5_responsive_mobile_login_switched = "no";
function s5_responsive_mobile_login_register() {
	if (document.getElementById("s5_responsive_mobile_bar_active")) {
		s5_responsive_mobile_active_show();
	}
	if (document.getElementById("s5box_login") || document.getElementById("s5box_register")) {
		if (document.body.offsetWidth <= 733) {
			if (s5_responsive_mobile_login_switched == "no" && s5_responsive_login_url == "" && document.getElementById("s5box_login")) {
				document.getElementById("s5_responsive_mobile_drop_down_login_inner").innerHTML = s5_responsive_mobile_login_innerhtml;
				document.getElementById("s5box_login_inner").innerHTML = "";
				s5_responsive_mobile_login_switched = "yes";
			}
			if (s5_responsive_mobile_register_switched == "no" && s5_responsive_register_url == "" && document.getElementById("s5box_register")) {
				document.getElementById("s5_responsive_mobile_drop_down_register_inner").innerHTML = s5_responsive_mobile_register_innerhtml;
				document.getElementById("s5box_register_inner").innerHTML = "";
				s5_responsive_mobile_register_switched = "yes";
			}
		}
		else {
			if (s5_responsive_mobile_login_switched == "yes" && document.getElementById("s5box_login") && s5_responsive_login_url == "") {
				document.getElementById("s5box_login_inner").innerHTML = s5_responsive_mobile_login_innerhtml;
				document.getElementById("s5_responsive_mobile_drop_down_login_inner").innerHTML = "";
				s5_responsive_mobile_login_switched = "no";
			}
			if (s5_responsive_mobile_register_switched == "yes" && document.getElementById("s5box_register") && s5_responsive_register_url == "") {
				document.getElementById("s5box_register_inner").innerHTML = s5_responsive_mobile_register_innerhtml;
				document.getElementById("s5_responsive_mobile_drop_down_register_inner").innerHTML = "";
				s5_responsive_mobile_register_switched = "no";
			}
		}
	}
}

//Override the onclick if a custom login or register url is entered
function s5_responsive_mobile_login_link() {
	window.location = s5_responsive_login_url;
}
function s5_responsive_mobile_register_link() {
	window.location = s5_responsive_register_url;
}
function s5_responsive_mobile_clicks() {
	if (s5_responsive_login_url != "") {
		document.getElementById("s5_responsive_mobile_toggle_click_login").onclick = s5_responsive_mobile_login_link;
	}
	if (s5_responsive_register_url != "") {
		document.getElementById("s5_responsive_mobile_toggle_click_register").onclick = s5_responsive_mobile_register_link;
	}
}

//Clear the inside classes to stylize the drop down modules
var s5_responsive_mobile_login_inner = "";
var s5_responsive_mobile_register_inner = "";
function s5_responsive_mobile_clear_classes() {
	if (document.getElementById("s5_responsive_mobile_login_wrap")) {
		var s5_responsive_mobile_login_content = document.getElementById("s5_responsive_mobile_login_wrap").getElementsByTagName("DIV");
		for (var s5_responsive_mobile_login_content_y=0; s5_responsive_mobile_login_content_y<s5_responsive_mobile_login_content.length; s5_responsive_mobile_login_content_y++) {
			if (s5_responsive_mobile_login_content[s5_responsive_mobile_login_content_y].className == "s5_module_box_2") {
				s5_responsive_mobile_login_inner = s5_responsive_mobile_login_content[s5_responsive_mobile_login_content_y].innerHTML;
			}
		}
		document.getElementById("s5_responsive_mobile_drop_down_login_inner").innerHTML = s5_responsive_mobile_login_inner;
	}
	if (document.getElementById("s5_responsive_mobile_register_wrap")) {
		var s5_responsive_mobile_register_content = document.getElementById("s5_responsive_mobile_register_wrap").getElementsByTagName("DIV");
		for (var s5_responsive_mobile_register_content_y=0; s5_responsive_mobile_register_content_y<s5_responsive_mobile_register_content.length; s5_responsive_mobile_register_content_y++) {
			if (s5_responsive_mobile_register_content[s5_responsive_mobile_register_content_y].className == "s5_module_box_2") {
				s5_responsive_mobile_register_inner = s5_responsive_mobile_register_content[s5_responsive_mobile_register_content_y].innerHTML;
			}
		}
		document.getElementById("s5_responsive_mobile_drop_down_register_inner").innerHTML = s5_responsive_mobile_register_inner;
	}
}

//Drop down toggles
window.addEvent('domready', function() {

// If the login and register modules are present but not s5 box remove its class names and surrounding divs for correct styling
s5_responsive_mobile_clear_classes();

var s5_responsive_mobile_status_menu = "open";
var s5_responsive_mobile_status_search = "open";
var s5_responsive_mobile_status_login = "open";
var s5_responsive_mobile_status_register = "open";

var s5_responsive_mobile_slide_menu = new Fx.Slide('s5_responsive_mobile_drop_down_menu', {mode: 'vertical',duration: 500});
var s5_responsive_mobile_slide_search = new Fx.Slide('s5_responsive_mobile_drop_down_search', {mode: 'vertical',duration: 500});
var s5_responsive_mobile_slide_login = new Fx.Slide('s5_responsive_mobile_drop_down_login', {mode: 'vertical',duration: 500});
var s5_responsive_mobile_slide_register = new Fx.Slide('s5_responsive_mobile_drop_down_register', {mode: 'vertical',duration: 500});

function s5_responsive_mobile_show_visible() {
	if (document.getElementById("s5_responsive_mobile_login_wrap")) {
	document.getElementById("s5_responsive_mobile_login_wrap").innerHTML = "";
	}
	if (document.getElementById("s5_responsive_mobile_register_wrap")) {
	document.getElementById("s5_responsive_mobile_register_wrap").innerHTML = "";
	}
	document.getElementById("s5_responsive_modile_drop_down_wrap").className = "";
}

function s5_responsive_mobile_close_toggles() {
	if (s5_responsive_mobile_status_menu == "open") {
		document.getElementById("s5_responsive_mobile_toggle_click_menu").className = "s5_responsive_mobile_closed";
		s5_responsive_mobile_slide_menu.toggle();
	}
	if (s5_responsive_mobile_status_search == "open") {
		document.getElementById("s5_responsive_mobile_toggle_click_search").className = "s5_responsive_mobile_closed";
		s5_responsive_mobile_slide_search.toggle();
	}
	if (s5_responsive_mobile_status_login == "open") {
		document.getElementById("s5_responsive_mobile_toggle_click_login").className = "s5_responsive_mobile_closed";
		s5_responsive_mobile_slide_login.toggle();
	}
	if (s5_responsive_mobile_status_register == "open") {
		document.getElementById("s5_responsive_mobile_toggle_click_register").className = "s5_responsive_mobile_closed";
		s5_responsive_mobile_slide_register.toggle();
	}
}

function s5_responsive_mobile_toggle_menu() {
	//These line is here to fix an IE8 issue
	document.getElementById("s5_responsive_mobile_drop_down_search").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_login").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_register").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_menu").style.display = "block";
	s5_responsive_mobile_slide_menu.toggle();
}

function s5_responsive_mobile_toggle_search() {
	//These line is here to fix an IE8 issue
	document.getElementById("s5_responsive_mobile_drop_down_search").style.display = "block";
	document.getElementById("s5_responsive_mobile_drop_down_login").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_register").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_menu").style.display = "none";
	s5_responsive_mobile_slide_search.toggle();
}

function s5_responsive_mobile_toggle_login() {
	//These line is here to fix an IE8 issue
	document.getElementById("s5_responsive_mobile_drop_down_search").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_login").style.display = "block";
	document.getElementById("s5_responsive_mobile_drop_down_register").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_menu").style.display = "none";
	s5_responsive_mobile_slide_login.toggle();
}

function s5_responsive_mobile_toggle_register() {
	//These line is here to fix an IE8 issue
	document.getElementById("s5_responsive_mobile_drop_down_search").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_login").style.display = "none";
	document.getElementById("s5_responsive_mobile_drop_down_register").style.display = "block";
	document.getElementById("s5_responsive_mobile_drop_down_menu").style.display = "none";
	s5_responsive_mobile_slide_register.toggle();
}

$('s5_responsive_mobile_toggle_click_menu').addEvent('click', function(event){
	event.stop();
	s5_responsive_mobile_close_toggles();
	if (s5_responsive_mobile_status_menu == "closed") {
	document.getElementById("s5_responsive_mobile_toggle_click_menu").className = "s5_responsive_mobile_open";
	window.setTimeout(s5_responsive_mobile_toggle_menu,500);
	}
});

$('s5_responsive_mobile_toggle_click_search').addEvent('click', function(event){
	event.stop();
	s5_responsive_mobile_close_toggles();
	if (s5_responsive_mobile_status_search == "closed") {
	document.getElementById("s5_responsive_mobile_toggle_click_search").className = "s5_responsive_mobile_open";
	window.setTimeout(s5_responsive_mobile_toggle_search,500);
	}
});

$('s5_responsive_mobile_toggle_click_login').addEvent('click', function(event){
	event.stop();
	s5_responsive_mobile_close_toggles();
	if (s5_responsive_mobile_status_login == "closed") {
	document.getElementById("s5_responsive_mobile_toggle_click_login").className = "s5_responsive_mobile_open";
	window.setTimeout(s5_responsive_mobile_toggle_login,500);
	}
});

$('s5_responsive_mobile_toggle_click_register').addEvent('click', function(event){
	event.stop();
	s5_responsive_mobile_close_toggles();
	if (s5_responsive_mobile_status_register == "closed") {
	document.getElementById("s5_responsive_mobile_toggle_click_register").className = "s5_responsive_mobile_open";
	window.setTimeout(s5_responsive_mobile_toggle_register,500);
	}
});

s5_responsive_mobile_slide_menu.addEvent('complete', function() {
if (s5_responsive_mobile_status_menu == "open") {
	s5_responsive_mobile_status_menu = "closed";
}
else {
	s5_responsive_mobile_status_menu = "open";
}
});

s5_responsive_mobile_slide_search.addEvent('complete', function() {
if (s5_responsive_mobile_status_search == "open") {
	s5_responsive_mobile_status_search = "closed";
}
else {
	s5_responsive_mobile_status_search = "open";
}
});

s5_responsive_mobile_slide_login.addEvent('complete', function() {
if (s5_responsive_mobile_status_login == "open") {
	s5_responsive_mobile_status_login = "closed";
}
else {
	s5_responsive_mobile_status_login = "open";
}
});

s5_responsive_mobile_slide_register.addEvent('complete', function() {
if (s5_responsive_mobile_status_register == "open") {
	s5_responsive_mobile_status_register = "closed";
}
else {
	s5_responsive_mobile_status_register = "open";
}
});

// Close all the s5_responsive_mobile_toggles by default
s5_responsive_mobile_close_toggles();

// Set the wrapper div to visible after all is loaded
window.setTimeout(s5_responsive_mobile_show_visible,2000);

// Calculate the widths of the active menu area if enabled
if (document.getElementById("s5_responsive_mobile_bar_active")) {
	s5_responsive_mobile_active_show();
}

// Override onclick if custom urls are entered
s5_responsive_mobile_clicks();

// If the s5 box is present store it's values
if (document.getElementById("s5box_login") || document.getElementById("s5box_register")) {
s5_responsive_mobile_login_register_innerhtml();
}

});

$(window).addEvent('resize',s5_responsive_mobile_login_register);
