
import * as functions from '../js/functions.js'
import { route } from '../js/route.js';


export function addAdminLoginListener(){
    $("#admin-login-form #submit").click(function(){
        var username = $('#admin-login-form #username').val();
        var password = $('#admin-login-form #password').val();
        
        $.ajax({
            url: route.login,
            method: 'POST',
            dataType: 'json',
            data:JSON.stringify({"username":username,"password":password}),
            success: function(data) {

                if(data.code === 0 && data.data.priv == 1){
                    //登录成功
                    localStorage.setItem('adminToken', data.data.token);
                    localStorage.setItem('adminLoggined', true);

                    functions.showMessage('Login Success!','green');
                    setTimeout(function(){
                        location.reload();
                    },1500);

                }else{
                    functions.showMessage('Admin username or password wrong','red');
                }
            },
            error: function(data) {
                functions.showMessage(data.responseJSON.msg,'red');
            }
        });

    });
}

export function addNavExitListener(){
    $('.nav-link[href="#Exit"]').click(function() {
        var ok = window.confirm('Are you sure you to exit?');
        if (ok) {
            localStorage.removeItem("adminLoggined");
            localStorage.removeItem("token");

            functions.showMessage('Exit Success!','green');
            setTimeout(function(){
                location.reload()
            },1500);

        }

    });
}

export function addUserEditListener(){
    $('.edit a').click(function(){

        $(this).attr('data-target','#user-profile-modal');
    });
}