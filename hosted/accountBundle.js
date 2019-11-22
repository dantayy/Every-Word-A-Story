"use strict";

// handle changing a user's password
var handlePassword = function handlePassword(e) {
    e.preventDefault();

    if ($("#currentPass").val() === "" || $("#newPass").val() === "" || $("#newPass2").val() === "") {
        handleAlert("All fields are required", "danger");
        return false;
    } else if ($("#newPass").val() !== $("#newPass2").val()) {
        handleAlert("Passwords do not match", "danger");
        return false;
    }

    sendAjax("POST", $("#pwForm").attr("action"), $("#pwForm").serialize(), function () {
        handleAlert("Password reset successfully", "success");
        return false;
    });

    return false;
};

// handle changing a user's post timeout period
var handleTimeout = function handleTimeout(e) {
    e.preventDefault();

    //not checking fields bc we're not using any of them actually

    sendAjax("POST", $("#toForm").attr("action"), $("#toForm").serialize(), function () {
        handleAlert("Timeout decreased successfully", "success");
        return false;
    });

    return false;
};

// React form for changing a password
var ChangePassword = function ChangePassword(props) {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            { id: "pwForm", onSubmit: handlePassword, name: "pwForm", action: "/passwordChange", method: "POST" },
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "currentPass" },
                    " - Current Password - "
                ),
                React.createElement("input", { id: "currentPass", type: "password", name: "currentPass" })
            ),
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "newPass" },
                    " - New Password - "
                ),
                React.createElement("input", { id: "newPass", type: "password", name: "newPass" })
            ),
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "newPass2" },
                    " - Retype New Password - "
                ),
                React.createElement("input", { id: "newPass2", type: "password", name: "newPass2" })
            ),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { type: "submit", value: "Change Password" })
        )
    );
};

// React form for changing a user's timeout period
var ChangeTimeout = function ChangeTimeout(props) {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            { id: "toForm", onSubmit: handleTimeout, name: "toForm", action: "/timeoutChange", method: "POST" },
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "cardNumber" },
                    " - Credit Card Number - "
                ),
                React.createElement("input", { id: "cardNumber", type: "text", name: "cardNumber",
                    placeholder: "XXXX-XXXX-XXXX-XXXX", disabled: true })
            ),
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "cardDate" },
                    " - Expiration Month/Year - "
                ),
                React.createElement("input", { id: "cardDate", type: "date", name: "cardDate", disabled: true })
            ),
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "cardSecurity" },
                    " - Security Code - "
                ),
                React.createElement("input", { id: "cardSecurity", type: "password", name: "cardSecurity", placeholder: "XXX[X]", disabled: true })
            ),
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement(
                    "label",
                    { htmlFor: "cardZip" },
                    " - Zip Code - "
                ),
                React.createElement("input", { id: "cardZip", type: "text", name: "cardZip", placeholder: "XXXXX", disabled: true })
            ),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { type: "submit", value: "Decrease Timeout" })
        )
    );
};

// set up all react based components for client
var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(ChangePassword, { csrf: csrf }), document.querySelector("#passwordChange"));

    ReactDOM.render(React.createElement(ChangeTimeout, { csrf: csrf }), document.querySelector("#timeoutChange"));
};

// get a csrf token and begin setup of page with it
var getToken = function getToken() {
    sendAjax("GET", "/getToken", null, function (result) {
        setup(result.csrfToken);
    });
};

// called when page loads
$(document).ready(function () {
    getToken();
});
"use strict";

// renders bootstrap alerts with the given type and message
var AlertMessage = function AlertMessage(props) {
    if (!props.message || !props.type) {
        return null;
    } else {
        return React.createElement(
            "div",
            { className: "alert alert-" + props.type + " alert-dismissible fade in show" },
            React.createElement(
                "p",
                null,
                props.message
            ),
            React.createElement(
                "a",
                { href: "#", "class": "close", "data-dismiss": "alert", "aria-label": "close" },
                "\xD7"
            )
        );
    }
};

// function for handling alerts
var handleAlert = function handleAlert(message, type) {
    ReactDOM.render(React.createElement(AlertMessage, { message: message, type: type }), document.querySelector("#error"));
};

// function for redirecting
var redirect = function redirect(response) {
    window.location = response.redirect;
};

// function for sending ajax to the server
var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleAlert(messageObj.error, "danger");
        }
    });
};

// called when page loads
$(document).ready(function () {
    handleAlert();
});
