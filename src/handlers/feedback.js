import Boom from 'boom';

import {
  dbGetFeedback,
  dbGetSingleFeedback,
  dbDelFeedback,
  dbUpdateFeedback,
  dbCreateFeedback,
} from '../models/feedback';

import config from '../utils/config';

export const getFeedback = (request, reply) => dbGetFeedback(request.query).then(feedback =>
  reply({
    data: feedback.data,
    meta: {
      count: Number(feedback.cnt),
      limit: request.query.limit || config.defaults.limit,
      offset: request.query.offset || 0,
    },
  }),
);

export const getSingleFeedback = (request, reply) =>
  dbGetSingleFeedback(request.params.feedbackId).then(reply);

export const delFeedback = (request, reply) => dbDelFeedback(request.params.feedbackId).then(reply);

export const updateFeedback = (request, reply) => (
  dbUpdateFeedback(request.params.feedbackId, request.payload)
  .then(reply)
);

export const createFeedback = (request, reply) => (
  dbCreateFeedback(request.pre.employee.id)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)))
);
