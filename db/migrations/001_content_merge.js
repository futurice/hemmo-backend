/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('content')
    .createTable('content', function(table) {
      table.text('contentId').primary();
      table.text('sessionId').references('sessionId').inTable('sessions').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.json('moods');
      table.json('questions');
    });
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('content');
};
