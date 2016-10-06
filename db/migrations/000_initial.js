/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .createTable('employees', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.increments('id').primary();
      table.text('name').notNullable();
      table.text('password').notNullable();
      table.text('email').notNullable().unique();
      table.boolean('verified').notNull().defaultTo(true);
    })

    .createTable('users', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.increments('id').primary();
      table.text('name').notNullable();
      table.integer('assigneeId').references('id').inTable('employees').onDelete('SET NULL');
    })

    .createTable('sessions', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.text('sessionId').primary();
      table.integer('userId').references('id').inTable('users').notNullable().onDelete('CASCADE');
      table.boolean('reviewed').defaultTo(false);
      table.integer('assigneeId').references('id').inTable('employees').onDelete('SET NULL');
    })

    .createTable('content', function(table) {
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.text('contentId').primary();
      table.text('sessionId').references('sessionId').inTable('sessions').notNullable().onDelete('CASCADE');
      table.json('moods');
      table.json('questions');
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
