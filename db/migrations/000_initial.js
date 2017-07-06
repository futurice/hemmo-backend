exports.up = knex => (
  knex.schema
    /**
     * Users table
     *
     * Contains info on all users in the system
     */
    .createTableIfNotExists('users', (table) => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.enum('scope', ['admin', 'user']).notNullable();
      table.text('email').notNullable().unique();
      table.text('name').notNullable();
      table.text('locale').notNullable().defaultTo('en');
      table.boolean('verified').notNullable().defaultTo(false);
    })

    /**
     * Define a separate table for storing user secrets (such as password hashes).
     *
     * The rationale is:
     *   - Have to explicitly join/query password table to access secrets
     *   - Don't have to filter out secrets in every 'users' table query
     *
     * => Harder to accidentally leak out user secrets
     *
     * You may want to store other user secrets in this table as well.
     */
    .createTableIfNotExists('secrets', (table) => {
      table.text('ownerId').references('id').inTable('users').onDelete('CASCADE')
        .primary();
      table.text('password').notNullable();
    })

    /**
     * Children table
     *
     * Contains all registered children.
     * Children don't have a password - the only way to authenticate is by remembering
     * the generated JWT at registration time.
     */
    .createTableIfNotExists('children', (table) => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.text('name').notNullable();
      table.integer('birthYear');
      table.text('assigneeId').references('id').inTable('users').onDelete('SET NULL');
    })

    /**
     * Feedback sessions
     *
     * Each time a child uses the Hemmo app, a new feedback session is created
     */
    .createTableIfNotExists('feedback', (table) => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.text('childId').references('id').inTable('children').notNullable()
        .onDelete('CASCADE');
      table.boolean('reviewed').notNullable().defaultTo(false);
      table.text('assigneeId').references('id').inTable('users').onDelete('SET NULL');
    })

    /**
     * Feedback content
     *
     * Each time a child submits feedback through the Hemmo app (i.e. moves on to the next screen),
     * a new content row is added with feedbackId set to the feedback session id.
     */
    .createTableIfNotExists('content', (table) => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.text('feedbackId').references('id').inTable('feedback').notNullable()
        .onDelete('CASCADE');
      table.json('moods');
      table.json('questions');
    })
);

exports.down = knex => (
  knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('secrets')
    .dropTableIfExists('children')
    .dropTableIfExists('feedback')
    .dropTableIfExists('content')
);
