var s5_box_hide_div_holder;
var s5_box_hide_div = document.getElementsByTagName("DIV");
for (var s5_box_hide_div_y=0; s5_box_hide_div_y<s5_box_hide_div.length; s5_box_hide_div_y++) {
s5_box_hide_div_holder = s5_box_hide_div[s5_box_hide_div_y].className;
if (s5_box_hide_div_holder.indexOf("-s5_box") > 0) {
s5_box_hide_div[s5_box_hide_div_y].style.display = "none";
}
}