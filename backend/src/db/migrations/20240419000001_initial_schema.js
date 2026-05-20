exports.up = async function(knex) {
  await knex.schema
    .createTable('shops', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('address');
      table.string('phone');
      table.uuid('owner_id').notNullable();
      table.timestamps(true, true);
    })
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('name').notNullable();
      table.enum('role', ['owner', 'employee']).notNullable().defaultTo('employee');
      table.uuid('shop_id').references('id').inTable('shops').onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('customers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('shop_id').references('id').inTable('shops').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('phone');
      table.string('email');
      table.string('address');
      table.decimal('balance', 12, 2).notNullable().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('shop_id').references('id').inTable('shops').onDelete('CASCADE');
      table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.enum('type', ['credit', 'payment']).notNullable();
      table.decimal('amount', 12, 2).notNullable();
      table.string('description');
      table.string('reference_number');
      table.boolean('is_deleted').notNullable().defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('receipts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
      table.string('receipt_number').notNullable();
      table.string('pdf_path');
      table.timestamps(true, true);
    });

  await knex.schema.alterTable('shops', (table) => {
    table.foreign('owner_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

exports.down = async function(knex) {
  await knex.schema
    .dropTableIfExists('receipts')
    .dropTableIfExists('transactions')
    .dropTableIfExists('customers')
    .dropTableIfExists('users')
    .dropTableIfExists('shops');
};
