import uuid from 'uuid/v4';
import knex from '../utils/db';

export const dbCreateAttachment = (feedbackId, data, type) =>
  knex('attachments')
    .insert({
      id: uuid(),
      feedbackId,
      data,
      mime: type,
    })
    .returning(['id', 'feedbackId', 'mime'])
    .then(results => results[0]);

export const dbGetAttachment = id => knex('attachments').first().where({ id });
