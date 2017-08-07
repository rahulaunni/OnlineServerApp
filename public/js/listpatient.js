//hide the real content when delete clicked
$(document).on("click","#middlebar .removepatient",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-patient');
	$(this).parent().parent().children('.delete-patient').removeClass('displaydis');
});
//when user cancel the confirmation get back to original state
$(document).on("click","#middlebar .keeppatientdetails",function(){
	console.log($(this).parent().parent().children('.patlist'));
	$(this).parent().parent().children('.patlist').removeClass('displaydis');
	$(this).parent().parent().children('.patlist').addClass('list-patient');
	$(this).parent().parent().children('.delete-patient').addClass('displaydis');
	$(this).parent().parent().children('.activepatient-warning').addClass('displaydis');
		$(this).parent().parent().children('.inactivepatient-warning').addClass('displaydis');


});
//create /deletebed route 
$(document).on("click","#middlebar .deletepatientconfirmbtn",function(){
	$.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});
//disable delete option for bed which are occupied


$(document).on("click","#middlebar .activepatient",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-patient');
	$(this).parent().parent().children('.activepatient-warning').removeClass('displaydis');
});
$(document).on("click","#middlebar .inactivepatient",function(){
	$(this).parent().addClass('displaydis');
	$(this).parent().removeClass('list-patient');
	$(this).parent().parent().children('.inactivepatient-warning').removeClass('displaydis');
});