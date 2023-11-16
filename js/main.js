// script.js

import * as listener from './listener.js';
import * as functions from './functions.js'
import {route} from "./route.js";


window.listener = listener
$(document).ready(function() {

    var isLoggedIn = localStorage.getItem('isLoggedIn');
    var expired = localStorage.getItem('expired');
    // Check if the user is logged in
    if (isLoggedIn != 'true' || (Date.now() >= expired && expired !=null)) {

        if((Date.now() >= expired && expired !=null)){
            console.log(expired)
            functions.showMessage('Login session expired. Please login again.','red')
        }

        $('.nav-link[href="#Login_Profile"]').text('Login');
        $('.nav-link[href="#Login_Profile"]').attr('href','#Login')
        $('.nav-link[href="#Register_Exit"]').text('Register');
        $('.nav-link[href="#Register_Exit"]').attr('href','#Register')


    } else{
        console.log('User is logged in');
        $('.nav-link[href="#Login_Profile"]').text('Profile');
        $('.nav-link[href="#Login_Profile"]').attr('href','#Profile')

        $('.nav-link[href="#Register_Exit"]').text('Exit');
        $('.nav-link[href="#Register_Exit"]').attr('href','#Exit')
    }


    var title = functions.get(route.info).data.title
    console.log(title)
    $('.title').text(title)
    console.log($('.title'))



    listener.addNavHomeListener();
    listener.addNavCompetitionListener();
    listener.addNavLoginListener();
    listener.addNavRegisterListener();
    listener.addNavExitListener();
    listener.addNavProfileListener();

    
    $('.nav-link').click(function() {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    $('.nav-link[href="#Competitions"]').click();
});
