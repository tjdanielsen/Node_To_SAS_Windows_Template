function check(form,item) {
        if (item == 'logonid' || item == 'email' || item == 'logonidnew') {
           validemail = 0;
           if (item == 'logonid') var fld=form.logonid;
           else if (item == 'email') var fld=form.email;
           else if (item == 'logonidnew') var fld=form.logonidnew;
           var emailRegEx = /^[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
           if (fld.value.search(emailRegEx) == -1 || fld.value.indexOf('"') >= 0 || fld.value.indexOf('&') >= 0 || fld.value.indexOf('%') >= 0) {
                fld.value = "";
                var alertmsg = "You have entered an invalid email address. <br />Please try again.";
                openMsg(alertmsg,"close");
           }
           else validemail = 1;
           return validemail;
        }
        else if (item == 'logonconfirm' && document.getElementById('nwusrbox').style.display == 'block') {
             if (form.logonidnew.value != form.logonconfirm.value && !isEmpty(removeSpaces(form.logonconfirm.value))) {
                form.logonconfirm.value="";
                form.logonidnew.value="";
                var alertmsg = "The two email addresses entered do not match.<br />Please try again.";
                openMsg(alertmsg,"close");
             }
        }
        else if (item == 'wwwpw') {
           if (!isEmpty(removeSpaces(form.wwwpw.value))) {
              var result = strength(String(form.wwwpw.value));
              if (result <= 2) {
                form.wwwpw.value="";
                var alertmsg = "Your password is not acceptable. Passwords should have at least 8 positions and include uppercase characters, lowercase characters, numbers, and/or special characters.";
                openMsg(alertmsg,"close");
              }
           }
        }
        else if (item == 'pwconfirm') {
             if (form.wwwpw.value != form.pwconfirm.value && !isEmpty(removeSpaces(form.pwconfirm.value))) {
                form.pwconfirm.value="";
                form.wwwpw.value="";
                var alertmsg = "The two passwords entered do not match.<br />Please try again.";
                openMsg(alertmsg,"close");
             }
        }
        else if (item == 'password') {
          if (validemail == 1) setTimeout(function() {jQuery('#sbmtlogon').focus();},0);          ;
        }

        /* this is for the password reset utility available after login */
        else if (item == 'currpw') {
          if (!isEmpty(form.newpw.value) && !isEmpty(form.currpw.value) && !isEmpty(form.REnewpw.value)) document.getElementById('pwdButton').disabled = false;
          else document.getElementById('pwdButton').disabled = true;
        }
        else if (item == 'newpw') {
           if (!isEmpty(removeSpaces(form.newpw.value))) {
              var result = strengthReset(String(form.newpw.value));
              if (result <= 2) {
                form.newpw.value="";
                form.REnewpw.value="";
                document.getElementById('pwdButton').disabled = true;
                var alertmsg = "Your password is not acceptable. Passwords should have at least 8 positions and include uppercase characters, lowercase characters, numbers, and/or special characters.";
                openMsg(alertmsg,"close");
              }
           }
           else {
              if (!isEmpty(form.newpw.value) && !isEmpty(form.currpw.value) && !isEmpty(form.REnewpw.value)) document.getElementById('pwdButton').disabled = false;
              else document.getElementById('pwdButton').disabled = true;
             }
        }
        else if (item == 'REnewpw') {
             if (form.newpw.value != form.REnewpw.value && !isEmpty(removeSpaces(form.REnewpw.value))) {
                form.REnewpw.value="";
                form.newpw.value="";
                document.getElementById('pwdButton').disabled = true;
                var alertmsg = "The two passwords entered do not match.<br />Please try again.";
                openMsg(alertmsg,"close");
             }
             else {
              if (!isEmpty(form.newpw.value) && !isEmpty(form.currpw.value) && !isEmpty(form.REnewpw.value)) document.getElementById('pwdButton').disabled = false;
              else document.getElementById('pwdButton').disabled = true;
             }
        }
}