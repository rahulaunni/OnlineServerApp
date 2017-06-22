$( ".leftbar .iconmain" ).click(function() {
$( ".leftbar .iconmain span" ).removeClass("glyphicon-menu-hamburger");
$( ".leftbar .iconmain span" ).addClass("glyphicon-chevron-left");
$( ".leftbar").removeClass("col-sm-1");
$( ".middlebar").removeClass("col-sm-11");
$( ".leftbar").addClass("col-sm-3");
$( ".middlebar").addClass("col-sm-9");
$( ".leftbar .icon").css("width","100%");
$( ".leftbar .icon span").css("margin-right","10%");
});

$( ".middlebar" ).click(function() {
collapse();
});

function collapse(){
$( ".leftbar .iconmain span" ).removeClass("glyphicon-chevron-left");
$( ".leftbar .iconmain span" ).addClass("glyphicon-menu-hamburger");
$( ".leftbar").removeClass("col-sm-3");
$( ".middlebar").removeClass("col-sm-9");
$( ".leftbar").addClass("col-sm-1");
$( ".middlebar").addClass("col-sm-11");
$( ".leftbar .icon").css("width","300%");
$( ".leftbar .icon span").css("margin-right","14%");
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
