/*eslint-disable func-names*/
'use strict';

// @TODO Review constraints
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').unique().notNullable();
    })

    .createTable('counter', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').unique().notNullable();
      table.integer('counter');
    })

    .then(function() {
      return knex.raw('CREATE UNIQUE INDEX lower_case_email_idx ON users ((lower(email)))');
    });
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('counter')
  .dropTableIfExists('users');
};
