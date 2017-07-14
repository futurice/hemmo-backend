import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import { createAttachment } from '../../handlers/attachments';

const fields = {
  payload: {
    data: Joi.any().required(),
  },
};

const feedbackId = {
  params: {
    feedbackId: Joi.string(),
  },
};

const routeConfigs = [
  // Add attachment to existing feedback session
  {
    method: 'POST',
    path: '/app/feedback/{feedbackId}/attachments',
    handler: createAttachment,
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
      },

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
