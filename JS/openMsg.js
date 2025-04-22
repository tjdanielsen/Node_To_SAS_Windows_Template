function openMsg(alertmsg,closeOrConfirm,buttonObject) {
	var msgbody = document.getElementById('msgBody');
	var button = document.getElementById('msgButton');
	msgbody.innerHTML = alertmsg;
	if (typeof buttonObject === 'undefined') {
	   if (closeOrConfirm == "close") {button.innerHTML = "Close"}
	   else if (closeOrConfirm == "confirm") {button.innerHTML = "Confirm"}
	}
	else {
	   button.innerHTML = buttonObject.text;
	   $('#msgButton').attr("onclick",buttonObject.clickEvent);
	}

	document.getElementById('openMsg').click();
}