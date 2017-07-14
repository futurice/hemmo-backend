import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import { getAttachment } from '../../handlers/attachments';

const attachmentId = {
  params: {
    attachmentId: Joi.string().required(),
  },
};

const routeConfigs = [
  // Get a list of all feedback
  {
    method: 'GET',
    path: '/admin/attachments/{attachmentId}',
    handler: getAttachment,
    config: {
      validate: attachmentId,
      ...getAuthWithScope('employee'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
