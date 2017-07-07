import uuid from 'uuid/v4';
import knex, { likeFilter } from '../utils/db';
import { dbGetChild } from './children';

export const dbGetFeedback = filters => (
  knex('feedback')
    .select([
      'feedback.*',
      'children.name as childName',
      'children.id as childId',
      'children.assigneeId as assigneeId',
      'employees.name as assigneeName',
    ])
    .where(likeFilter({
      name: filters.name,
      childName: filters.childName,
      childId: filters.childId,
      assigneeName: filters.assigneeName,
      assigneeId: filters.assigneeId,
      reviewed: filters.reviewed,
    }))
    .limit(filters.limit || 50)
    .offset(filters.offset)
    .orderBy(filters.orderBy || 'children.name', filters.order)
    .leftOuterJoin('children', 'feedback.childId', 'children.id')
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
);

export const dbGetSingleFeedback = id => (
  knex('feedback')
    .first([
      'feedback.*',
      'children.name as childName',
      'children.id as childId',
      'children.assigneeId as assigneeId',
      'employees.name as assigneeName',
    ])
    .where({ 'feedback.id': id })
    .leftOuterJoin('children', 'feedback.childId', 'children.id')
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
);

export const dbDelFeedback = id => (
  knex('feedback')
    .where({ id })
    .del()
);

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

export const dbUpdateFeedback = (id, fields) => (
  knex('feedback')
    .update({ ...fields })
    .where({ id })
    .returning('*')
    .then(results => results[0])
);
