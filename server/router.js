const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.get('/getAllDomos', mid.requiresLogin, controllers.Domo.getAllDomos);
  app.get('/getWords', mid.requiresLogin, controllers.Word.getWords);
  app.get('/getAllWords', mid.requiresLogin, controllers.Word.getAllWords);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Word.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Word.make);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

// this entire file is equivalent to the router function when required in other files
module.exports = router;
