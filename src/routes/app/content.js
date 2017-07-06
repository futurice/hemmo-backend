import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  createContent,
  updateContent,
} from '../../handlers/content';

const contentFields = {
  payload: {
    feedbackId: Joi.string().required(),
    questions: Joi.array().items(
      Joi.object().keys({
        question: Joi.string(),
        like: Joi.number(),
        answer: Joi.string(),
      }),
    ),
    moods: Joi.array().items(Joi.string()),
  },
};

const routeConfigs = [
  // Append content to feedback session
  {
    method: 'POST',
    path: '/app/content',
    handler: createContent,
    config: {
      validate: contentFields,
      ...getAuthWithScope('child'),
    },
  },

  // Modify content
  {
    method: 'PATCH',
    path: '/app/content/{contentId}',
    handler: updateContent,
    config: {
      validate: contentFields,
      ...getAuthWithScope('child'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
