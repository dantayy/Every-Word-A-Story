// function for handling login
const handleLogin = (e) => {
    e.preventDefault();

    if($(`#user`).val() === `` || $(`#pass`).val() === ``) {
        handleAlert(`Username or password is empty`, `danger`);
        return false;
    }

    console.log($(`input[name=_csrf]`).val());

    sendAjax(`POST`, $(`#loginForm`).attr(`action`), $(`#loginForm`).serialize(), redirect);

    return false;
};

// function for handling signup
const handleSignup = (e) => {
    e.preventDefault();

    if($(`#user`).val() === `` || $(`#pass`).val() === `` || $(`#pass2`).val() === ``) {
        handleAlert(`All fields are required`, `danger`);
        return false;
    }

    if($(`#pass`).val() !== $(`#pass2`).val()) {
        handleAlert(`Passwords do not match`, `danger`);
        return false;
    }

    sendAjax(`POST`, $(`#signupForm`).attr(`action`), $(`#signupForm`).serialize(), redirect);

    return false;
};

// React form for user login
const LoginWindow = (props) => {
    return(
        <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
            <div class="form-group">
                <label htmlFor="username"> - Username - </label>
                <input id="user" type="text" name="username" placeholder="username" />
            </div>
            <div class="form-group">
                <label htmlFor="pass"> - Password - </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign in" />
        </form>
    );
};

// React form for user signup
const SignupWindow = (props) => {
    return(
        <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
            <div class="form-group">
                <label htmlFor="username"> - Username - </label>
                <input id="user" type="text" name="username" placeholder="username" />
            </div>
            <div class="form-group">
                <label htmlFor="pass"> - Password - </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
            </div>
            <div class="form-group">
                <label htmlFor="pass2"> - Re-Enter Password - </label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            </div>
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