
//when user cancel the confirmation get back to original state
$(document).on("click","#middlebar .keeppatientdetails",function(){
	$(this).parent().parent().children('.patlist').removeClass('displaydis');
	$(this).parent().parent().children('.patlist').addClass('list-patient');
		$(this).parent().parent().children('.inactivepatient-warning').addClass('displaydis');


});

//disable delete option for bed which are occupied


$(document).on("click","#middlebar .inactivepatient",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-patient');
	$(this).parent().parent().children('.inactivepatient-warning').removeClass('displaydis');
});


$(document).on("click","#middlebar .viewpatient",function(){
	$.get($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});