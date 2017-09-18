$( "#add_med" ).click(function() {
var str=$(".medicinedata-toload").html();
var res = "<div class='medicinedata'>"+str+"</div>";
$("#medicineholder").append(res);
$("#medicineholder input").prop('required',true);
});

$(document).on('click','.remove',function(){
$(this).parent().remove();
});
//$(".timedata div").click(function(){
$(document).on('click','.timedata div',function(){
	 if($(this).attr('data-toggle')=='off'){
			$(this).addClass("select");
			$(this).attr('data-toggle','on');
		}else{
	        $(this).removeClass("select");
	        $(this).attr('data-toggle','off');
		}
	
});

//$("#submit_button").click(function(){
//$(document).on('click','#submit_button',function(){
//$(document).on('submit','#register',function(e){
$("#register").submit(function(e){

 	    e.preventDefault();
var data={};
data.bed=$( "select[name='bedid']" ).val();
data.patient={};
data.medications=[{}];
data.patient.name=$( "input[name='pname']" ).val();
data.patient.age=$( "input[name='page']" ).val();
data.patient.weight=$( "input[name='pwt']" ).val();

var i=0;

$( ".medicinedata" ).each(function( index ) {
	
	var medicine_data={};
	var time=[];
	
	medicine_data.name=$(this).find("input[name='mname']").val();
	medicine_data.rate=$(this).find("input[name='mrate']").val();
	medicine_data.tvol=$(this).find("input[name='tvol']").val();
	var j=0,cn=0;
	$(this).find(".timedata div").each(function(index){
		if($(this).attr('data-toggle')=='on'){
			time[j]=cn;
			j++;
		}
		cn++;
	});
	
	medicine_data.time=time;
	//$(this).attr('data-toggle')
	data.medications[i]=medicine_data;
    i++;
});
console.log("Ok");
console.log(data);
var flag;
for(var key in data.medications)
{
	if(data.medications[key].time.length>0)
	{
		flag=true;
	}
	else{
		flag=false;
		break;
	}
}
console.log(flag);
if(flag==false)
{    	
	$('#my').trigger('mouseenter');
	// $("h5").append(" <b>Enter a time</b>.");
}
else{

				$.ajax({
						type: 'POST',
						data: JSON.stringify(data),
				        contentType: 'application/json',
                        url: '/addpatient',						
                        success: function(data) {
                        	$.notify({
                        		// options
                        		icon: 'glyphicon glyphicon-warning-sign',
                        		title: 'Patient Added',
                        		message: 'The Patient details are added to database',
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
                        	$('.leftbar .addpat').removeClass("activem");
	                        $('.leftbar .iconhome').addClass("activem");
                        	$('#middlebar').load("/home");
                            // window.location='/';
                        }
                    });
    return false;
}
});
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});