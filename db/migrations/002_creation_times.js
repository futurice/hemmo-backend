/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .table('users', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    .table('employees', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    .table('sessions', function(table) {
      table.renameColumn('startedAt', 'createdAt');
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('users', function(table) {
      table.dropColumn('createdAt');
    })
    .table('employees', function(table) {
      table.dropColumn('createdAt');
    })
    .table('sessions', function(table) {
      table.renameColumn('createdAt', 'startedAt');
    })
};
