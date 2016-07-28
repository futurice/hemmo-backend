import knex from '../db'
import Boom from 'boom';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from 'joi';
import uuid from 'node-uuid';
import fs from 'fs';
import path from 'path';

import {
  hashPassword,
  createToken,
  verifyCredentials,
  bindEmployeeData,
  bindUserData
} from '../utils/authUtil';

let mkdirp = Promise.promisify(require('mkdirp'));

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
