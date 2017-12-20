import Boom from 'boom';

import { sendMail } from '../utils/email';
import config from '../utils/config';

import { dbGetChild } from '../models/children';

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

export const createFeedback = async (request, reply) => {
  const child = await dbGetChild(request.pre.employee.id);

  dbCreateFeedback(request.pre.employee.id, request.payload)
    .then(feedback => {
      if (child.assigneeEmail) {
        sendMail({
          to: child.assigneeEmail,
          subject: `New feedback from ${child.name}`,
          body: `${child.name} has sent you feedback through Hemmo.\n\n

Please review the feedback via the following URL: ${config.adminUrl}/children/${
            child.id
          }/feedback/${feedback.id}`,
        });
      }

      return reply(feedback);
    })
    .catch(err => reply(Boom.badImplementation(err)));
};
