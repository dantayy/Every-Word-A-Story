const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getWords', mid.requiresLogin, controllers.Word.getWords);
  app.get('/getAllWords', mid.requiresLogin, controllers.Word.getAllWords);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Word.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Word.make);
  app.get('/account', mid.requiresLogin, controllers.Account.managementPage);
  app.post('/passwordChange', mid.requiresLogin, controllers.Account.changePassword);
  app.post('/timeoutChange', mid.requiresLogin, controllers.Account.changeTimeout);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

// this entire file is equivalent to the router function when required in other files
module.exports = router;
