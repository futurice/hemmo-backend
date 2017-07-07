import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  getChildren,
  getChild,
  updateChild,
  delChild,
} from '../../handlers/children';

const childId = {
  params: {
    childId: Joi.string().required(),
  },
};

const registrationFields = {
  payload: {
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  },
};

const editProfileFields = {
  payload: {
    assigneeId: Joi.string().required(),
  },
};

const filters = {
  query: {
    assigneeName: Joi.string(),
    assigneeId: Joi.string(),
    name: Joi.string(),
    birthYear: Joi.number().integer(),
    order: Joi.string().allow('asc', 'desc'),
    orderBy: Joi.string().allow('name', 'email', 'assigneeName'),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
  },
};

const children = [
  // Get a list of all children
  {
    method: 'GET',
    path: '/admin/children',
    handler: getChildren,
    config: {
      validate: filters,
      ...getAuthWithScope('employee'),
    },
  },

  // Get info about a specific child
  {
    method: 'GET',
    path: '/admin/children/{childId}',
    handler: getChild,
    config: {
      validate: childId,
      ...getAuthWithScope('employee'),
    },
  },

  // Update child data
  {
    method: 'PATCH',
    path: '/admin/children/{childId}',
    handler: updateChild,
    config: {
      validate: {
        ...childId,
        ...editProfileFields,
      },
      ...getAuthWithScope('employee'),
    },
  },

  // Delete a child, admin only
  {
    method: 'DELETE',
    path: '/admin/children/{childId}',
    handler: delChild,
    config: {
      validate: childId,
      ...getAuthWithScope('employee'),
    },
  },
];

export default children;

// Here we register the routes
export const routes = server => server.route(children);
