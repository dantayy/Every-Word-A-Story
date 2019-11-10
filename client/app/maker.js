// users can't make words longer than this
const maxWordLength = 30;


const handleDomoView = (e) => {
    if(e.target.value === "all"){
        loadAllDomosFromServer();
    } else {
        loadDomosFromServer();
    }
};

//change the display from all words to user's words & vice versa
const handleWordView = (e) => {
    if(e.target.value === "all"){
        loadAllWordsFromServer();
    } else {
        loadWordsFromServer();
    }
};

const handleDomo = (e) => {
    e.preventDefault();

    $(`#domoMessage`).animate({width:`hide`}, 350);

    if($(`#domoName`).val() === `` || $(`#domoAge`).val() === ``) {
        handleError(`RAWR!  All fields are required`);
        return false;
    }

    sendAjax(`POST`, $(`#domoForm`).attr(`action`), $(`#domoForm`).serialize(), function() {
        loadDomosFromServer();
    });

    return false;
};

// func for handling a string the user wants to add to the story
const handleWord = (e) => {
    e.preventDefault();

    $(`#domoMessage`).animate({width:`hide`}, 350);

    if($(`#wordText`).val() === ``) {
        handleError(`RAWR!  Need to put in a word!`);
        return false;
    } else if ($(`#wordText`).length > maxWordLength) {
        handleError(`RAWR!  Word is too long!`);
        return false;
    } else if ($(`#wordText`).index(' ') !== -1) {
        handleError(`RAWR!  Can't put in multiple words!`);
        return false;
    }

    sendAjax(`POST`, $(`#wordForm`).attr(`action`), $(`#wordForm`).serialize(), () => {
        loadAllWordsFromServer();
    });

    return false;
};

const DomoForm = (props) => {
    return (
        <form id="domoForm" onSubmit={handleDomo} name="domoForm" action="/maker" method="POST" className="domoForm">
        <label htmlFor="name">Name: </label>
        <input id="domoName" type="text" name="name" placeholder="Domo Name" />
        <label htmlFor="age">Age: </label>
        <input id="domoAge" type="text" name="age" placeholder="Domo Age" />
        <label htmlFor="image">Image: </label>
        <input id="domoImage" type="text" name="image" placeholder="Domo Image URL" />
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
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

const DomoList = (props) => {
    if(props.domos.length === 0) {
        return(
            <div className="domoList">
            <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map((domo) => {
        return (
            <div key={domo._id} className="domo">
            <img src={domo.image} alt="domo face" className="domoFace" />
            <h3 className="domoName">Name: {domo.name}</h3>
            <h3 className="domoAge">Age: {domo.age}</h3>
            </div>
        );
    });

    return(
        <div className="domoList">
        {domoNodes}
        </div>
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
        return (
            <span key={word._id} color={word.color}>{word.text} </span>
        );
    });

    return(
        <div className="domoList">
        {wordNodes}
        </div>
    );
};

const DomoView = (props) => {
    return (
        <form id="domoView" name="domoView" className="domoForm">
        <label htmlFor="view">View All Domos - </label>
        <input type="radio" onClick={handleDomoView} name="view" value="all" />
        <label htmlFor="view">View Your Domos - </label>
        <input type="radio" onClick={handleDomoView} name="view" value="user" defaultChecked />
        </form>
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

const loadDomosFromServer = () => {
    sendAjax(`GET`, `/getDomos`, null, (data) => {
        ReactDOM.render(
            <DomoList domos={data.domos} />,
            document.querySelector(`#domos`)
        );
    });
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

const loadAllDomosFromServer = () => {
    sendAjax(`GET`, `/getAllDomos`, null, (data) => {
        ReactDOM.render(
            <DomoList domos={data.domos} />,
            document.querySelector(`#domos`)
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

const getToken = () => {
    sendAjax(`GET`, `/getToken`, null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(() => {
    getToken();
});