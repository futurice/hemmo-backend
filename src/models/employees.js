import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

export const dbGetEmployees = filters =>
  knex('employees')
    .select(['employees.*', 'organisation.name as organisationName'])
    .leftJoin('organisation', 'employees.organisationId', 'organisation.id')
    /* Filter the employees table */
    .where(
      likeFilter({
        assignedChildName: filters.assignedChildName,
        name: filters.name,
        email: filters.email,
      }),
    )
    .andWhere(
      exactFilter({
        assignedChildId: filters.assignedChildId,
      }),
    )
    .orderBy(filters.orderBy || 'name', filters.order);

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
