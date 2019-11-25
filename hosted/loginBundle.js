"use strict";

// function for handling login
var handleLogin = function handleLogin(e) {
    e.preventDefault();

    if ($("#user").val() === "" || $("#pass").val() === "") {
        handleAlert("Username or password is empty", "danger");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax("POST", $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

// function for handling signup
var handleSignup = function handleSignup(e) {
    e.preventDefault();

    if ($("#user").val() === "" || $("#pass").val() === "" || $("#pass2").val() === "") {
        handleAlert("All fields are required", "danger");
        return false;
    }

    if ($("#pass").val() !== $("#pass2").val()) {
        handleAlert("Passwords do not match", "danger");
        return false;
    }

    sendAjax("POST", $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

// React form for user login
var LoginWindow = function LoginWindow(props) {
    return React.createElement(
        "form",
        { id: "loginForm", name: "loginForm", onSubmit: handleLogin, action: "/login", method: "POST", className: "mainForm" },
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "username" },
                " - Username - "
            ),
            React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" })
        ),
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "pass" },
                " - Password - "
            ),
            React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" })
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
    );
};

// React form for user signup
var SignupWindow = function SignupWindow(props) {
    return React.createElement(
        "form",
        { id: "signupForm", name: "signupForm", onSubmit: handleSignup, action: "/signup", method: "POST", className: "mainForm" },
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "username" },
                " - Username - "
            ),
            React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" })
        ),
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "pass" },
                " - Password - "
            ),
            React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" })
        ),
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "pass2" },
                " - Re-Enter Password - "
            ),
            React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" })
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" })
    );
};

// for rendering the login component to the screen
var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

// for rendering the signup component to the screen
var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

// set up the login/signup page and buttons
var setup = function setup(csrf) {
    var loginButton = document.querySelector("#loginButton");
    var signupButton = document.querySelector("#signupButton");

    signupButton.addEventListener("click", function (e) {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createLoginWindow(csrf); // default view
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
