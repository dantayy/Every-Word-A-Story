// IMPORTANT: need to supply ReactWordcloud script before this to get wordcloud functionality
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

    return false;
}

// func for handling generation of a word cloud
const handleCloud = (e) => {
    e.preventDefault();

    if($(`#cloudText`).val() === ``) {
        handleAlert(`Need to put fill the cloud!`, `danger`);
        return false;
    }

    let words = $(`#cloudText`).val().split(` `);

    let wordCloudObj = {};

    let wordCloudArr = [];

    for(let word of words){
        if(wordCloudObj.word){
            wordCloudObj.word.value++;
        } else {
            wordCloudObj.word = {
                value: 1,
            };
        }
    }

    for(let word in wordCloudObj){
        wordCloudArr.push({
            text: `${word}`,
            value: wordCloudObj[word].value,
        });
    }

    generateWordCloud(wordCloudArr);

    return false;
};

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
        //        console.log("adding a word");
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

// React form to generate a word cloud
const CloudForm = (props) => {
    if(props.words.length === 0) {
        return (
            <form id="cloudForm" onSubmit={handleCloud} name="cloudForm">
                <div class="form-group">
                    <textarea id="cloudText" form="cloudForm"
                        placeholder="paste text for word cloud here">
                    </textarea>
                </div>
                <input type="submit" value="Generate Word Cloud" />
            </form>
        );
    }

    let wordText = props.words.map((word) => {
        return word.text;
    });

    return (
        <form id="cloudForm" onSubmit={handleCloud} name="cloudForm">
                <div class="form-group">
                    <textarea id="cloudText" form="cloudForm"
                        placeholder="paste text for word cloud here">
                        {wordText.join(" ")}
                    </textarea>
                </div>
            <input type="submit" value="Generate Word Cloud" />
        </form>
    );
};

// React word cloud
const ReactCloud = (props) => {
    return (
        <ReactWordcloud words={props.wordArr} />
    );
}

// func for rendering a specific set of words to the screen & updating the wordcloud textarea
const loadWordsFromServer = (id) => {
    sendAjax(`GET`, `/getWords`, {id: id}, (data) => {
        ReactDOM.render(
            <WordList words={data.words} />,
            document.querySelector(`#words`)
        );

        ReactDOM.render(
            <CloudForm words={data.words} />,
            document.querySelector(`#makeCloud`)
        ); 
    });
};

// func for rendering all words to the screen & updating the wordcloud textarea
const loadAllWordsFromServer = () => {
    sendAjax(`GET`, `/getAllWords`, null, (data) => {
        ReactDOM.render(
            <WordList words={data.words} />,
            document.querySelector(`#words`)
        );

        ReactDOM.render(
            <CloudForm words={data.words} />,
            document.querySelector(`#makeCloud`)
        );
    });
};

// func for rendering a react word cloud
const generateWordCloud = (wordArr) => {
    ReactDOM.render(
        <ReactCloud wordArr={wordArr} />,
        document.querySelector(`#cloud`)
    );
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