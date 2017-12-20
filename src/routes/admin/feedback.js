import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  getFeedback,
  getSingleFeedback,
  updateFeedback,
  delFeedback,
  getFeedbackGivenMoods,
} from '../../handlers/feedback';

const feedbackId = {
  params: {
    feedbackId: Joi.string().required(),
  },
};

const editFeedbackFields = {
  payload: {
    assigneeId: Joi.string().allow(null),
    reviewed: Joi.boolean().allow(null),
    givenMood: Joi.number()
      .integer()
      .allow(null),
  },
};

const filters = {
  query: {
    assigneeName: Joi.string().allow(''),
    assigneeId: Joi.string().allow(''),
    childName: Joi.string().allow(''),
    childId: Joi.string().allow(''),
    order: Joi.string().allow('asc', 'desc'),
    orderBy: Joi.string().allow('childName', 'createdAt', 'assigneeName'),
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

  // Get a list of moods
  {
    method: 'GET',
    path: '/admin/feedback/moods',
    handler: getFeedbackGivenMoods,
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
        ...editFeedbackFields,
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
      ...getAuthWithScope('employee'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
