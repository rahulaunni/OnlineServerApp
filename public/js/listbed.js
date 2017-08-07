//hide the real content when delete clicked
$(document).on("click","#middlebar .removebed",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-bed');
	$(this).parent().parent().children('.delete-bed').removeClass('displaydis');
});
//when user cancel the confirmation get back to original state
$(document).on("click","#middlebar .keepbeddetails",function(){
	console.log($(this).parent().parent().children('.patlist'));
	$(this).parent().parent().children('.bedlist').removeClass('displaydis');
	$(this).parent().parent().children('.bedlist').addClass('list-bed');
	$(this).parent().parent().children('.delete-bed').addClass('displaydis');
	$(this).parent().parent().children('.occupiedbed-warning').addClass('displaydis');

});
//create /deletebed route 
$(document).on("click","#middlebar .deletebedconfirmbtn",function(){
	$.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
//disable delete option for bed which are occupied


$(document).on("click","#middlebar .occupiedbed",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-bed');
	$(this).parent().parent().children('.occupiedbed-warning').removeClass('displaydis');
});