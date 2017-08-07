//hide the real content when delete clicked
$(document).on("click","#middlebar .removeivset",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-ivset');
	$(this).parent().parent().children('.delete-ivset').removeClass('displaydis');
});
//when user cancel the confirmation get back to original state
$(document).on("click","#middlebar .keepivsetdetails",function(){
	console.log($(this).parent().parent().children('.ivsetlist'));
	$(this).parent().parent().children('.ivsetlist').removeClass('displaydis');
	$(this).parent().parent().children('.ivsetlist').addClass('list-ivset');
	$(this).parent().parent().children('.delete-ivset').addClass('displaydis');
	$(this).parent().parent().children('.occupiedbed-warning').addClass('displaydis');

});
//create /deletebed route 
$(document).on("click","#middlebar .deleteivsetconfirmbtn",function(){
	$.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});