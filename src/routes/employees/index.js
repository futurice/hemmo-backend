import knex from 'db';
import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';

import {
  hashPassword,
  createToken,
  bindEmployeeData,
  verifyCredentials,
  checkIfEmailAvailable
} from '../../utils/authUtil';

const register = {
  validate: {
    payload: {
      name: Joi.string().required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().required(),
      locale: Joi.string().optional()
    }
  },
  pre: [
    {method: checkIfEmailAvailable}
  ],
  handler: (request, reply) => {
    const name = request.payload['name'];
    const email = request.payload['email'];
    const password = request.payload['password'];
    const locale = request.payload['locale'] || 'en';

    let hashedPassword = '';
    let verified = false;

    hashPassword(password)
    .then(function(hashed) {
      hashedPassword = hashed;
      return knex('employees')
        .where('verified', true)
        .count('verified');
    })
    .then(function(result) {
      // If there are no verified users in the DB, automatically verify newly
      // created user. Otherwise keep user unverified until a verified employee
      // verifies them.
      verified = !parseInt(result[0].count);

      return knex('employees').insert({
        name: name,
        email: email,
        password: hashedPassword,
        verified: verified,
        locale: locale
      }).returning('id');
    })
    .then(function(id) {
      if (verified) {
        const token = createToken(
          id,
          name,
          'employee',
          { locale }
        );

        return reply({ token });
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

const authenticate = {
  validate: {
    payload: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  pre: [
    {method: verifyCredentials, assign: 'employee'}
  ],
  handler: (request, reply) => {
    // If password was incorrect, error is issued from the pre method verifyCredentials
    const token = createToken(request.pre.employee.id, request.pre.employee.name, 'employee', {
      locale: request.pre.employee.locale
    });
    reply({ token });
  }
};

const renewAuth = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: (request, reply) => {
    // Create a new token based on the old one
    const token = createToken(
      request.auth.credentials.id,
      request.auth.credentials.name,
      'employee',
      request.auth.credentials.data
    );

    reply({ token });
  }
};

const changePassword = {
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
  handler: (request, reply) => {
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

const del = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      employeeId: Joi.number().required()
    }
  },
  handler: (request, reply) => {
    const employeeId = request.params.employeeId;

    knex('employees').where('id', employeeId).del()
    .then(results => {
      return reply({ deletedEmployees: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete employee'));
    });
  }
};

const verify = {
  validate: {
    params: {
      employeeId: Joi.number().required(),
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: (request, reply) => {
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

const list = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: (request, reply) => {
    knex('employees').select('name', 'id', 'verified').bind({})
    .then(function(employees) {
      const empl = _.map(employees, function(employee) {
        return {
          name: employee.name,
          employeeId: employee.id,
          verified: employee.verified
        };
      });
      return reply({
        employees: empl
      });
    })
    .catch(function(err) {
      return reply(Boom.badImplementation('Failed to find employees', err));
    });
  }
};

const getEmployee = {
  validate: {
    params: {
      employeeId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: (request, reply) => {
    const employeeId = request.params.employeeId;
    knex.first('name', 'email', 'verified').from('employees').where('id', employeeId).bind({})
    .then(function(employee) {
      if (!employee) {
        throw new Error('Employee not found.');
      }
      this.employee = employee;
      return reply({
        name: this.employee.name,
        email: this.employee.email,
        verified: this.employee.verified
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to get employee data'));
    });
  }
};

export default [
  {
    method: 'POST',
    path: '/employees/register',
    config: register
  }, {
    method: 'POST',
    path: '/employees/authenticate',
    config: authenticate
  }, {
    method: 'POST',
    path: '/employees/renewauth',
    config: renewAuth
  }, {
    method: 'POST',
    path: '/employees/password',
    config: changePassword
  }, {
    method: 'DELETE',
    path: '/employees/{employeeId}',
    config: del
  }, {
    method: 'POST',
    path: '/employees/verify/{employeeId}',
    config: verify
  }, {
    method: 'GET',
    path: '/employees',
    config: list
  }, {
    method: 'GET',
    path: '/employees/{employeeId}',
    config: getEmployee
  }
];
