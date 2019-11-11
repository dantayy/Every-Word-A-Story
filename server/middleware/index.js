// widdleware function for checking if user is logged in
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }

  return next();
};

// middleware function for checking if user is logged out
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/maker');
  }

  return next();
};

// middleware function for checking if user is on https
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  return next();
};

// middleware function to bypass security check if developing locally
const bypassSecure = (req, res, next) => next();

// export middleware functions
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else { // for local dev where https can't be run easily
  module.exports.requiresSecure = bypassSecure;
}
