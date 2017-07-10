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
	       // $(this). removeAttr("data-id");
		}
	
});

//$("#submit_button").click(function(){
//$(document).on('click','#submit_button',function(){
//$(document).on('submit','#register',function(e){
$("#register").submit(function(e){
 	    e.preventDefault();	
var data={};
data.bed=$( "select[name='bedid']" ).val();
data.delbed=$( "input[name='delbedid']" ).val();
data.patient={};
data.medications=[{}];
data.patient.name=$( "input[name='pname']" ).val();
data.patient.pid=$( "input[name='delpid']" ).val();
data.patient.age=$( "input[name='page']" ).val();
data.patient.weight=$( "input[name='pwt']" ).val();
data.delete_medications=[];
data.delete_timedata=[];
$( ".delmedid" ).each(function(index){
data.delete_medications[index]=$(this).val();
});
$( ".deltimeid" ).each(function(index){
data.delete_timedata[index]=$(this).val();
});
var i=0;

$( ".medicinedata" ).each(function( index ) {
	
	var medicine_data={};
	var time=[];
	var id=[];
	medicine_data.name=$(this).find("input[name='mname']").val();
	medicine_data.medid=$(this).find("input[name='medid']").val();
	medicine_data.rate=$(this).find("input[name='mrate']").val();
	medicine_data.tvol=$(this).find("input[name='tvol']").val();
	var j=0,cn=0;
	$(this).find(".timedata div").each(function(index){
		if($(this).attr('data-toggle')=='on'){
			time[j]=cn;
			id[j]=$(this).attr('data-id');
			j++;
		}
		cn++;
	});
	console.log(time);	
	console.log(id);
	medicine_data.time=time;
	medicine_data.timeid=id;
	//$(this).attr('data-toggle')
	data.medications[i]=medicine_data;
    i++;
});

console.log("Ok");

				$.ajax({
						type: 'POST',
						data: JSON.stringify(data),
				        contentType: 'application/json',
                        url: '/updatepatient',						
                        success: function(data) {
                            window.location='/';
                        }
                    });
 
	return false;
});
