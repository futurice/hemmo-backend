import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';
import { dbGetChild } from './children';

export const dbGetFeedback = filters =>
  knex('feedback')
    .select([
      'feedback.*',
      'children.name as childName',
      'children.id as childId',
      'children.assigneeId as assigneeId',
      'employees.name as assigneeName',
    ])
    /* Filter the feedback table */
    .where(
      likeFilter({
        name: filters.name,
        'children.name': filters.childName,
        'employees.name': filters.assigneeName,
        'feedback.reviewed': filters.reviewed,
      }),
    )
    .andWhere(
      exactFilter({
        'feedback.childId': filters.childId,
        'feedback.assigneeId': filters.assigneeId,
      }),
    )
    /* Join referred children and their assignees to table */
    .leftOuterJoin('children', 'feedback.childId', 'children.id')
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
    .orderBy(filters.orderBy || 'children.name', filters.order);

export const dbGetFeedbackMoods = filters =>
  knex('feedback')
    .select([
      'feedback.id',
      'feedback.mood',
      'feedback.createdAt'
    ])
    /* Filter the feedback table */
    .where(
      likeFilter({
        name: filters.name,
        'children.name': filters.childName,
        'employees.name': filters.assigneeName,
        'feedback.reviewed': filters.reviewed,
      }),
    )
    .andWhere(
      exactFilter({
        'feedback.childId': filters.childId,
        'feedback.assigneeId': filters.assigneeId,
      }),
    )
    /* Join referred children and their assignees to table */
    .leftOuterJoin('children', 'feedback.childId', 'children.id')
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
    .orderBy(filters.orderBy || 'children.name', filters.order);

export const dbGetSingleFeedback = id =>
  knex('feedback')
    .first([
      'feedback.*',
      'children.name as childName',
      'children.id as childId',
      'children.assigneeId as assigneeId',
      'employees.name as assigneeName',
      knex.raw(
        'COALESCE(' +
          'json_agg("feedbackAttachments") ' +
          // Fix for attachments array containing null if no attachments found
          'FILTER (WHERE "feedbackAttachments".id IS NOT NULL), ' +
          "'[]') as attachments",
      ),
    ])
    .where({ 'feedback.id': id })
    .leftOuterJoin('children', 'feedback.childId', 'children.id')
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
    .leftOuterJoin(
      knex('attachments')
        .select(['id', 'mime', 'feedbackId'])
        .as('feedbackAttachments'),
      'feedback.id',
      'feedbackAttachments.feedbackId',
    )
    .groupBy([
      'feedback.id',
      'children.name',
      'children.id',
      'children.assigneeId',
      'employees.name',
    ]);

export const dbDelFeedback = id => knex('feedback').del().where({ id });

export const dbCreateFeedback = async childId => {
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

export const dbUpdateFeedback = (id, fields) =>
  knex('feedback')
    .update(fields)
    .where({ id })
    .returning('*')
    .then(results => results[0]);
