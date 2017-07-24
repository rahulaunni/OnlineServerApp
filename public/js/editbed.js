
$("#register").submit(function(e){
	e.preventDefault();
	var data={};
	data.bedname;
	$( ".bedadd").find(".bname" ).each(function(index){
	data.bedname=$(this).val();
	});
	data.bedid;
	$( ".bedadd").find(".bedid" ).each(function(index){
	data.bedid=$(this).val();
	console.log(data);
	});

						$.ajax({
							type: 'POST',
							data: JSON.stringify(data),
					        contentType: 'application/json',
	                        url: '/editbed',						
	                        success: function(data) {
	                            window.location='/';
	                        }
	                    });
		return false;
	                
});