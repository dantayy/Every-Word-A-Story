// users can't make words longer than this
const maxWordLength = 30;

//change the display from all words to user's words & vice versa
const handleWordView = (e) => {
    if(e.target.value === "all"){
        loadAllWordsFromServer();
    } else {
        loadWordsFromServer();
    }
};

// func for handling a string the user wants to add to the story
const handleWord = (e) => {
    e.preventDefault();

    $(`#domoMessage`).animate({width:`hide`}, 350);

    if($(`#wordText`).val() === ``) {
        handleError(`Need to put in a word!`);
        return false;
    } else if ($(`#wordText`).val().length > maxWordLength) {
        handleError(`Word is too long!`);
        return false;
    } else if ($(`#wordText`).val().indexOf(` `) >= 0) {
        handleError(`Can't put in multiple words!`);
        return false;
    }

    sendAjax(`POST`, $(`#wordForm`).attr(`action`), $(`#wordForm`).serialize(), () => {
        loadAllWordsFromServer();
    });

    return false;
};

// React form for submitting a word to the story
const WordForm = (props) => {
    return (
        <form id="wordForm" onSubmit={handleWord} name="wordForm" action="/maker" method="POST" className="domoForm">
            <label htmlFor="text">Word: </label>
            <input id="wordText" type="text" name="text" placeholder="One Word Only!" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Add Word" />
        </form>
    );
};

// React list that will display the story so far
const WordList = (props) => {
    if(props.words.length === 0) {
        return(
            <div className="domoList">
                <h3 className="emptyDomo">No words yet</h3>
            </div>
        );
    }

    const wordNodes = props.words.map((word) => {
        const spanStyle = {
            color: word.color,
        }
        return (
            <span key={word._id} style={spanStyle} >{word.text} </span>
        );
    });

    return(
        <div className="domoList">
            {wordNodes}
        </div>
    );
};

// React form for choosing to display the entire story or just a user's story
const WordView = (props) => {
    return (
        <form id="domoView" name="wordView" className="domoForm">
            <label htmlFor="view">View All Words - </label>
            <input type="radio" onClick={handleWordView} name="view" value="all" defaultChecked />
            <label htmlFor="view">View Your Words - </label>
            <input type="radio" onClick={handleWordView} name="view" value="user" />
        </form>
    );
};

// func for rendering a user's set of words to the screen
const loadWordsFromServer = () => {
    sendAjax(`GET`, `/getWords`, null, (data) => {
        ReactDOM.render(
            <WordList words={data.words} />,
            document.querySelector(`#words`)
        );
    });
};

// func for rendering all words to the screen
const loadAllWordsFromServer = () => {
    sendAjax(`GET`, `/getAllWords`, null, (data) => {
        ReactDOM.render(
            <WordList words={data.words} />,
            document.querySelector(`#words`)
        );
    });
};

const setup = (csrf) => {
    ReactDOM.render(
        <WordForm csrf={csrf} />,
        document.querySelector(`#makeWord`)
    );

    ReactDOM.render(
        <WordView />,
        document.querySelector(`#wordView`)
    );

    ReactDOM.render(
        <WordList words={[]} />,
        document.querySelector(`#words`)
    );

    loadAllWordsFromServer();
};

// get a csrf token and begin setup of page with it
const getToken = () => {
    sendAjax(`GET`, `/getToken`, null, (result) => {
        setup(result.csrfToken);
    });
};

// called when page loads
$(document).ready(() => {
    getToken();
});