import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';

import {
  hashPassword,
  createToken,
  verifyCredentials,
  checkIfEmailAvailable
} from '../utils/authUtil';

exports.employeeAuthentication = {
  validate: {
    payload: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  pre: [
    {method: verifyCredentials, assign: 'user'}
  ],
  handler: function(request, reply) {
    // If password was incorrect, error is issued from the pre method verifyCredentials
    const token = createToken(request.pre.user.id, request.pre.user.name, 'employee');
    reply({...token,
      employeeId: request.pre.user.id});
  }
};

exports.employeeRenewAuthentication = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const token = createToken(request.auth.credentials.id, request.auth.credentials.name, 'employee');
    reply({...token,
      employeeId: request.auth.credentials.id});
  }
};

exports.employeeRegistration = {
  validate: {
    payload: {
      name: Joi.string().required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().required()
    }
  },
  pre: [
    {method: checkIfEmailAvailable}
  ],
  handler: function(request, reply) {
    const name = request.payload['name'];
    const email = request.payload['email'];
    const password = request.payload['password'];
    let hashedPassword = '';
    let verified = false;

    hashPassword(password)
    .then(function(hashed) {
      hashedPassword = hashed;
      return knex('employees')
        .where('verified', true)
        .count('verified');
    })
    .then(function(count) {
      // If there are no verified users in the DB, automatically verify newly
      // created user. Otherwise keep user unverified until a verified employee
      // verifies them.
      verified = !count;

      return knex('employees').insert({
        name: name,
        email: email,
        password: hashedPassword,
        verified: !count
      }).returning('id');
    })
    .then(function(id) {
      if (verified) {
        const token = createToken(id, name, 'employee');
        return reply({...token, employeeId: id});
      } else {
        return reply({
          message: 'User registration successful, but user needs verification. Please have another employee verify user via Preferences, then proceed with logging in!'
        });
      }
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.employeeVerification = {
  validate: {
    params: {
      employeeId: Joi.number().required(),
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    return knex('employees').where('id', request.params.employeeId)
      .update({
        verified: true
      })
      .returning('id')
      .then(function(id) {
        return reply({
          employeeId: id,
          status: 'ok'
        });
      })
      .catch(function(err) {
        console.log(err);
        return reply(Boom.badRequest('Failed to change password'));
      });
  }
};

exports.employeeChangePassword = {
  validate: {
    payload: {
      employeeId: Joi.number().required(),
      password: Joi.string().min(6).required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const password = request.payload['password'];

    hashPassword(password)
    .then(function(hashed) {
      return knex('employees').where('id', request.payload['employeeId'])
      .update({
        password: hashed
      }).returning('id');
    })
    .then(function(id) {
      return reply({
        status: 'ok'
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to change password'));
    });
  }
};

exports.userRegistration = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    payload: {
      name: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    console.log(request.payload);
    const name = request.payload['name'];
    knex('users').insert({
      name: name
    })
    .returning('id')
    .then(function(id) {
      const token = createToken(id, name, 'user');
      // Reply with token
      return reply(token);
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};
