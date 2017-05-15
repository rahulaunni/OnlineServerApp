$( "#add_bed" ).click(function() {
var str=$(".bedtoadd").html();
var res = "<div class='bedadd'>"+str+"</div>";
$(".repeat").append(res);
});
$(document).on('click','.remove',function(){
$(this).parent().remove();
});
$("#submit_bed").click(function(){
	var data={};
	data.bedname=[];
	$( ".bedadd").find(".bname" ).each(function(index){
	data.bedname[index]=$(this).val();;
	});
	console.log("Ok");
	console.log(data);

					$.ajax({
							type: 'POST',
							data: JSON.stringify(data),
					        contentType: 'application/json',
	                        url: '/addbed',						
	                        success: function(data) {
	                            window.location='/';
	                        }
	                    });

});
