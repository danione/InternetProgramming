// Get the modal
var modal = document.getElementById('sign_up_form');

var link = document.getElementById('sign_in_link');

var login_cancel = document.getElementById('login_cancel');

var login_window;
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

link.onclick = function(event) {
  modal.style.display = "none";
  var x = screen.width/2 - 300/2;
  var y = screen.height/2 - 400/2;
  var login_window = window.open("", "", "left="+x+",top="+y+",width=300,height=400,menubar=no");
  $.get("static/login.html", function(html_string)
  {
     login_window.document.write(html_string);
  },'html');
}


$.validate(
  {
    modules : 'security'
  }
);
