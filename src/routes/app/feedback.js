import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import { createFeedback, updateFeedback } from '../../handlers/feedback';

const fields = {
  payload: {
    activities: Joi.array().items(
      Joi.object().keys({
        main: Joi.string(),
        sub: Joi.string(),
        like: Joi.number(),
      }),
    ),
    moods: Joi.array().items(Joi.string()),
  },
};

const feedbackId = {
  params: {
    feedbackId: Joi.string(),
  },
};

const routeConfigs = [
  // Create new feedback session
  {
    method: 'POST',
    path: '/app/feedback',
    handler: createFeedback,
    config: {
      validate: fields,
      ...getAuthWithScope('child'),
    },
  },

  // Modify feedback session
  {
    method: 'PATCH',
    path: '/app/feedback/{feedbackId}',
    handler: updateFeedback,
    config: {
      validate: {
        ...fields,
        ...feedbackId,
      },
      ...getAuthWithScope('child'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
