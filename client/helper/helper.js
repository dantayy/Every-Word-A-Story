// function for handling errors
const handleError = (message) => {
    $(`#errorMessage`).text(message);
    $(`#domoMessage`).animate({width:`toggle`}, 350);
};

// function for redirecting
const redirect = (response) => {
    $(`#domoMessage`).animate({width:`hide`}, 350);
    window.location = response.redirect;
};

// function for sending ajax to the server
const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: `json`,
        success: success,
        error: function(xhr, status, error) {
            let messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
}