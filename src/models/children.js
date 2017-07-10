import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

export const dbGetChildren = filters => (
  knex('children')
    .select(['children.*', 'employees.name as assigneeName'])
    .where(likeFilter({
      name: filters.name,
      assigneeName: filters.assigneeName,
    }))
    .andWhere(exactFilter({
      assigneeId: filters.assigneeId,
    }))
    .limit(filters.limit || 50)
    .offset(filters.offset)
    .orderBy(filters.orderBy || 'children.name', filters.order)
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
);

export const dbGetChild = id => (
  knex('children')
    .first(['children.*', 'employees.name as assigneeName'])
    .where({ 'children.id': id })
    .leftOuterJoin('employees', 'children.assigneeId', 'employees.id')
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
    .returning(['id', 'assigneeId', 'name'])
    .then(results => results[0])
);

export const dbUpdateChild = (id, fields) => (
  knex('children')
    .update({ ...fields })
    .where({ id })
    .returning(['id', 'assigneeId', 'name'])
    .then(results => results[0])
);
