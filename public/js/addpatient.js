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
                            window.location='/';
                        }
                    });
    return false;
}
});
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});