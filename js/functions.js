
export function milliseconds2time(milliseconds){
    
    var hour = parseInt(milliseconds / (3600*1000)).toString()
    var minute = parseInt((milliseconds % (3600*1000))/(60*1000)).toString()
    var second = parseInt(((milliseconds % (3600*1000))%(60*1000))/1000).toString()

    hour = hour.length==1?'0'+hour:hour
    minute = minute.length==1?'0'+minute:minute
    second = second.length==1?'0'+second:second

    return `${hour}:${minute}:${second}`;
}

export function get(url,token){
    var headers = {'Content-Type':'application/json'}

    var ret;

    if(token){
        headers.Authorization = 'Bearer ' + token;
    }
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        headers: headers,
        async:false,
        success: function(res) {
            ret = res
        },
        error: function(data) {
            functions.showMessage(data.responseJSON.msg,'red');
        }
    });
    return ret
}

export function formatDate(milliseconds) {
    const date = new Date(milliseconds);

    // Get individual date components
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Create the formatted date string
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}
export function showLoadingSpinner() {
    $('#loading-indicator').show();
}

// Hide the loading spinner when the request is completed
export function hideLoadingSpinner() {
    $('#loading-indicator').hide();
}

export function showMessage(message,type) {

    var box = $('#message-box');
    // box.css('background-color', '#18d858f5')

    switch(type){
        case 'green':
            box.css('background-color', 'rgb(212, 237, 218)')
            break
        case 'yellow':
            box.css('background-color', 'rgb(255, 243, 205)')
            break
        case 'red':
            box.css('background-color', 'rgb(248, 215, 218)')
            break
        case 'blue':
            box.css('background-color', 'rgb(209, 236, 241)')
            break    
    }

    $('#message-box #message').text(message);
    box.addClass('show');
    
    setTimeout(function() {
        hideMessage();
    }, 3000);
}

// Hide the message box
export function hideMessage() {
    $('#message-box').removeClass('show');
}

// Close button click event handler
$('#message-box .close').click(function() {
    hideMessage();
});