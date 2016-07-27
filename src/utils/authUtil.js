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
export function createToken(id, name) {
  // Sign the JWT
  return jwt.sign({ id: id, name: name }, secret, { algorithm: 'HS256', expiresIn: "5h" } );
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
