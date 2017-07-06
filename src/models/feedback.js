import uuid from 'uuid/v4';
import knex from '../utils/db';
import { dbGetChild } from './children';

export const dbCreateFeedback = async (childId) => {
  const child = await dbGetChild(childId);

  return knex('feedback')
    .insert({
      id: uuid(),
      childId,
      assigneeId: child.assigneeId,
    })
    .returning('*')
    .then(results => results[0]);
};
