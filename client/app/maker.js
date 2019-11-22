// users can't make words longer than this
const maxWordLength = 30;

// func for handling a string the user wants to add to the story
const handleWord = (e) => {
    e.preventDefault();

    if($(`#wordText`).val() === ``) {
        handleAlert(`Need to put in a word!`, `danger`);
        return false;
    } else if ($(`#wordText`).val().length > maxWordLength) {
        handleAlert(`Word is too long!`, `danger`);
        return false;
    } else if ($(`#wordText`).val().indexOf(` `) >= 0) {
        handleAlert(`Can't put in multiple words!`, `danger`);
        return false;
    }

    sendAjax(`POST`, $(`#wordForm`).attr(`action`), $(`#wordForm`).serialize(), () => {
        loadAllWordsFromServer();
    });

    return false;
};

// func for handling users clicking on specific words
const handleWordClick = (e) => {
    e.preventDefault();
    
    loadWordsFromServer(e.target.key);
    
    return false
}

// React form for submitting a word to the story
const WordForm = (props) => {
    return (
        <form id="wordForm" onSubmit={handleWord} name="wordForm" action="/maker" method="POST">
            <div class="form-group">
                <label htmlFor="text"> - Word - </label>
                <input id="wordText" type="text" name="text" placeholder="One Word Only!" />
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="submit" value="Add Word" />
        </form>
    );
};

// React list that will display the story so far
const WordList = (props) => {
    if(props.words.length === 0) {
        return(
            <div>
                <h3>No words yet</h3>
            </div>
        );
    }

    const wordNodes = props.words.map((word) => {
        const spanStyle = {
            color: word.color,
        }
        return (
//            // this implementation breaks everything and idk why
//            <a href="#" key={word.owner} style={spanStyle} onClick={handleWordClick} > 
//                {word.text} 
//            </a>
            <span key={word._id} style={spanStyle} >{word.text} </span>
        );
    });

    return(
        <div>
            {wordNodes}
        </div>
    );
};

// func for rendering a specific set of words to the screen
const loadWordsFromServer = (id) => {
    sendAjax(`GET`, `/getWords`, {id: id}, (data) => {
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

// set up all react based components for client and load the story
const setup = (csrf) => {
    ReactDOM.render(
        <WordForm csrf={csrf} />,
        document.querySelector(`#makeWord`)
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