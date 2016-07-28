import knex from '../db'
import Boom from 'boom';
import Joi from 'joi';

import {
  hashPassword,
  createToken,
  verifyCredentials,
  checkIfEmailAvailable
} from '../utils/authUtil';

exports.employeeAuthenticationConfig = {
  validate: {
    payload: {
      email: Joi.string().required(),
      password: Joi.string().min(6).required(),
    }
  },
  pre: [
    { method: verifyCredentials, assign: 'user' }
  ],
  handler: function (request, reply) {
    // If password was incorrect, error is issued from the pre method verifyCredentials
    var token = createToken(request.pre.user.id, request.pre.user.name, 'employee');
    reply({token: token});
  }
}

exports.employeeRegistrationConfig = {
  validate: {
    payload: {
      name: Joi.string().required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().required()
    }
  },
  pre: [
    { method: checkIfEmailAvailable }
  ],
  handler: function (request, reply) {
    console.log(request.payload);
    var name = request.payload['name'];
    var email = request.payload['email'];
    var password = request.payload['password'];

    hashPassword(password)
    .then(function(hashed) {
      return knex('employees').insert({
        name: name,
        email: email,
        password: hashed
      }).returning('id');
    })
    .then(function(id) {
      console.log(id);
      var token = createToken(id, name, 'employee');
      return reply({token: token});
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
}

exports.userRegistrationConfig = {
  validate: {
    payload: {
      name: Joi.string().required()
    }
  },
  handler: function (request, reply) {
    var name = request.payload['name'];
    knex('users').insert({
      name: name
    })
    .returning('id')
    .then(function(id) {
      var token = createToken(id, name, 'user');
      // Reply with token
      return reply({
        token: token
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
}
