"use strict";

// users can't make words longer than this
var maxWordLength = 30;

// func for handling a string the user wants to add to the story
var handleWord = function handleWord(e) {
    e.preventDefault();

    if ($("#wordText").val() === "") {
        handleAlert("Need to put in a word!", "danger");
        return false;
    } else if ($("#wordText").val().length > maxWordLength) {
        handleAlert("Word is too long!", "danger");
        return false;
    } else if ($("#wordText").val().indexOf(" ") >= 0) {
        handleAlert("Can't put in multiple words!", "danger");
        return false;
    }

    sendAjax("POST", $("#wordForm").attr("action"), $("#wordForm").serialize(), function () {
        loadAllWordsFromServer();
    });

    return false;
};

// func for handling users clicking on specific words
var handleWordClick = function handleWordClick(e) {
    e.preventDefault();

    loadWordsFromServer(e.target.key);

    return false;
};

// func for handling generation of a word cloud
var handleCloud = function handleCloud(e) {
    e.preventDefault();

    if ($("#cloudText").val() === "") {
        handleAlert("Need to put fill the cloud!", "danger");
        return false;
    }

    var words = $("#cloudText").val().split(" ");

    var wordCloudObj = {};

    var wordCloudArr = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = words[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var word = _step.value;

            if (wordCloudObj.word) {
                wordCloudObj.word.value++;
            } else {
                wordCloudObj.word = {
                    value: 1
                };
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    for (var _word in wordCloudObj) {
        wordCloudArr.push({
            text: "" + _word,
            value: wordCloudObj[_word].value
        });
    }

    generateWordCloud(wordCloudArr);

    return false;
};

// React form for submitting a word to the story
var WordForm = function WordForm(props) {
    return React.createElement(
        "form",
        { id: "wordForm", onSubmit: handleWord, name: "wordForm", action: "/maker", method: "POST" },
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "label",
                { htmlFor: "text" },
                " - Word - "
            ),
            React.createElement("input", { id: "wordText", type: "text", name: "text", placeholder: "One Word Only!" })
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { type: "submit", value: "Add Word" })
    );
};

// React list that will display the story so far
var WordList = function WordList(props) {
    if (props.words.length === 0) {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h3",
                null,
                "No words yet"
            )
        );
    }

    var wordNodes = props.words.map(function (word) {
        //        console.log("adding a word");
        var spanStyle = {
            color: word.color
        };
        return (
            //            // this implementation breaks everything and idk why
            //            <a href="#" key={word.owner} style={spanStyle} onClick={handleWordClick} > 
            //                {word.text} 
            //            </a>
            React.createElement(
                "span",
                { key: word._id, style: spanStyle },
                word.text,
                " "
            )
        );
    });

    return React.createElement(
        "div",
        null,
        wordNodes
    );
};

// React form to generate a word cloud
var CloudForm = function CloudForm(props) {
    if (props.words.length === 0) {
        return React.createElement(
            "form",
            { id: "cloudForm", onSubmit: handleCloud, name: "cloudForm" },
            React.createElement(
                "div",
                { "class": "form-group" },
                React.createElement("textarea", { id: "cloudText", form: "cloudForm",
                    placeholder: "paste text for word cloud here" })
            ),
            React.createElement("input", { type: "submit", value: "Generate Word Cloud" })
        );
    }

    var wordText = props.words.map(function (word) {
        return word.text;
    });

    return React.createElement(
        "form",
        { id: "cloudForm", onSubmit: handleCloud, name: "cloudForm" },
        React.createElement(
            "div",
            { "class": "form-group" },
            React.createElement(
                "textarea",
                { id: "cloudText", form: "cloudForm",
                    placeholder: "paste text for word cloud here" },
                wordText.join(" ")
            )
        ),
        React.createElement("input", { type: "submit", value: "Generate Word Cloud" })
    );
};

// React word cloud
var ReactCloud = function ReactCloud(props) {
    return React.createElement(ReactWordcloud, { words: props.wordArr });
};

// func for rendering a specific set of words to the screen & updating the wordcloud textarea
var loadWordsFromServer = function loadWordsFromServer(id) {
    sendAjax("GET", "/getWords", { id: id }, function (data) {
        ReactDOM.render(React.createElement(WordList, { words: data.words }), document.querySelector("#words"));

        ReactDOM.render(React.createElement(CloudForm, { words: data.words }), document.querySelector("#makeCloud"));
    });
};

// func for rendering all words to the screen & updating the wordcloud textarea
var loadAllWordsFromServer = function loadAllWordsFromServer() {
    sendAjax("GET", "/getAllWords", null, function (data) {
        ReactDOM.render(React.createElement(WordList, { words: data.words }), document.querySelector("#words"));

        ReactDOM.render(React.createElement(CloudForm, { words: data.words }), document.querySelector("#makeCloud"));
    });
};

// func for rendering a react word cloud
var generateWordCloud = function generateWordCloud(wordArr) {
    ReactDOM.render(React.createElement(ReactCloud, { wordArr: wordArr }), document.querySelector("#cloud"));
};

// set up all react based components for client and load the story
var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(WordForm, { csrf: csrf }), document.querySelector("#makeWord"));

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
