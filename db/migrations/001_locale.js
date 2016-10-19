/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .table('employees', function(table) {
      table.text('locale').notNullable().defaultTo('en');
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('employees').dropColumn('locale');
};
