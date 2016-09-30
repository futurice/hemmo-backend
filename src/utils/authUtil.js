const bcrypt = require('bcrypt');
import Promise from 'bluebird';
const jwt = require('jsonwebtoken');
import config from '../config';
import knex from '../db';
const secret = config.auth.secret;
import Boom from 'boom';

export function checkIfEmailAvailable(req, res) {
  const email = req.payload.email;
  knex.select('id').from('employees').where('email', email)
  .then(function(rows) {
    if (!rows.length) {
      res();
    } else {
      res(Boom.badRequest('Email already in use!'));
    }
  });
}

export function hashPassword(password) {
  // Generate a salt at level 10 strength
  const promise = new Promise(
    function(resolve, reject) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err);
        }
        bcrypt.hash(password, salt, (error, hash) => {
          if (error) {
            reject(error);
          } else {
            resolve(hash);
          }
        });
      });
    }
  );
  return promise;
}

let jwtExpirationHours = 5;
// Crate a json web token for user id and name
export function createToken(id, name, scope) {
  // Sign the JWT
  return {
    token: jwt.sign({id: id, name: name, scope: scope}, secret, {algorithm: 'HS256', expiresIn: jwtExpirationHours + 'h'}),
    expiresIn: jwtExpirationHours * 60 * 60 * 1000 // in milliseconds
  };
}

// Verify authentication request credentials
export function verifyCredentials(req, res) {
  const password = req.payload.password;
  const email = req.payload.email;

  return knex.select('id', 'password', 'verified', 'name').from('employees').where('email', email)
  .then(function(rows) {
    if (!rows.length) {
      return res(Boom.badRequest('Incorrect email or password!'));
    }

    const user = rows[0];
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (isValid) {
        console.log(user.verified);
        if (user.verified) {
          res(user);
        } else {
          res(Boom.badRequest('User account is not verified. Have another employee verify your account through Preferences!'));
        }
      }
      else {
        res(Boom.badRequest('Incorrect email or password!'));
      }
    });
  });
}

// Get EMPLOYEE data from jwt
// DO NOT USE THIS TO GET MOBILE USER DATA!
export function bindEmployeeData(req, res) {
  try {
    const bearerToken = req.headers.authorization.slice(7);
    const decoded = jwt.verify(bearerToken, secret, {
      ignoreExpiration: false
    });
    const employeeId = decoded.id;
    const name = decoded.name;

    console.log(decoded);

    knex.first('id', 'name', 'email').from('employees').where({id: employeeId, name: name})
    .then(function(employee) {
      if (!employee) {
        res(Boom.unauthorized('Invalid token'));
      } else {
        res(employee);
      }
    })
    .catch(function(err) {
      console.log(err);
      res(Boom.badRequest(err));
    });
  } catch (e) {
    console.log(e);
    res(Boom.badRequest(e));
  }
}

// Get USER data from jwt
// Note that checking for expiration is ignored as we want to use the same token foreveeeer
export function bindUserData(req, res) {
  try {
    const bearerToken = req.headers.authorization.slice(7);
    const decoded = jwt.verify(bearerToken, secret, {
      ignoreExpiration: true
    });
    const userId = decoded.id[0];
    const name = decoded.name;
    knex.first('id', 'name', 'assigneeId').from('users').where({id: userId, name: name})
    .then(function(user) {
      if (!user) {
        res(Boom.unauthorized('Invalid token'));
      } else {
        res(user);
      }
    })
    .catch(function(err) {
      console.log(err);
      res(Boom.unauthorized('Invalid token'));
    });
  } catch (e) {
    res(Boom.unauthorized('Invalid token'));
  }
}
