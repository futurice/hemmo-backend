import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

export const dbGetChildren = (filters, employeeId, scope) => {
  const isAdmin = scope === 'admin';
  const order = filters.order === 'desc' ? 'desc' : 'asc';
  let bindings = [];
  let threeMonthsAgo = new Date();
  let query;

  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo = Math.round(threeMonthsAgo.getTime() / 1000).toString();

  const select = `select (case when f."createdAt" < to_timestamp(${threeMonthsAgo}) and c."showAlerts" = true then 1 else 0 end) as alert, c.*, e.name as "assigneeName", f."createdAt" as "lastFeedbackDate"`;

  // Base query to get only assigned children
  if (filters.assigneeId) {
    query = `from employees e, children c
        left join (select "childId", max("createdAt") as "createdAt" from feedback group by "childId") f on f."childId" = c.id
        where c."assigneeId" = '${employeeId}'
          and c."assigneeId" = e.id`;
  } else if (!filters.assigneeId && !isAdmin) {
    // Base query to see as much as allowed
    query = `from employees e, organisation parent, organisation child, employees ce, children c
        left join (select "childId", max("createdAt") as "createdAt" from feedback group by "childId") f on f."childId" = c.id
        where ce.id = '${employeeId}'
          and ce."organisationId" = parent.id
          and child."leftId" between parent."leftId" and parent."rightId"
          and e."organisationId" = child.id
          and c."assigneeId" = e.id`;
  } else if (!filters.assigneeId && isAdmin) {
    // Base query if user is an admin no restrictions by assignee ID
    query = `from employees e, children c
        left join (select "childId", max("createdAt") as "createdAt" from feedback group by "childId") f on f."childId" = c.id
        where c."assigneeId" = e.id`;
  }

  // Additional search filters
  if (filters.name) {
    bindings.push(filters.name);
    query += ` and LOWER(c.name) LIKE '%' || LOWER(?) || '%'`;
  }

  if (filters.assigneeName) {
    bindings.push(filters.assigneeName);
    query += ` and LOWER(e.name) LIKE '%' || LOWER(?) || '%'`;
  }

  if (filters && filters.alert === 1) {
    query += ` and f."createdAt" < to_timestamp(${threeMonthsAgo})`;
  }

  // Sorting
  bindings.push(filters.orderBy || 'c.name');
  query += ` order by 1 desc, ? ${order}`;

  return {
    select,
    query,
    bindings,
  };
};

export const dbGetChild = id =>
  knex('children')
    .first([
      'children.*',
      'employees.name as assigneeName',
      'employees.email as assigneeEmail',
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

export const dbDelChild = id =>
  knex('children')
    .del()
    .where({ id });

export const dbCreateChild = fields =>
  knex('children')
    .insert({
      ...fields,
      id: uuid(),
    })
    .returning(['id', 'assigneeId', 'name'])
    .then(results => results[0]);

export const dbUpdateChild = (id, fields) =>
  knex('children')
    .update(fields)
    .where({ id })
    .then(() => {
      return dbGetChild(id);
    });
