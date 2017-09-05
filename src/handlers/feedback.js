import Boom from 'boom';

import {
  dbGetFeedback,
  dbGetSingleFeedback,
  dbDelFeedback,
  dbUpdateFeedback,
  dbCreateFeedback,
  dbGetFeedbackGivenMoods,
} from '../models/feedback';

import { countAndPaginate, countAndPaginateRaw } from '../utils/db';

export const getFeedback = (request, reply) =>
  countAndPaginateRaw(
    dbGetFeedback(
      request.query,
      request.pre.employee.id,
      request.pre.employee.scope,
    ),
    request.query.limit,
    request.query.offset,
  ).then(reply);

export const getFeedbackGivenMoods = (request, reply) => {
  countAndPaginate(
    dbGetFeedbackGivenMoods(request.query),
    request.query.limit,
    request.query.offset,
  ).then(reply);
};

export const getSingleFeedback = (request, reply) =>
  dbGetSingleFeedback(request.params.feedbackId).then(reply);

export const delFeedback = (request, reply) =>
  dbDelFeedback(request.params.feedbackId).then(reply);

export const updateFeedback = (request, reply) => {
  return dbUpdateFeedback(request.params.feedbackId, request.payload).then(
    reply,
  );
};

export const createFeedback = (request, reply) =>
  dbCreateFeedback(request.pre.employee.id, request.payload)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)));
