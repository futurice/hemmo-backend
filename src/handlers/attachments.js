import Boom from 'boom';

import { dbGetAttachment, dbCreateAttachment } from '../models/attachments';

export const getAttachment = (request, reply) =>
  dbGetAttachment(request.params.attachmentId)
    .then(result => reply(result.data).type(result.mime))
    .catch(err => reply(Boom.badImplementation(err)));

export const createAttachment = (request, reply) => {
  const bufs = [];

  if (typeof request.payload.data === 'string') {
    dbCreateAttachment(
      request.params.feedbackId,
      request.payload.data,
      'application/text',
    )
      .then(reply)
      .catch(err => reply(Boom.badImplementation(err)));
  } else {
    request.payload.data.on('data', chunk => bufs.push(chunk));
    request.payload.data.on('end', () =>
      dbCreateAttachment(
        request.params.feedbackId,
        Buffer.concat(bufs),
        request.payload.data.hapi.headers['content-type'],
      )
        .then(reply)
        .catch(err => reply(Boom.badImplementation(err))),
    );
  }
};
