import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  getFeedback,
  getSingleFeedback,
  updateFeedback,
  delFeedback,
} from '../../handlers/feedback';

const feedbackId = {
  params: {
    feedbackId: Joi.string().required(),
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
    childName: Joi.string(),
    childId: Joi.string(),
    order: Joi.string().allow('asc', 'desc'),
    orderBy: Joi.string().allow('name', 'email', 'createdAt', 'assigneeName'),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
    reviewed: Joi.bool(),
  },
};

const routeConfigs = [
  // Get a list of all feedback
  {
    method: 'GET',
    path: '/admin/feedback',
    handler: getFeedback,
    config: {
      validate: filters,
      ...getAuthWithScope('employee'),
    },
  },

  // Get info about a specific feedback session
  {
    method: 'GET',
    path: '/admin/feedback/{feedbackId}',
    handler: getSingleFeedback,
    config: {
      validate: feedbackId,
      ...getAuthWithScope('employee'),
    },
  },

  // Update feedback session data
  {
    method: 'PATCH',
    path: '/admin/feedback/{feedbackId}',
    handler: updateFeedback,
    config: {
      validate: {
        ...feedbackId,
        ...editProfileFields,
      },
      ...getAuthWithScope('employee'),
    },
  },

  // Delete feedback session
  {
    method: 'DELETE',
    path: '/admin/feedback/{feedbackId}',
    handler: delFeedback,
    config: {
      validate: feedbackId,
      ...getAuthWithScope('admin'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
