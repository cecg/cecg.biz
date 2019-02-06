var is_ie_s5_iacf/*@cc_on = {
  // quirksmode : (document.compatMode=="BackCompat"),
  version : parseFloat(navigator.appVersion.match(/MSIE (.+?);/)[1])
}@*/;

function opacity_s5_iacf(id_s5_iacf, opacStart_s5_iacf, opacEnd_s5_iacf, millisec_s5_iacf) {
	//speed for each frame
	var speed_s5_iacf = Math.round(millisec_s5_iacf / 100);
	var timer_s5_iacf = 0;
	//determine the direction for the blending, if start and end are the same nothing happens
	if(opacStart_s5_iacf > opacEnd_s5_iacf) {
		for(i_s5_iacf = opacStart_s5_iacf; i_s5_iacf >= opacEnd_s5_iacf; i_s5_iacf--) {
			setTimeout("changeOpac_s5_iacf(" + i_s5_iacf + ",'" + id_s5_iacf + "')",(timer_s5_iacf * speed_s5_iacf));
			timer_s5_iacf++;
		}
	} else if(opacStart_s5_iacf < opacEnd_s5_iacf) {
		for(i_s5_iacf = opacStart_s5_iacf; i_s5_iacf <= opacEnd_s5_iacf; i_s5_iacf++)
			{
			setTimeout("changeOpac_s5_iacf(" + i_s5_iacf + ",'" + id_s5_iacf + "')",(timer_s5_iacf * speed_s5_iacf));
			timer_s5_iacf++;
		}
	}
}

//change the opacity for different browsers
function changeOpac_s5_iacf(opacity_s5_iacf, id_s5_iacf) {
	var object = document.getElementById(id_s5_iacf).style; 
	object.opacity = (opacity_s5_iacf / 100);
	object.MozOpacity = (opacity_s5_iacf / 100);
	object.KhtmlOpacity = (opacity_s5_iacf / 100);
	object.filter = "alpha(opacity=" + opacity_s5_iacf + ")";
}

function currentOpac_s5_iacf(id_s5_iacf, opacEnd_s5_iacf, millisec_s5_iacf) {
	//standard opacity is 100
	var currentOpac_s5_iacf = 100;
	
	//if the element has an opacity set, get it
	if(document.getElementById(id_s5_iacf).style.opacity < 100) {
		currentOpac_s5_iacf = document.getElementById(id_s5_iacf).style.opacity * 100;
	}

	//call for the function that changes the opacity
	opacity_s5_iacf(id_s5_iacf, currentOpac_s5_iacf, opacEnd_s5_iacf, millisec_s5_iacf)
}


function picture1text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture1_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture1_blank_s5_iacf").style.height = document.getElementById("picture1_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture1text_effect_small_timer();
}
else {
document.getElementById("picture1_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture2text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture2_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture2_blank_s5_iacf").style.height = document.getElementById("picture2_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture2text_effect_small_timer();
}
else {
document.getElementById("picture2_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture3text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture3_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture3_blank_s5_iacf").style.height = document.getElementById("picture3_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture3text_effect_small_timer();
}
else {
document.getElementById("picture3_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture4text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture4_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture4_blank_s5_iacf").style.height = document.getElementById("picture4_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture4text_effect_small_timer();
}
else {
document.getElementById("picture4_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture5text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture5_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture5_blank_s5_iacf").style.height = document.getElementById("picture5_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture5text_effect_small_timer();
}
else {
document.getElementById("picture5_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture6text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture6_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture6_blank_s5_iacf").style.height = document.getElementById("picture6_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture6text_effect_small_timer();
}
else {
document.getElementById("picture6_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture7text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture7_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture7_blank_s5_iacf").style.height = document.getElementById("picture7_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture7text_effect_small_timer();
}
else {
document.getElementById("picture7_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture8text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture8_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture8_blank_s5_iacf").style.height = document.getElementById("picture8_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture8text_effect_small_timer();
}
else {
document.getElementById("picture8_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture9text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture9_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture9_blank_s5_iacf").style.height = document.getElementById("picture9_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture9text_effect_small_timer();
}
else {
document.getElementById("picture9_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}

function picture10text_effect_small() {
var s5_outer_iacf = document.getElementById("s5_iacf_outer").offsetHeight;
if (document.getElementById("picture10_blank_s5_iacf").offsetHeight < s5_outer_iacf + 1) {
document.getElementById("picture10_blank_s5_iacf").style.height = document.getElementById("picture10_blank_s5_iacf").offsetHeight + s5_iacf_inc + "px";
picture10text_effect_small_timer();
}
else {
document.getElementById("picture10_blank_s5_iacf").style.height = document.getElementById("s5_iacf_outer").offsetHeight + "px";
}
}