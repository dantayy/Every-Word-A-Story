"use strict";

// users can't make words longer than this
var maxWordLength = 30;

var handleDomoView = function handleDomoView(e) {
    if (e.target.value === "all") {
        loadAllDomosFromServer();
    } else {
        loadDomosFromServer();
    }
};

//change the display from all words to user's words & vice versa
var handleWordView = function handleWordView(e) {
    if (e.target.value === "all") {
        loadAllWordsFromServer();
    } else {
        loadWordsFromServer();
    }
};

var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: "hide" }, 350);

    if ($("#domoName").val() === "" || $("#domoAge").val() === "") {
        handleError("RAWR!  All fields are required");
        return false;
    }

    sendAjax("POST", $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
        loadDomosFromServer();
    });

    return false;
};

// func for handling a string the user wants to add to the story
var handleWord = function handleWord(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: "hide" }, 350);

    if ($("#wordText").val() === "") {
        handleError("RAWR!  Need to put in a word!");
        return false;
    } else if ($("#wordText").length > maxWordLength) {
        handleError("RAWR!  Word is too long!");
        return false;
    } else if ($("#wordText").index(' ') !== -1) {
        handleError("RAWR!  Can't put in multiple words!");
        return false;
    }

    sendAjax("POST", $("#wordForm").attr("action"), $("#wordForm").serialize(), function () {
        loadAllWordsFromServer();
    });

    return false;
};

var DomoForm = function DomoForm(props) {
    return React.createElement(
        "form",
        { id: "domoForm", onSubmit: handleDomo, name: "domoForm", action: "/maker", method: "POST", className: "domoForm" },
        React.createElement(
            "label",
            { htmlFor: "name" },
            "Name: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
        React.createElement(
            "label",
            { htmlFor: "age" },
            "Age: "
        ),
        React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "Domo Age" }),
        React.createElement(
            "label",
            { htmlFor: "image" },
            "Image: "
        ),
        React.createElement("input", { id: "domoImage", type: "text", name: "image", placeholder: "Domo Image URL" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
    );
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

var DomoList = function DomoList(props) {
    if (props.domos.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Domos yet"
            )
        );
    }

    var domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            "div",
            { key: domo._id, className: "domo" },
            React.createElement("img", { src: domo.image, alt: "domo face", className: "domoFace" }),
            React.createElement(
                "h3",
                { className: "domoName" },
                "Name: ",
                domo.name
            ),
            React.createElement(
                "h3",
                { className: "domoAge" },
                "Age: ",
                domo.age
            )
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes
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
        return React.createElement(
            "span",
            { key: word._id, color: word.color },
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

var DomoView = function DomoView(props) {
    return React.createElement(
        "form",
        { id: "domoView", name: "domoView", className: "domoForm" },
        React.createElement(
            "label",
            { htmlFor: "view" },
            "View All Domos - "
        ),
        React.createElement("input", { type: "radio", onClick: handleDomoView, name: "view", value: "all" }),
        React.createElement(
            "label",
            { htmlFor: "view" },
            "View Your Domos - "
        ),
        React.createElement("input", { type: "radio", onClick: handleDomoView, name: "view", value: "user", defaultChecked: true })
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

var loadDomosFromServer = function loadDomosFromServer() {
    sendAjax("GET", "/getDomos", null, function (data) {
        ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector("#domos"));
    });
};

// func for rendering a user's set of words to the screen
var loadWordsFromServer = function loadWordsFromServer() {
    sendAjax("GET", "/getWords", null, function (data) {
        ReactDOM.render(React.createElement(WordList, { words: data.words }), document.querySelector("#words"));
    });
};

var loadAllDomosFromServer = function loadAllDomosFromServer() {
    sendAjax("GET", "/getAllDomos", null, function (data) {
        ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector("#domos"));
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

var getToken = function getToken() {
    sendAjax("GET", "/getToken", null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: "toggle" }, 350);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: "hide" }, 350);
    window.location = response.redirect;
};

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
