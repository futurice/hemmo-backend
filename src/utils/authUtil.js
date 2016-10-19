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
export function createToken(id, name, scope, data, neverExpires) {
  const expiration = neverExpires ? null : `${jwtExpirationHours}h`;
  const expirationMs = neverExpires ? null : jwtExpirationHours * 60 * 60 * 1000;

  // Sign the JWT
  return {
    token: jwt.sign({id, name, scope, data}, secret, {algorithm: 'HS256', expiresIn: expiration}),
    expiresIn: expirationMs
  };
}

// Verify authentication request credentials
export function verifyCredentials(req, res) {
  const {email, password} = req.payload;

  return knex.first(
    'id',
    'password',
    'verified',
    'name',
    'locale'
  )
  .from('employees').where('email', email)
  .then(function(employee) {
    if (!employee) {
      return res(Boom.badRequest('Incorrect email or password!'));
    }

    bcrypt.compare(password, employee.password, (err, isValid) => {
      if (isValid) {
        if (employee.verified) {
          res(employee);
        } else {
          res(Boom.badRequest('Employee account is not verified. Have another employee verify your account through Preferences!'));
        }
      }
      else {
        res(Boom.badRequest('Incorrect email or password!'));
      }
    });
  })
  .catch(function(e) {
    console.log(e);
    res(Boom.badRequest('Unknown error verifying employee'));
  });
}

// Get employee data from JWT.
//
// NOTE: this does NOT validate the JWT, it is assumed to be valid at this
// point! The hapi-auth-jwt2 library must take care of that before passing
// the token on to here.
export function bindEmployeeData(req, res) {
  try {
    const bearerToken = req.headers.authorization.slice(7);
    const decoded = jwt.decode(bearerToken);

    const employeeId = decoded.id;
    const name = decoded.name;

    res(decoded);
  } catch (e) {
    console.log(e);
    res(Boom.badRequest(e));
  }
}

// Get user data from JWT.
//
// NOTE: this does NOT validate the JWT, it is assumed to be valid at this
// point! The hapi-auth-jwt2 library must take care of that before passing
// the token on to here.
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
