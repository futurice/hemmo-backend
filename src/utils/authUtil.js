const bcrypt = require('bcrypt');
import Promise from 'bluebird';
const jwt = require('jsonwebtoken');
import config from '../config';
import knex from '../db'
const secret = config.auth.secret;
import Boom from 'boom';


export function hashPassword(password) {
  // Generate a salt at level 10 strength
  var promise = new Promise(
    function(resolve, reject) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      });
    }
  );
  return promise;
}

// Crate a json web token for user id and name
export function createToken(id, name, scope) {
  // Sign the JWT
  return jwt.sign({ id: id, name: name, scope: scope }, secret, { algorithm: 'HS256', expiresIn: "5h" } );
}

// Verify authentication request credentials
export function verifyCredentials(req, res) {
  const password = req.payload.password;
  const email = req.payload.email;

  return knex.select('id', 'password', 'name').from('employees').where('email', email)
  .then(function(rows) {
    if (!rows.length) {
      res(Boom.badRequest('Incorrect email!'));
    }
    var user = rows[0];
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (isValid) {
        res(user);
      }
      else {
        res(Boom.badRequest('Incorrect password!'));
      }
    });
  });
}

// Get EMPLOYEE data from jwt
// DO NOT USE THIS TO GET MOBILE USER DATA!
export function bindEmployeeData(req, res) {
  try {
    var bearerToken = req.headers.authorization.slice(7);
    var decoded = jwt.verify(bearerToken, secret, {
      ignoreExpiration: false
    });
    var employeeId = decoded.id;

    knex.select('*').from('employees').where('id', employeeId)
    .then(function(rows) {
      if (!rows.length) {
        res(Boom.unauthorized('Invalid token'));
      } else {
        var user = rows[0];
        res(user);
      }
    })
    .catch(function(err) {
      console.log(err);
      res(Boom.unauthorized('Invalid token'));
    });
  } catch(e) {
    console.log(e);
    res(Boom.unauthorized('Invalid token'));
  }
}

// Get USER data from jwt
// Note that checking for expiration is ignored as we want to use the same token foreveeeer
export function bindUserData(req, res) {
  try {
    var bearerToken = req.headers.authorization.slice(7);
    var decoded = jwt.verify(bearerToken, secret, {
      ignoreExpiration: true
    });
    var userId = decoded.id[0];  // No idea why this is needed here but not in employee bind???
    knex.select('*').from('users').where('id', userId)
    .then(function(rows) {
      if (!rows.length) {
        res(Boom.unauthorized('Invalid token'));
      } else {
        var user = rows[0];
        res(user);
      }
    })
    .catch(function(err) {
      console.log(err);
      res(Boom.unauthorized('Invalid token'));
    });
  } catch(e) {
    res(Boom.unauthorized('Invalid token'));
  }
}
