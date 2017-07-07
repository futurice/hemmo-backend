import Boom from 'boom';

import { dbCreateFeedback } from '../models/feedback';

export const createFeedback = (request, reply) => (
  dbCreateFeedback(request.pre.employee.id)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)))
);
