import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

export const dbGetChildren = filters => {
  let threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo = Math.round(threeMonthsAgo.getTime() / 1000);

  let query = knex('children')
    .select([
      'children.*',
      'employees.name as assigneeName',
      'feedback.createdAt as lastFeedbackDate',
      knex.raw(
        `case when "feedback"."createdAt" < to_timestamp(?) and "children"."showAlerts" = true then 1 else 0 end as alert`,
        threeMonthsAgo,
      ),
    ])
    .where(
      likeFilter({
        'children.name': filters.name,
        'employees.name': filters.assigneeName,
      }),
    )
    .andWhere(
      exactFilter({
        assigneeId: filters.assigneeId,
      }),
    )
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
    // Previous feedback
    .leftOuterJoin(
      knex('feedback')
        .select(['createdAt', 'childId'])
        .orderBy('createdAt', 'desc')
        .as('feedback'),
      'children.id',
      'feedback.childId',
    )
    .orderBy(filters.orderBy || 'children.name', filters.order);

  if (filters && filters.alert === 1) {
    query.whereRaw(`feedback.created < to_timestamp(?)`, threeMonthsAgo);
  }

  return query;
};

export const dbGetChild = id =>
  knex('children')
    .first([
      'children.*',
      'employees.name as assigneeName',
      'prevFeedback.prevFeedbackDate',
    ])
    .where({ 'children.id': id })
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
    // Previous feedback
    .leftOuterJoin(
      knex('feedback')
        .select(['createdAt as prevFeedbackDate', 'childId'])
        .orderBy('createdAt', 'desc')
        .as('prevFeedback'),
      'children.id',
      'prevFeedback.childId',
    );

export const dbDelChild = id => knex('children').del().where({ id });

export const dbCreateChild = fields =>
  knex('children')
    .insert({
      ...fields,
      id: uuid(),
    })
    .returning(['id', 'assigneeId', 'name'])
    .then(results => results[0]);

export const dbUpdateChild = (id, fields) =>
  knex('children').update(fields).where({ id }).then(() => {
    return dbGetChild(id);
  });
