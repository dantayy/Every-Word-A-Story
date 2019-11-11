"use strict";

// users can't make words longer than this
var maxWordLength = 30;

//change the display from all words to user's words & vice versa
var handleWordView = function handleWordView(e) {
    if (e.target.value === "all") {
        loadAllWordsFromServer();
    } else {
        loadWordsFromServer();
    }
};

// func for handling a string the user wants to add to the story
var handleWord = function handleWord(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: "hide" }, 350);

    if ($("#wordText").val() === "") {
        handleError("Need to put in a word!");
        return false;
    } else if ($("#wordText").val().length > maxWordLength) {
        handleError("Word is too long!");
        return false;
    } else if ($("#wordText").val().indexOf(" ") >= 0) {
        handleError("Can't put in multiple words!");
        return false;
    }

    sendAjax("POST", $("#wordForm").attr("action"), $("#wordForm").serialize(), function () {
        loadAllWordsFromServer();
    });

    return false;
};

// React form for submitting a word to the story
var WordForm = function WordForm(props) {
    return React.createElement(
        "form",
        { id: "wordForm", onSubmit: handleWord, name: "wordForm", action: "/maker", method: "POST", className: "domoForm" },
        React.createElement(
            "label",
            { htmlFor: "text" },
            "Word: "
        ),
        React.createElement("input", { id: "wordText", type: "text", name: "text", placeholder: "One Word Only!" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Add Word" })
    );
};

// React list that will display the story so far
var WordList = function WordList(props) {
    if (props.words.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No words yet"
            )
        );
    }

    var wordNodes = props.words.map(function (word) {
        var spanStyle = {
            color: word.color
        };
        return React.createElement(
            "span",
            { key: word._id, style: spanStyle },
            word.text,
            " "
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        wordNodes
    );
};

// React form for choosing to display the entire story or just a user's story
var WordView = function WordView(props) {
    return React.createElement(
        "form",
        { id: "domoView", name: "wordView", className: "domoForm" },
        React.createElement(
            "label",
            { htmlFor: "view" },
            "View All Words - "
        ),
        React.createElement("input", { type: "radio", onClick: handleWordView, name: "view", value: "all", defaultChecked: true }),
        React.createElement(
            "label",
            { htmlFor: "view" },
            "View Your Words - "
        ),
        React.createElement("input", { type: "radio", onClick: handleWordView, name: "view", value: "user" })
    );
};

// func for rendering a user's set of words to the screen
var loadWordsFromServer = function loadWordsFromServer() {
    sendAjax("GET", "/getWords", null, function (data) {
        ReactDOM.render(React.createElement(WordList, { words: data.words }), document.querySelector("#words"));
    });
};

// func for rendering all words to the screen
var loadAllWordsFromServer = function loadAllWordsFromServer() {
    sendAjax("GET", "/getAllWords", null, function (data) {
        ReactDOM.render(React.createElement(WordList, { words: data.words }), document.querySelector("#words"));
    });
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(WordForm, { csrf: csrf }), document.querySelector("#makeWord"));

    ReactDOM.render(React.createElement(WordView, null), document.querySelector("#wordView"));

    ReactDOM.render(React.createElement(WordList, { words: [] }), document.querySelector("#words"));

    loadAllWordsFromServer();
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

// function for handling errors
var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: "toggle" }, 350);
};

// function for redirecting
var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: "hide" }, 350);
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
            handleError(messageObj.error);
        }
    });
};
