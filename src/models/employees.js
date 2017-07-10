import uuid from 'uuid/v4';
import knex, { likeFilter, exactFilter } from '../utils/db';

const employeeListFields = ['id', 'name', 'email', 'verified'];

export const dbGetEmployees = filters => (
  knex('employees')
    .select(employeeListFields)
    .where(likeFilter({
      assignedChildName: filters.assignedChildName,
      name: filters.name,
      email: filters.email,
    }))
    .andWhere(exactFilter({
      assignedChildId: filters.assignedChildId,
    }))
    .limit(filters.limit || 50)
    .offset(filters.offset)
    .orderBy(filters.orderBy || 'name', filters.order)
);

export const dbGetEmployee = id => (
  knex('employees')
    .select('*')
    .first()
    .where({ id })
);

export const dbUpdateEmployee = (id, fields) => (
  knex('employees')
    .update({ ...fields })
    .where({ id })
    .returning('*')
);

export const dbDelEmployee = id => (
  knex('employees')
    .where({ id })
    .del()
);

export const dbCreateEmployee = ({ password, ...fields }) => (
  knex.transaction(async (trx) => {
    const employee = await trx('employees')
      .insert({
        ...fields,
        id: uuid(),
      })
      .returning('*')
      .then(results => results[0]); // return only first result

    await trx('secrets')
      .insert({
        ownerId: employee.id,
        password,
      });

    return employee;
  })
);

export const dbVerifyEmployee = id => (
  knex('employees')
    .update({ verified: true })
    .where({ id })
    .returning('*')
);
