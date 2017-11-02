$( ".leftbar .iconmain" ).click(function() {
	
$( ".leftbar .iconmain span" ).removeClass("glyphicon-menu-hamburger");
$( ".leftbar .iconmain span" ).addClass("glyphicon-chevron-left");

$( ".leftbar .icon .cntin").removeClass("trint");
$( ".leftbar .icon .ic").removeClass("col-sm-12");


$( ".leftbar .icon .cntin").addClass("trcollapse");
$( ".leftbar .icon .ic").addClass("col-sm-3");

$( ".leftbar").removeClass("col-sm-1");
$( ".middlebar").removeClass("col-sm-11");
$( ".leftbar").removeClass("col-lg-1");
$( ".middlebar").removeClass("col-lg-11");


$( ".leftbar").addClass("col-sm-2");
$( ".middlebar").addClass("col-sm-10");
$( ".leftbar").addClass("col-lg-2");
$( ".middlebar").addClass("col-lg-10");

});

$( ".middlebar" ).click(function() {
collapse();
});

function collapse(){
$( ".leftbar .iconmain span" ).removeClass("glyphicon-chevron-left");
$( ".leftbar .iconmain span" ).addClass("glyphicon-menu-hamburger");
$( ".leftbar .icon .cntin").removeClass("trcollapse");
$( ".leftbar .icon .ic").removeClass("col-sm-3");


$( ".leftbar .icon .cntin").addClass("trint");
$( ".leftbar .icon .ic").addClass("col-sm-12");


$( ".leftbar").removeClass("col-sm-2");
$( ".middlebar").removeClass("col-sm-10");
$( ".leftbar").addClass("col-sm-1");
$( ".middlebar").addClass("col-sm-11");

$( ".leftbar").removeClass("col-lg-2");
$( ".middlebar").removeClass("col-lg-10");
$( ".leftbar").addClass("col-lg-1");
$( ".middlebar").addClass("col-lg-11");





}

$.get( "/home", function( data ) {
  $( ".middlebar" ).html( data );

});



$( ".leftbar .icon" ).click(function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
  
});
	
});
$( ".leftbar .iconhome" ).click(function(){
$(".alert #notclose").trigger("mouseenter");
	
});



$( "#navbar .iconm" ).click(function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
	
});

$( "#navbar .iconm" ).click(function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
	
});

$( "#navbar .iconm" ).click(function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
	
});

$( "#navbar .iconm" ).click(function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
	
});


$(document).on("click","#middlebar .icon",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .connection",function(){
	
	$.get($(this).attr("data-url"), function( data ) {
		console.log("ok");
  $( ".middlebar" ).html( data );
});
});
$( ".leftbar .icon" ).click(function(){
	$(".leftbar .activem").removeClass("activem");   
	    $(this).addClass("activem"); 
	    return false;
});
$( ".navbar .iconm" ).click(function(){
	$(".navbar .active").removeClass("active");   
	    $(this).addClass("active");
		$(".navbar .navbtn").trigger("click");   
	    return false;
});

$(document).on("click","#middlebar .editpatient",function(){
	$(".leftbar .activem").removeClass("activem");   
	$(".leftbar .addpat").addClass("activem");
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .editbed",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .editdevice",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .editivset",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .editbutton",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});


$(document).on("click","#middlebar .add",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .list",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});



