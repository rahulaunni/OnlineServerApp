$( "#add_bed" ).click(function() {
var str=$(".bedtoadd").html();
var res = "<div class='bedadd'>"+str+"</div>";
$(".addbed").append(res);
//adding required for input field when clicking add more
$(".addbed input").prop('required',true);
});
$(document).on('click','.remove',function(){
$(this).parent().remove();
});

//$(document).on('submit','#register',function(e){
 	    //e.preventDefault();
$("#register").submit(function(e){
	e.preventDefault();
	var data={};
	data.bedname=[];
	$( ".bedadd .addbed").find(".bname" ).each(function(index){
	data.bedname[index]=$(this).val();
	console.log(data);
	});

						$.ajax({
							type: 'POST',
							data: JSON.stringify(data),
					        contentType: 'application/json',
	                        url: '/addbed',						
	                        success: function(data) {
	                            window.location='/';
	                        }
	                    });
		return false;
	                
});