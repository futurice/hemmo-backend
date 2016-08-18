/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .table('content', function(table) {
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .table('sessions', function(table) {
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('content', function(table) {
      table.dropColumn('updatedAt');
    })
    .table('sessions', function(table) {
      table.dropColumn('updatedAt');
    })
};
