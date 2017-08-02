import Joi from 'joi';

import { getAuthWithScope, doAuth } from '../../utils/auth';
import {
  getEmployees,
  getEmployee,
  updateEmployee,
  delEmployee,
  authEmployee,
  renewAuth,
  registerEmployee,
} from '../../handlers/employees';

const employeeId = {
  params: {
    employeeId: Joi.string().required(),
  },
};

const registrationFields = {
  payload: {
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    active: Joi.boolean().required(),
    organisationId: Joi.number().integer().allow(null),
  },
};

const editProfileFields = {
  payload: {
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    image: Joi.string(),
    locale: Joi.string(),
    active: Joi.boolean(),
    password: Joi.string().allow(''),
    resetPassword: Joi.boolean(),
    organisationId: Joi.number().integer().allow(null),
  },
};

const filters = {
  query: {
    assignedChildName: Joi.string(),
    assignedChildId: Joi.string(),
    include: Joi.string(),
    email: Joi.string(),
    name: Joi.string().allow(''),
    order: Joi.string().allow('asc', 'desc'),
    orderBy: Joi.string().allow('name', 'email', 'assignedChildName', 'organisationName'),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
  },
};

const routeConfigs = [
  // Get a list of all employees
  {
    method: 'GET',
    path: '/admin/employees',
    handler: getEmployees,
    config: {
      validate: filters,
      ...getAuthWithScope('employee'),
    },
  },

  // Get info about a specific employee
  {
    method: 'GET',
    path: '/admin/employees/{employeeId}',
    handler: getEmployee,
    config: {
      validate: employeeId,
      ...getAuthWithScope('employee'),
    },
  },

  // Update employee profile
  {
    method: 'PATCH',
    path: '/admin/employees/{employeeId}',
    handler: updateEmployee,
    config: {
      validate: {
        ...employeeId,
        ...editProfileFields,
      },
      ...getAuthWithScope('employee'),
    },
  },

  // Delete a employee, admin only
  {
    method: 'DELETE',
    path: '/admin/employees/{employeeId}',
    handler: delEmployee,
    config: {
      validate: employeeId,
      ...getAuthWithScope('admin'),
    },
  },

  // Authenticate as employee
  {
    method: 'POST',
    path: '/admin/employees/authenticate',
    handler: authEmployee,
    config: doAuth,
  },

  // Renew authentication token
  {
    method: 'GET',
    path: '/admin/employees/authenticate/renew',
    handler: renewAuth,
    config: getAuthWithScope('employee'),
  },

  // Register new employee, admin only
  {
    method: 'POST',
    path: '/admin/employees',
    handler: registerEmployee,
    config: {
      validate: registrationFields,
      ...getAuthWithScope('admin'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
