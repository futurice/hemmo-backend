/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('token').unique().notNullable();
    })

    .createTable('employees', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('password').notNullable();
      table.string('email').notNullable().unique();
    })

    .createTable('sessions', function(table) {
      table.string('session_id').primary();
      table.integer('assignee_id').references('id').inTable('employees');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table.boolean('reviewed').defaultTo(false);
      table.timestamp('started_at').defaultTo(knex.fn.now());
    })

    .createTable('content', function(table) {
      table.string('content_id').primary();
      table.string('question');
      table.string('contentType').notNullable();
      table.string('contentPath');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.string('session_id').references('session_id').inTable('sessions').notNullable();
    })

    .then(function() {
      //return knex.raw('CREATE UNIQUE INDEX lower_case_email_idx ON users ((lower(email)))');
    });
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('employees')
  .dropTableIfExists('session')
  .dropTableIfExists('content')
  .dropTableIfExists('users');
};
