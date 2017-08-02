exports.up = knex =>
  knex.schema
    /**
     * Organisation tree
     *
     * Structured tree where employees belongs in the organisation
     */
     .createTableIfNotExists('organisation', table => {
      table.increments('id').primary();
      table.text('name');
      table.integer('leftId');
      table.integer('rightId');
    })
    /**
     * Employees table
     *
     * Contains info on all employees in the system
     */
    .createTableIfNotExists('employees', table => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.enum('scope', ['admin', 'employee']).notNullable();
      table.text('email').notNullable().unique();
      table.text('name').notNullable();
      table.text('locale').notNullable().defaultTo('en');
      table.boolean('active').notNullable().defaultTo(false);
      table.integer('organisationId')
        .references('id')
        .inTable('organisation')
        .onDelete('SET NULL');
    })
    /**
     * Define a separate table for storing employee secrets (such as password hashes).
     *
     * The rationale is:
     *   - Have to explicitly join/query password table to access secrets
     *   - Don't have to filter out secrets in every 'employees' table query
     *
     * => Harder to accidentally leak out employee secrets
     *
     * You may want to store other employee secrets in this table as well.
     */
    .createTableIfNotExists('secrets', table => {
      table
        .text('ownerId')
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
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
    .createTableIfNotExists('children', table => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.text('name').notNullable();
      table.integer('birthYear');
      table.boolean('showAlerts').defaultTo(true);
      table.timestamp('alertDismissedAt').defaultTo(knex.fn.now());
      table
        .text('assigneeId')
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL');
    })
    /**
     * Feedback sessions
     *
     * Each time a child uses the Hemmo app, a new feedback session is created
     */
    .createTableIfNotExists('feedback', table => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table
        .text('childId')
        .references('id')
        .inTable('children')
        .notNullable()
        .onDelete('CASCADE');
      table.integer('givenMood').defaultTo(null);
      table.json('activities').defaultTo('[]');
      table.json('moods').defaultTo('[]');
      table.boolean('reviewed').notNullable().defaultTo(false);
      table
        .text('assigneeId')
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL');
    })
    /**
     * Attachments
     *
     * Attachments can be added to feedback. Attachments can be of any filetype.
     */
    .createTableIfNotExists('attachments', table => {
      table.text('id').primary();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table
        .text('feedbackId')
        .references('id')
        .inTable('feedback')
        .notNullable()
        .onDelete('CASCADE');
      table.text('mime').notNullable();
      table.binary('data').notNullable();
    });

exports.down = knex =>
  knex.schema
    .dropTableIfExists('employees')
    .dropTableIfExists('secrets')
    .dropTableIfExists('children')
    .dropTableIfExists('feedback')
    .dropTableIfExists('attachments')
    .dropTableIfExists('organisation');
