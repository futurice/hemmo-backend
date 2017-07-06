import Boom from 'boom';

import {
  dbCreateContent,
  dbUpdateContent,
} from '../models/content';

export const createContent = (request, reply) => (
  console.log(request.payload) || 
  dbCreateContent(request.payload)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)))
);

export const updateContent = (request, reply) => (
  dbUpdateContent(request.params.contentId, request.payload)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)))
);
