const AlertMessage = (props) => {
    if(!props.message || !props.type) {
        return null;
    } else {
        return (
            <div className={`alert alert-${props.type} alert-dismissible fade in show`}>
                <p>{props.message}</p>
                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            </div>
        );
    }
};
// function for handling errors
const handleAlert = (message, type) => {
    ReactDOM.render(
        <AlertMessage message={message} type={type} />,
        document.querySelector(`#error`),
    );
};

// function for redirecting
const redirect = (response) => {
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
            handleAlert(messageObj.error, `danger`);
        }
    });
};

// called when page loads
$(document).ready(() => {
    handleAlert();
});