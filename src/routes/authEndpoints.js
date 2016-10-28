import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';

import {
  hashPassword,
  createToken,
  verifyCredentials,
  checkIfEmailAvailable
} from '../utils/authUtil';



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
    const name = request.payload['name'];
    knex('users').insert({
      name: name
    })
    .returning('id')
    .then(function(id) {
      const token = createToken(
        id,
        name,
        'user',
        null,
        true
      );

      // Reply with token
      return reply({ token });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};
