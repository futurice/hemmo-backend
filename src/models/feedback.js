import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';
import { dbGetChild } from './children';

export const dbGetFeedback = (filters, employeeId, scope) => {
  const isAdmin = scope === 'admin';
  const order = filters.order === 'desc' ? 'desc' : 'asc';
  let bindings = [];
  let query;

  const select = `select f.*, c.name as "childName", c.id as "childId", c."assigneeId" as "assigneeId", e.name as "assigneeName" `;

  // Base query to get only assigned children
  if (filters.assigneeId) {
    query = `from children c, feedback f
      left join employees e on f."assigneeId" = e.id
      where f."assigneeId" = '${employeeId}'
        and c.id = f."childId"`;
  } else if (!filters.assigneeId && !isAdmin) {
    // Base query to see as much as allowed
    query = `from organisation parent, organisation child, employees ce, employees e, children c, feedback f
      where f."assigneeId" = '${employeeId}'
        and ce."organisationId" = parent.id
        and child."leftId" between parent."leftId" and parent."rightId"
        and e."organisationId" = child.id
        and c.id = f."childId"`;
  } else if (!filters.assigneeId && isAdmin) {
    // Base query if user is an admin no restrictions by assignee ID
    query = `from children c, feedback f
      left join employees e on f."assigneeId" = e.id
      where c.id = f."childId"`;
  }

  // Additional search filters
  if (filters.assigneeName) {
    bindings.push(filters.assigneeId);
    query += ` and LOWER(e.name) LIKE '%' || LOWER(?) || '%'`;
  }

  if (filters.childName) {
    bindings.push(filters.childName);
    query += ` and LOWER(c.name) LIKE '%' || LOWER(?) || '%'`;
  }

  // Sorting
  bindings.push(filters.orderBy || 'c.name');
  query += ` order by ? ${order}`;

  return {
    select,
    query,
    bindings,
  };
};

export const dbGetFeedbackGivenMoods = filters =>
  knex('feedback')
    .select(['feedback.id', 'feedback.givenMood', 'feedback.createdAt'])
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
    .leftOuterJoin('employees', 'feedback.assigneeId', 'employees.id')
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

export const dbCreateFeedback = async (childId, fields) => {
  const child = await dbGetChild(childId);

  return knex('feedback')
    .insert({
      ...fields,
      activities: fields.activities && JSON.stringify(fields.activities),
      moods: fields.moods && JSON.stringify(fields.moods),
      id: uuid(),
      childId,
      assigneeId: child.assigneeId,
    })
    .returning('*')
    .then(results => results[0]);
};

export const dbUpdateFeedback = async (id, fields) => {
  const update = await knex('feedback')
    .update({
      ...fields,
      activities: fields.activities && JSON.stringify(fields.activities),
      moods: fields.moods && JSON.stringify(fields.moods),
    })
    .where({ id })
    .returning('*')
    .then(results => results[0]);

  return dbGetSingleFeedback(update.id);
};
