//hide the real content when delete clicked
$(document).on("click","#middlebar .removebutton",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-device');
	$(this).parent().parent().children('.delete-device').removeClass('displaydis');
});
//when user cancel the confirmation get back to original state
$(document).on("click","#middlebar .keepbuttondetails",function(){
	console.log($(this).parent().parent().children('.patlist'));
	$(this).parent().parent().children('.devicelist').removeClass('displaydis');
	$(this).parent().parent().children('.devicelist').addClass('list-device');
	$(this).parent().parent().children('.delete-device').addClass('displaydis');

});
//create /deletebed route 
$(document).on("click","#middlebar .deletebuttonconfirmbtn",function(){
	$.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
