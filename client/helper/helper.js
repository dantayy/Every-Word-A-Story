const ErrorMessage = (props) => {
    if(!props.message) {
        return null;
    } else {
        return (
            <div className="alert alert-danger alert-dismissible fade in show">
                <p>{props.message}</p>
                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            </div>
        );
    }
};
// function for handling errors
const handleError = (message) => {
    ReactDOM.render(
        <ErrorMessage message={message} />,
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
            handleError(messageObj.error);
        }
    });
};

// called when page loads
$(document).ready(() => {
    handleError();
});