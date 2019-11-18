// handle changing a user's password
const handlePassword = (e) => {
    e.preventDefault();

    if($(`#currentPass`).val() === `` || $(`#newPass`).val() === `` || $(`#newPass2`).val() === ``) {
        handleAlert(`All fields are required`, `danger`);
        return false;
    } else if($(`#newPass`).val() !== $(`#newPass2`).val()) {
        handleAlert(`Passwords do not match`, `danger`);
        return false;
    }

    sendAjax(`POST`, $(`#pwForm`).attr(`action`), $(`#pwForm`).serialize(), () => {
        handleAlert(`Password reset successfully`, `success`);
        return false;
    });

    return false;
};

// handle changing a user's post timeout period
const handleTimeout = (e) => {
    e.preventDefault();

    return false;
};

// React form for changing a password
const ChangePassword = (props) => {
    return (
        <div>
            <form id="pwForm" onSubmit={handlePassword} name="pwForm" action="/passwordChange" method="POST">
                <div class="form-group">
                    <label htmlFor="currentPass"> - Current Password - </label>
                    <input id="currentPass" type="password" name="currentPass" />
                </div>
                <div class="form-group">
                    <label htmlFor="newPass"> - New Password - </label>
                    <input id="newPass" type="password" name="newPass" />
                </div>
                <div class="form-group">
                    <label htmlFor="newPass2"> - Retype New Password - </label>
                    <input id="newPass2" type="password" name="newPass2" />
                </div>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input type="submit" value="Change Password" />
            </form>
        </div>
    );
};

// React form for changing a user's timeout period
const ChangeTimeout = (props) => {
    return (
        <div>
            <form id="toForm" onSubmit={handleTimeout} name="toForm" action="/timeoutChange" method="POST">
                <div class="form-group">                
                    <label htmlFor="cardNumber"> - Credit Card Number - </label>
                    <input id="cardNumber" type="text" name="cardNumber"
                        placeholder="XXXX-XXXX-XXXX-XXXX" disabled />
                </div>
                <div class="form-group">                
                    <label htmlFor="cardDate"> - Expiration Month/Year - </label>
                    <input id="cardDate" type="date" name="cardDate" disabled />
                </div>
                <div class="form-group">                
                    <label htmlFor="cardSecurity"> - Security Code - </label>
                    <input id="cardSecurity" type="password" name="cardSecurity" placeholder="XXX[X]" disabled />
                </div>
                <div class="form-group">                
                    <label htmlFor="cardZip"> - Zip Code - </label>
                    <input id="cardZip" type="text" name="cardZip" placeholder="XXXXX" disabled />
                </div>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input type="submit" value="Decrease Timeout" />
            </form>
        </div>
    );
};

// set up all react based components for client
const setup = (csrf) => {
    ReactDOM.render(
        <ChangePassword csrf={csrf} />,
        document.querySelector(`#passwordChange`)
    );

    ReactDOM.render(
        <ChangeTimeout csrf={csrf}/>,
        document.querySelector(`#timeoutChange`)
    );
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