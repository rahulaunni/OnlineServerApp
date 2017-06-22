$(document).ready(function() {
   $.validate({
   	    modules : 'security',
   	    onModulesLoaded : function() {
    var optionalConfig = {
      fontSize: '12pt',
      padding: '4px',
      bad : 'Very bad',
      weak : 'Weak',
      good : 'Good',
      strong : 'Strong'
    };

    $('input[name="password_confirmation"]').displayPasswordStrength(optionalConfig);
  }
   });
});