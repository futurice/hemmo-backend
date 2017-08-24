import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

export const dbGetEmployees = (filters, employeeId, scope) => {
  let q = knex('employees')
    .countDistinct('children.id as childrenCount')
    .select(['employees.*', 'organisation.name as organisationName'])
    .leftJoin('organisation', 'employees.organisationId', 'organisation.id')
    .leftJoin('children', 'employees.id', 'children.assigneeId')
    /* Filter the employees table */
    .where(
      likeFilter({
        assignedChildName: filters.assignedChildName,
        'employees.name': filters.name,
        email: filters.email,
      }),
    )
    .andWhere(
      exactFilter({
        assignedChildId: filters.assignedChildId,
      }),
    )
    .groupBy('employees.id', 'organisation.name')
    .orderBy(filters.orderBy || 'employees.name', filters.order);

  // If employee doesn't have admin rights restrict what (s)he can see
  if (scope !== 'admin') {
    q.leftOuterJoin('employees as employee', 'employees.id', 'employees.id');
    q.innerJoin('organisation as org2', 'employee.organisationId', 'org2.id');
    q.andWhere('employee.id', employeeId);
    q.andWhere(knex.raw(`organisation."leftId" >= org2."leftId" AND organisation."rightId" <= org2."rightId"`));
  }

  return q;
}

export const dbGetEmployee = id =>
  knex('employees')
    .select(['employees.*', 'organisation.id as organisationId', 'organisation.name as organisationName'])
    .leftJoin('organisation', 'employees.organisationId', 'organisation.id')
    .where({ 'employees.id': id })
    .returning('*')
    .then(results => results[0]);

export const dbUpdateEmployee = (id, fields, password) => 
  knex.transaction(async trx => {
    const employee = await trx('employees')
      .update(fields)
      .where({ id })
      .returning('*')
      .then(results => results[0]);

    if (password) {
      await trx('secrets')
        .update({ password: password })
        .where({ ownerId: id });
    }

    return employee;
  });

export const dbDelEmployee = id => knex('employees').del().where({ id });

export const dbCreateEmployee = ({ password, ...fields }) =>
  knex.transaction(async trx => {
    const employee = await trx('employees')
      .insert({
        ...fields,
        id: uuid(),
      })
      .returning('*')
      .then(results => results[0]); // return only first result

    await trx('secrets').insert({
      ownerId: employee.id,
      password,
    });

    return employee;
  });
