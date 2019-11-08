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

const handleView = (e) => {
    if(e.target.value === "all"){
        loadAllDomosFromServer();
    } else {
        loadDomosFromServer();
    }
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

const DomoView = (props) => {
    return (
        <form id="domoView" name="domoView" className="domoForm">
            <label htmlFor="view">View All Domos - </label>
            <input type="radio" onClick={handleView} name="view" value="all" />
            <label htmlFor="view">View Your Domos - </label>
            <input type="radio" onClick={handleView} name="view" value="user" defaultChecked />
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

const loadAllDomosFromServer = () => {
    sendAjax(`GET`, `/getAllDomos`, null, (data) => {
        ReactDOM.render(
            <DomoList domos={data.domos} />,
            document.querySelector(`#domos`)
        );
    });
};

const setup = (csrf) => {
    ReactDOM.render(
        <DomoForm csrf={csrf} />,
        document.querySelector(`#makeDomo`)
    );
    
    ReactDOM.render(
        <DomoView />,
        document.querySelector(`#domoView`)
    );
    
    ReactDOM.render(
        <DomoList domos={[]} />,
        document.querySelector(`#domos`)
    );
    
    loadDomosFromServer();
};

const getToken = () => {
    sendAjax(`GET`, `/getToken`, null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(() => {
    getToken();
});