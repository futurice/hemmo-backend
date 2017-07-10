import uuid from 'uuid/v4';
import knex from '../utils/db';

export const dbCreateContent = fields => (
  knex('content').insert({
    id: uuid(),
    ...fields,
    questions: JSON.stringify(fields.questions),
    moods: JSON.stringify(fields.moods),
  })

  .then(results => results[0])
);

export const dbUpdateContent = (id, fields) => (
  knex('content').update(fields)
  
  .where({ id })
  .then(results => results[0])
);
