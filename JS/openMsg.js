function openMsg(alertmsg,closeOrConfirm) {	
	   var msgbody = document.getElementById('msgBody');
	   var button = document.getElementById('msgButton');
	   msgbody.innerHTML = alertmsg;
	   if (closeOrConfirm == "close") {button.innerHTML = "Close"}
	   else if (closeOrConfirm == "confirm") {button.innerHTML = "Confirm"}		
	   document.getElementById('openMsg').click();	
}