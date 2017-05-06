// Get the modal
var modal_sign_up = document.getElementById('sign_up_form');

var modal_sing_in = document.getElementById('sign_in_form')

var link = document.getElementById('sign_in_link');



// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal_sign_up) {
        modal_sign_up.style.display = "none";
    } else if (event.target == modal_sing_in) {
        modal_sing_in.style.display = "none";
    }
}

link.onclick = function(event) {
  modal_sign_up.style.display = "none";
  document.getElementById('sign_in_form').style.display='block'
}


$.validate(
  {
    modules : 'security'
  }
);

$(function() {
    $('#sign_in').submit(function(event) {
        event.preventDefault(); // Stops browser from navigating away from page
        var data = $( this ).serializeArray();
        $.post('/login', data, function(resp) {
            if(resp != "Success")
            {
              if($('#error-message').length < 1)
                $('#sign_in').append('<span id=\"error-message\">No such username or password.<br>Please check again</span>');
            }
            else
            {
                if($('#error-message').length >= 1)
                  $('#error-message').remove();
                //var socket = io();
                var current_location = window.location.href;
                current_location = current_location.slice(0,current_location.indexOf("#"));
                //window.alert(current_location);
                current_location = current_location + "homepage";
                window.location.replace(current_location);
            }
        });
    });
});
