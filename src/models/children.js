import uuid from 'uuid/v4';
import knex from '../utils/db';

export const dbGetChildren = () => (
  knex('children')
    .select('*')
);

export const dbGetChild = id => (
  knex('children')
    .first()
    .where({ id })
);

export const dbDelChild = id => (
  knex('children')
    .where({ id })
    .del()
);

export const dbCreateChild = fields => (
  knex('children')
    .insert({
      ...fields,
      id: uuid(),
    })
    .returning(['id', 'name'])
    .then(results => results[0])
);

export const dbUpdateChild = (id, fields) => (
  knex('children')
    .update({ ...fields })
    .where({ id })
    .returning(['id', 'name'])
    .then(results => results[0])
);
