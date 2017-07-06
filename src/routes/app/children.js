import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  updateChild,
  registerChild,
} from '../../handlers/children';

const updateFields = {
  params: {
    childId: Joi.string().required(),
  },
  payload: {
    name: Joi.string().required(),
  },
};

const registrationFields = {
  payload: {
    name: Joi.string().required(),
  },
};

const routeConfigs = [
  // Register new child, requires employee authentication
  {
    method: 'POST',
    path: '/app/children',
    handler: registerChild,
    config: {
      validate: registrationFields,
      ...getAuthWithScope('user'),
    },
  },

  // Modify child profile, requires employee authentication
  {
    method: 'PATCH',
    path: '/app/children/{childId}',
    handler: updateChild,
    config: {
      validate: updateFields,
      ...getAuthWithScope('user'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
