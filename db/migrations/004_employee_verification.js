/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .table('employees', function(table) {
      table.boolean('verified').notNull().defaultTo(true);
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('employees', function(table) {
      table.dropColumn('verified');
    })
};
