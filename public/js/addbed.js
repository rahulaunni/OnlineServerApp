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
	                        	$.notify({
	                        		// options
	                        		icon: 'glyphicon glyphicon-warning-sign',
	                        		title: 'Bed Added',
	                        		message: 'The bed details are added to database',
	                        		url: '/',
	                        		target: '_self'
	                        	},{
	                        		// settings
	                        		element: 'body',
	                        		position: null,
	                        		type: "info",
	                        		allow_dismiss: true,
	                        		newest_on_top: true,
	                        		showProgressbar: false,
	                        		placement: {
	                        			from: "top",
	                        			align: "right"
	                        		},
	                        		offset: 20,
	                        		spacing: 10,
	                        		z_index: 1031,
	                        		delay: 5000,
	                        		timer: 1000,
	                        		url_target: '_blank',
	                        		mouse_over: null,
	                        		animate: {
	                        			enter: 'animated fadeInDown',
	                        			exit: 'animated fadeOutUp'
	                        		},
	                        		onShow: null,
	                        		onShown: null,
	                        		onClose: null,
	                        		onClosed: null,
	                        		icon_type: 'class',
	                        		template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
	                        			'<button type="button" aria-hidden="true" class="close" id="notclose" data-notify="dismiss">×</button>' +
	                        			'<span data-notify="icon"></span> ' +
	                        			'<span data-notify="title">{1}</span><br> ' +
	                        			'<span data-notify="message"><strong><b>{2}</b></strong></span>' +
	                        			'<div class="progress" data-notify="progressbar">' +
	                        				'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
	                        			'</div>' +
	                        			'<a href="{3}" target="{4}" data-notify="url"></a>' +
	                        		'</div>' 
	                        	});
	                        	$('.leftbar .addbed').removeClass("activem");
	                        	$('.leftbar .iconhome').addClass("activem");
	                        	$('#middlebar').load("/home");
	                        	// window.location='/?notify=ba';

	                        }
	                    });
		return false;
	                
});