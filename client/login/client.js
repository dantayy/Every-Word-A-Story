// function for handling login
const handleLogin = (e) => {
    e.preventDefault();

    $(`#domoMessage`).animate({width:`hide`}, 350);

    if($(`#user`).val() === `` || $(`#pass`).val() === ``) {
        handleError(`RAWR! Username or password is empty`);
        return false;
    }

    console.log($(`input[name=_csrf]`).val());

    sendAjax(`POST`, $(`#loginForm`).attr(`action`), $(`#loginForm`).serialize(), redirect);

    return false;
};

// function for handling signup
const handleSignup = (e) => {
    e.preventDefault();

    $(`#domoMessage`).animate({width:`hide`}, 350);

    if($(`#user`).val() === `` || $(`#pass`).val() === `` || $(`#pass2`).val() === ``) {
        handleError(`RAWR! All fields are required`);
        return false;
    }

    if($(`#pass`).val() !== $(`#pass2`).val()) {
        handleError(`RAWR! Passwords do not match`);
        return false;
    }

    sendAjax(`POST`, $(`#signupForm`).attr(`action`), $(`#signupForm`).serialize(), redirect);

    return false;
};

// React form for user login
const LoginWindow = (props) => {
    return(
        <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign in" />
        </form>
    );
};

// React form for user signup
const SignupWindow = (props) => {
    return(
        <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass2">Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign Up" />
        </form>
    );
};

const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector(`#content`)
    );
};

const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector(`#content`)
    );
};

// set up the login/signup page and buttons
const setup = (csrf) => {
    const loginButton = document.querySelector(`#loginButton`);
    const signupButton = document.querySelector(`#signupButton`);

    signupButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });
    
    createLoginWindow(csrf); // default view
};

// get a csrf token and begin setup of page with it
const getToken = () => {
    sendAjax(`GET`, `/getToken`, null, (result) => {
        setup(result.csrfToken);
    });
};

// called when page loads
$(document).ready(function() {
    getToken();
});