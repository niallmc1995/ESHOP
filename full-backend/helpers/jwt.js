const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
  const secret = process.env.secret;

  return jwt({
    secret,
    algorithms: ['HS256'],
    requestProperty: 'user' // attaches decoded token to req.user
  }).unless({
    path: [
      '/api/v1/users/login',
      '/api/v1/users/register',
      /\/public\/uploads(.*)/
    ]
  });
}

module.exports = authJwt;
