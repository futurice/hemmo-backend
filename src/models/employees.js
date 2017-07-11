import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

const employeeListFields = ['id', 'name', 'email', 'active', 'createdAt'];

export const dbGetEmployees = filters => (
  knex('employees').select([
    'id',
    'name',
    'email',
    'active',
  ])

  /* Filter the employees table */
  .where(likeFilter({
    assignedChildName: filters.assignedChildName,
    name: filters.name,
    email: filters.email,
  }))
  .andWhere(exactFilter({
    assignedChildId: filters.assignedChildId,
  }))

  .orderBy(filters.orderBy || 'name', filters.order)
);

export const dbGetEmployee = id => (
  knex('employees').first()

  .where({ id })
);

export const dbUpdateEmployee = (id, fields) => (
  knex('employees').update(fields)

  .where({ id })
  .returning('*')
);

export const dbDelEmployee = id => (
  knex('employees').del()

  .where({ id })
);

export const dbCreateEmployee = ({ password, ...fields }) => (
  knex.transaction(async (trx) => {
    const employee = await trx('employees').insert({
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
  })
);