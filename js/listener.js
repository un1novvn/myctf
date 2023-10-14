import * as functions from "./functions.js";
import {route} from "./route.js";
var competitionCardContent;
var competitionSignContent;
var loginFormContent;
var registerFormContent;
var competitionMainPage;
var challengeCategory;
var userProfilePage;
var resetPasswordPage;

var intervalHandler = 0;

var isLoggedIn = localStorage.getItem("isLoggedIn");
var token = localStorage.getItem('token');

$.get('html/user-profile-page.html', function(data) {
    userProfilePage = data;
});

$.get('html/reset-password-page.html', function(data) {
    resetPasswordPage = data;
});

$.get('html/competition-card.html', function(data) {
    competitionCardContent = data;
});

$.get('html/challenge-category.html', function(data) {
    challengeCategory = data;
});

$.get('html/competition-signup.html', function(data) {
    competitionSignContent = data;
});

$.get('html/login-form.html', function(data) {
    loginFormContent = data;
});

$.get('html/register-form.html', function(data) {
    registerFormContent = data;
});

$.get('html/competition-main-page.html', function(data) {
    competitionMainPage = data;
});


export function addNavHomeListener(){
    $('.nav-link[href="#Home"]').click(function() {
        // Fade out the current content
        $('#content').fadeOut('fast', function() {
            $('#content').html('<h2>Hello, World!</h2>');
            $('#content').fadeIn('fast');
        });

    });
}
export function addNavCompetitionListener(){
    $('.nav-link[href="#Competitions"]').click(function() {
        // Make an Ajax request to fetch competition data
        functions.showLoadingSpinner();
        $('#content').fadeOut('fast', function() {
            
            $.ajax({
                url: route.getCompetitions,
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    // Handle the received JSON data and display it in the content area
                    var competitions = data.data;
                    $('#content').empty();
                    $('<div class="container" id="cards"></div>').appendTo('#content')
                    competitions.forEach(function(competition) {

                        var nowTime = Date.now();
                        var status = '';
                        var badge = '';
                        if(nowTime<competition.start){
                            status = 'Not started';
                            badge = 'primary';
                        }else if(nowTime>competition.end){
                            status = 'Ended';
                            badge = 'danger';
                        }else{
                            status = 'Started';
                            badge = 'success'
                        }

                        if(competition.pause){
                            status = 'pause';
                            badge = 'secondary';
                        }

                        var c = $(competitionCardContent);
                        // <span class="badge badge-danger" style="margin-left:10px;">admin</span>
                        c.find('.competition-name').html(competition.name + `<span class="badge badge-${badge}" style="margin-left:10px;">${status}</span>`);
                        c.find('.competition-desc').text(competition.desc);
                        c.find('#start').text('Start: ' + functions.formatDate(competition.start));
                        c.find('#end').text('End: ' + functions.formatDate(competition.end));
                        c.find('.btn').attr('uuid',competition.uuid);
                        c.find('.btn').attr('competition-name',competition.name);
                        c.appendTo('#content #cards');

                    });
                    functions.hideLoadingSpinner();


                    addCompetitionPlayListener();
                    addCompetitionScoreboardListener();

                },
                error: function() {
                    // Handle errors if the Ajax request fails
                    alert('Error fetching competition data.');
                    functions.hideLoadingSpinner();
                }
            });
            
            $('#content').fadeIn('fast');
        });

    });
}
export function addNavLoginListener(){
    $('.nav-link[href="#Login"]').click(function() {
        // Load the login form into the content area
        $('#content').fadeOut('fast', function() {

            $('#content').html(loginFormContent);
            $('#content').fadeIn('fast');
            addLoginSubmitListener();

        });

    });
}
export function addNavRegisterListener(){
    $('.nav-link[href="#Register"]').click(function() {
        // Load the login form into the content area
        $('#content').fadeOut('fast', function() {

            $('#content').html(registerFormContent);
            $('#content').fadeIn('fast');

            addRegisterSubmitListener();

        });

    });
}

function addProfileUpdateListener(){
    $('#submit').click(function(){

        //根据userid 和 token 修改用户信息

    });
}
function addPasswordUpdateListener(){
    $('#reset-password').click(function(){

        var _content = $('#content')
        _content.fadeOut('fast', function() {

            var _resetPassword = $(resetPasswordPage);

            $('#content').html(_resetPassword);

            $('#submit').click(function(){

                var oldpass = $('#oldpass').val();
                var newpass1 = $('#newpass1').val();

                var newpass2 = $('#newpass2').val();
                if(newpass1 !== newpass2){
                    functions.showMessage('The passwords entered twice do not match','red')
                }else if(!newpass1 || !newpass2){
                    functions.showMessage('The password can not be empty','red')
                }else{
                    functions.showMessage('Reset Success!','green');
                    //发请求改密码
                }
            });


            _content.fadeIn('fast')
        });


    });
}


export function addNavProfileListener(){
    $('.nav-link[href="#Profile"]').click(function() {
        // Fade out the current content
        var _content = $('#content')
        _content.fadeOut('fast', function() {

            var _userProfile = $(userProfilePage);
            var userid = '0000000000000';
            //根据userid 查询用户信息

            var user = {'username':'zhongdejie'}
            _userProfile.find('#user-profile-page #username').attr('value',user.username);

            $('#content').html(_userProfile);
            addProfileUpdateListener();
            addPasswordUpdateListener();
            _content.fadeIn('fast')
        });

    });
}

export function addNavExitListener(){
    $('.nav-link[href="#Exit"]').click(function() {
        var ok = window.confirm('Are you sure you to exit?');
        if (ok) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("token");

            functions.showMessage('Exit Success!','green');
            setTimeout(function(){
                location.reload()
            },1500);
        }

    });
}

export function recaptcha_register_submit(token){
    //console.log(token)

    var username = $('#register-form #username').val();
    var password = $('#register-form #password').val();
    var stuCode = $('#register-form #stuCode').val();
    
    if(!username || !password){
        functions.showMessage('Neither username nor password can be empty.','red');
    }else{
        $.ajax({
            url: route.register,
            method: 'POST',
            dataType: 'json',
            data:JSON.stringify({
                "username": username,
                "password": password,
                "stuCode": stuCode,
                "token": token
            }),
            success: function(data) {
                if(data.code === 0){
                    functions.showMessage('Register Success!','green');
                    setTimeout(function(){
                        $('.nav-link[href="#Login"]').click();
                    },1500);
                }
            },
            error: function(data) {
                functions.showMessage(data.responseJSON.msg,'red');
            }
        });
    }

}

function addRegisterSubmitListener(){
    //$("#register-form #submit").attr("data-callback", recaptcha_register_submit)
    $("#register-form #submit").click(()=>{
        grecaptcha.execute();
    });
}

function addLoginSubmitListener(){
    $("#login-form #submit").click(function(){
        var username = $('#login-form #username').val();
        var password = $('#login-form #password').val();

        if(!username || !password){
            functions.showMessage('Neither username nor password can be empty.','red');
        }else{
            $.ajax({
                url: route.login,
                method: 'POST',
                dataType: 'json',
                data:JSON.stringify({"username":username,"password":password}),
                success: function(data) {
                    
                    if(data.code === 0){
                        //登录成功
                        localStorage.setItem('token', data.data.token);
                        localStorage.setItem('isLoggedIn', true);
    
                        functions.showMessage('Login Success!','green');
                        setTimeout(function(){
                            location.reload();
                        },1500);
    
                    }
                },
                error: function(data) {
                    functions.showMessage(data.responseJSON.msg,'red');
                }
            });
        }
        

    });
}
function addCompetitionSignupSubmitListener(uuid){
    $('#competition-sign #submit').click(function(){
        var username = $('#competition-sign #username').val();
        var stuCode = $('#competition-sign #stuCode').val();
        var token = localStorage.getItem('token');
        $.ajax({
            url: route.signupCompetition.replace('{uuid}',uuid),
            method: 'POST',
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type':'application/json'
            },
            data:JSON.stringify({"username":username,"stuCode":stuCode.toString(),"password":""}),
            success: function(data) {
                if(data.code === 0){
                    functions.showMessage('Sign up success!','green');
                }
            },
            error: function(data) {
                functions.showMessage(data.responseJSON.msg,'red');
            }
        });

    });
}


function addDestroyListener(){
    var _modal = $('#challenge-modal');
    $('#destroy').click(function(){

        var challengeId = $(this).attr('challenge-id');
        var competitionId = $('.competition-name').attr('competition-id')

        $.ajax({
            url: route.instance.replace('{cuuid}',competitionId).replace('{puuid}',challengeId),
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            dataType: 'json',
            data:JSON.stringify({"action":"stop"}),
            success: function(res) {
                _modal.find('#instantiate').css('display','inherit');
                _modal.find('.instance-on').css('display','none');
                
                clearInterval(intervalHandler);
                
                functions.showMessage('destroy instance success!','green');
            },
            error: function(data) {
                functions.showMessage(data.responseJSON.msg,'red');
            }
        });

    });
}


//给实例化按钮绑监听
function addInstantiateListener(){
    var _modal = $('#challenge-modal');
    $('#instantiate').click(function(){

        var challengeId = $(this).attr('challenge-id');
        var competitionId = $('.competition-name').attr('competition-id')
        
        $.ajax({
            url: route.instance.replace('{cuuid}',competitionId).replace('{puuid}',challengeId),
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            dataType: 'json',
            data:JSON.stringify({"action":"query"}),
            success: function(res) {
                //靶机没开启
                if(res.data.expiretime == 0){

                    $.ajax({
                        url: route.instance.replace('{cuuid}',competitionId).replace('{puuid}',challengeId),
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                        },
                        dataType: 'json',
                        data:JSON.stringify({"action":"start"}),
                        success: function(res) {
                            var _remainingTime = _modal.find('#remaining-time');
                            var _instanceSite = _modal.find('#instance-site');
        
                            _instanceSite.text(` ${res.data.addr}:${res.data.port}`)
                            _instanceSite.attr('href',`http://${res.data.addr}:${res.data.port}`);
                            //获取剩余时间和靶机地址
                            var remainingTime = res.data.expiretime-Date.now();
                            _remainingTime.text(functions.milliseconds2time(remainingTime));
                            intervalHandler = setInterval(function(expiretime){
                                //距离过期剩的毫秒数
                                var remainingTime = expiretime-Date.now();
                                _remainingTime.text(functions.milliseconds2time(remainingTime));
                            },1000,res.data.expiretime);

        
                            _modal.find('#instantiate').css('display','none');
                            _modal.find('.instance-on').css('display','inherit');
                        },
                        error: function(data) {
                            functions.showMessage(data.responseJSON.msg,'red');
                        }
                    });


                }else{
                    alert('error!!!')
                }
            },
            error: function(data) {
                functions.showMessage(data.responseJSON.msg,'red');
            }
        });

    });
}


//点击题目弹出模态框
function addChallengeListener(){
    var _challenges = $('.challenge');
    
    _challenges.click(function(){

        var _challenge = $(this);

        var challengeId = _challenge.attr('challenge-id');
        var competitionId = $('.competition-name').attr('competition-id')
        var challengeName = _challenge.attr('challenge-name');
        var hasContainer = _challenge.attr('challenge-has-container');
        var attachments = _challenge.attr('challenge-attachment');

        attachments = attachments.split(',');

        var desc = _challenge.attr('challenge-desc');

        var _modal = $('#challenge-modal');

        /*
        先清空模态框， 否则点击的一瞬间会出现之前的结果。比如打开题目A，开了靶机，之后打开题目B，有一瞬间是打开题目A模态框的界面，因为刷新模态框时候要发请求，要时间。
        */
        _modal.find('#instantiate').css('display','none');
        _modal.find('.instance-on').css('display','none');

        clearInterval(intervalHandler);

        _modal.find('#competition-name').html(`<h5>${challengeName}</h5>`);

        _modal.find('#competition-desc').text(desc);

        _modal.find('#instantiate').attr('challenge-id',challengeId);
        _modal.find('#renew').attr('challenge-id',challengeId);
        _modal.find('#destroy').attr('challenge-id',challengeId);
        _modal.find('#submit-flag').attr('challenge-id',challengeId);

        var _attachements = _modal.find('#competition-attachments');
        _attachements.empty();
        
        attachments.forEach(function(attachment){
            $(`<div><a href="${attachment}">attachment</a></div>`).appendTo(_attachements);
        });

        console.log(hasContainer === 'true')
        if(hasContainer !== 'true'){
            _modal.find('#instantiate').css('display','none');
            _modal.find('.instance-on').css('display','none');
            $('#challenge-modal').modal('show');
        }else{
            //查看靶机状态，开启或关闭
    
            $.ajax({
                url: route.instance.replace('{cuuid}',competitionId).replace('{puuid}',challengeId),
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                dataType: 'json',
                data:JSON.stringify({"action":"query"}),
                success: function(res) {
                    
                    if(res.data.expiretime == 0){//靶机没开启
                        _modal.find('#instantiate').css('display','inherit');
                        _modal.find('.instance-on').css('display','none');
                    }else{
                        
                        var _remainingTime = _modal.find('#remaining-time');
                        var _instanceSite = _modal.find('#instance-site');
    
                        _instanceSite.text(` ${res.data.addr}:${res.data.port}`)
                        _instanceSite.attr('href',`http://${res.data.addr}:${res.data.port}`)
                        //获取剩余时间和靶机地址
                        var remainingTime = res.data.expiretime-Date.now();
                        _remainingTime.text(functions.milliseconds2time(remainingTime));
                        intervalHandler = setInterval(function(expiretime){
                            //距离过期剩的毫秒数
                            console.log('hhhhhhhhhhhh')
                            var remainingTime = expiretime-Date.now();
                            _remainingTime.text(functions.milliseconds2time(remainingTime));
                        },1000,res.data.expiretime);


                        _modal.find('#instantiate').css('display','none');
                        _modal.find('.instance-on').css('display','inherit');

                    }
                    //弹出模态框
                    $('#challenge-modal').modal('show');
                    
                },
                error: function(data) {
                    functions.showMessage(data.responseJSON.msg,'red');
                }
            });

        }

    });
}
/*

(不用)

用于销毁定时触发器。
点击题目，弹出框，关闭框，重复这个过程，产生的定时器不会销毁，所以要专门加个监听
*/
function addIntervalDealer(){
    
    // var a = $('#challenge-modal')[0]

    // //options：监听的属性
    // var options = { attributes: true};

    // //回调事件
    // function callback(mutationsList, observer) {

    //     console.log(intervalHandlers);

    // }
    // var mutationObserver = new MutationObserver(callback);
    // mutationObserver.observe(a, options);
}


function addFlagSubmitListener(){
    var _modal = $('#challenge-modal')
    _modal.find('#submit-flag').click(function(){

        var challengeId = $(this).attr('challenge-id');
        var competitionId = $('.competition-name').attr('competition-id')
        var flag = _modal.find('#flag').val()

        if(flag !== ''){
            $.ajax({
                url: route.submitFlag.replace('{cuuid}',competitionId).replace('{puuid}',challengeId),
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                dataType: 'json',
                data:JSON.stringify({"flag":flag}),
                success: function(res) {
                    functions.showMessage('flag correct!','green');
                },
                error: function(data) {
                    functions.showMessage(data.responseJSON.msg,'red');
                }
            });


        }else{
            functions.showMessage('flag can not be empty','red')
        }

    });

}

function addCompetitionPlayListener(){
    $('.competition-play').click(function(){

        var uuid = $(this).attr('uuid');
        var competitionName = $(this).attr('competition-name');
        var _content = $('#content');

        if(isLoggedIn){
            //检查是否报名了

            $.ajax({
                url: route.getCompetitionInfo.replace('{uuid}',uuid),
                method: 'GET',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                success: function(res) {

                    var _attended = res.data[0].attended;
                    if(_attended){
                        //展示比赛页面
                        _content.empty();
                        _content.fadeOut('fast',function(){
        
                            //根据比赛UUID 查 赛题
                            $.ajax({
                                url: route.getChallenges.replace('{uuid}',uuid),
                                method: 'GET',
                                dataType: 'json',
                                headers: {
                                    'Authorization': 'Bearer ' + token,
                                },
                                success: function(res) {
        
                                    var challenges = res.data;
                                    var categories = {}
                                    challenges.forEach(function(challenge){
                                        
                                        if(categories[challenge.type] === undefined){
                                            categories[challenge.type] = [] 
                                        }
                                        categories[challenge.type].push(challenge);

                                    });

                                    var _competitionMainPage = $(competitionMainPage);
                                    _competitionMainPage.find('.competition-name').text(competitionName);
                                    _competitionMainPage.find('.competition-name').attr('competition-id',uuid)

                                    for(var category in categories){
                                        var _challengeCategory = $(challengeCategory);
                                        var _challenges = _challengeCategory.find('.challenges')
                                        _challengeCategory.find('.category').text(category)
                
                                        categories[category].forEach(function(challenge){

                                            $(`<div class="challenge"\
                                            challenge-name="${challenge.name}"\
                                            challenge-id="${challenge.uuid}" \
                                            challenge-desc="${challenge.desc}" \
                                            challenge-attachment="${challenge.attachmenturls}" \
                                            challenge-has-container="${challenge.hasContainer}"><div class="container" style="display:flex;width:100%;height:100%"><div style="margin:auto auto">
                                            ${challenge.name}</div></div></div>`).appendTo(_challenges);
                                            // 文字垂直水平居中
                                        
                                        });
                                        _challengeCategory.appendTo(_competitionMainPage.find('.challenge-part'))
                                    }
                
                                    _competitionMainPage.appendTo(_content);
                                    
                                    //给赛题添加监听
                                    addChallengeListener();

                                    //实例化按钮
                                    addInstantiateListener();

                                    
                                    addFlagSubmitListener();

                                    //销毁按钮
                                    addDestroyListener();

                                    _content.fadeIn('fast');
        
                                },
                                error: function(data) {
                                    functions.showMessage(data.responseJSON.msg,'red');
                                }
                            });
        

                        });
                        window.location.href='#'
                        
        
                    }else{
                        _content.fadeOut('fast',function(){
                            _content.html(competitionSignContent);
                            addCompetitionSignupSubmitListener(uuid);
            
                            _content.fadeIn('fast');
                        });
                    }

                },
                error: function(data) {
                    functions.showMessage(data.responseJSON.msg,'red');
                }
            });

        }else{
            functions.showMessage('Please login first.','red')
        }

    });
}

function addCompetitionScoreboardListener(){
}


