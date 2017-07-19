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

const editProfileFields = {
  payload: {
    assigneeId: Joi.string().allow(null),
    showAlerts: Joi.boolean(),
    alertDismissedAt: Joi.string(),
  },
};

const filters = {
  query: {
    assigneeName: Joi.string().allow(''),
    assigneeId: Joi.string().allow(''),
    name: Joi.string().allow(''),
    birthYear: Joi.number().integer(),
    order: Joi.string().allow('asc', 'desc'),
    orderBy: Joi.string().allow('name', 'email', 'assigneeName', 'alert'),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
    alert: Joi.number().integer(),
  },
};

const routeConfigs = [
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
      ...getAuthWithScope('admin'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
