$( ".leftbar .iconmain" ).click(function() {
	
$( ".leftbar .iconmain span" ).removeClass("glyphicon-menu-hamburger");
$( ".leftbar .iconmain span" ).addClass("glyphicon-chevron-left");

$( ".leftbar .icon .cntin").removeClass("trint");
$( ".leftbar .icon .ic").removeClass("col-sm-12");

$( ".leftbar .icon .cntin").addClass("trcollapse");
$( ".leftbar .icon .ic").addClass("col-sm-3");

$( ".leftbar").removeClass("col-sm-1");
$( ".middlebar").removeClass("col-sm-11");


$( ".leftbar").addClass("col-sm-2");
$( ".middlebar").addClass("col-sm-10");


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





}

$.get( "/home", function( data ) {
  $( ".middlebar" ).html( data );
    
});



$( ".leftbar .icon" ).click(function(){
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
	$(".leftbar .active").removeClass("active");   
	    $(this).addClass("active"); 
	    return false;
});
$(document).on("click","#middlebar .confirm",function(){
	$.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .editpatient",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
$(document).on("click","#middlebar .delete",function(){
$(this).parent().parent().parent().parent().children('.msg').addClass('addposmodal');
$(this).parent().parent().parent().addClass('addposcn');
});
$(document).on("click","#middlebar .cancel",function(){
		$(this).parent().parent().siblings().removeClass('addposcn');
	$(this).parent().parent().removeClass('addposmodal');


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
