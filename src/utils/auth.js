import Boom from 'boom';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import config from './config';
import knex from './db';

const bearerRegex = /(Bearer\s+)*(.*)/i;

// Check that a decoded JWT contains all required fields
export const validateJwt = (decoded, request, callback) => {
  const invalidToken = !decoded.id || !decoded.scope;

  if (invalidToken) {
    callback(new Error('JWT is missing some fields and not valid! Please log out and in again.'), false);
  } else {
    callback(null, true);
  }
};

// Hapi pre handler which fetches all fields from JWT
export const bindEmployeeData = (request, reply) => {
  const authHeader = request.headers.authorization;

  // strip "Bearer" word from header if present
  const token = authHeader.match(bearerRegex)[2];
  const decoded = jwt.decode(token);

  reply(decoded);
};

// Hapi route config which makes sure employee has authenticated with `scope`
export const getAuthWithScope = scope => ({
  auth: { strategy: 'jwt', scope: ['admin', scope] },
  pre: [{ method: bindEmployeeData, assign: 'employee' }],
});

export const comparePasswords = (passwordAttempt, employee) => (
  new Promise((resolve, reject) => (
    bcrypt.compare(passwordAttempt, employee.password, (err, isValid) => {
      if (!err && isValid) {
        resolve(employee);
      } else {
        reject(`Incorrect password attempt by employee with email '${employee.email}'`);
      }
    })
  ))
);

// Hapi 'pre' method which verifies supplied employee credentials
export const preVerifyCredentials = ({ payload: { email, password: passwordAttempt } }, reply) => (
  knex('employees')
    .first()
    .where({ email: email.toLowerCase().trim() })
    .leftJoin('secrets', 'employees.id', 'secrets.ownerId')
    .then((employee) => {
      if (!employee) {
        return Promise.reject(`Employee with email '${email}' not found in database`);
      }
      if (!employee.password) {
        return Promise.reject(`Employee with email '${email}' lacks password: logins disabled`);
      }

      return comparePasswords(passwordAttempt, employee);
    })
    .then(reply)
    .catch(() => {
      // TODO: log err to server console
      reply(Boom.unauthorized('Incorrect email or password!'));
    })
);

// Hapi route config which performs employee authentication
export const doAuth = ({
  validate: {
    payload: {
      email: Joi.string().required(),
      password: Joi.string().required(),
    },
    failAction: (request, reply) => (
      reply(Boom.unauthorized('Incorrect email or password!'))
    ),
  },
  pre: [
    { method: preVerifyCredentials, assign: 'employee' },
  ],
});

// Create a new JWT for employee with `email` and `scope`
export const createToken = fields => ({
  token: jwt.sign(fields, config.auth.secret, {
    algorithm: config.auth.options.algorithms[0],
  }),
});

// Return promise which resolves to hash of given password
export const hashPassword = password => (
  new Promise((resolve, reject) => {
    bcrypt.genSalt(config.auth.saltRounds, (saltErr, salt) => {
      if (saltErr) {
        reject(saltErr);
      }
      bcrypt.hash(password, salt, (hashErr, hash) => {
        if (hashErr) {
          reject(hashErr);
        } else {
          resolve(hash);
        }
      });
    });
  })
);

export const generatePassword = () =>
  Array(8)
  .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
  .map(x => x[Math.floor(Math.random() * x.length)]).join('');
