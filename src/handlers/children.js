import Boom from 'boom';

import { createToken } from '../utils/auth';
import {
  dbCreateChild,
  dbUpdateChild,
} from '../models/children';

export const registerChild = (request, reply) => (
  dbCreateChild(request.payload)
  .then(child => reply({
    ...child,
    ...createToken({
      id: child.id,
      scope: 'child',
    }),
  }))
  .catch(err => reply(Boom.badImplementation(err)))
);

export const updateChild = (request, reply) => (
  dbUpdateChild(request.params.childId, request.payload)
  .then(reply)
);
