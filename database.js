// backend_rcstilo/database.js
import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './rcstilo.db',
  },
  useNullAsDefault: true,
});

// Criação de tabelas se não existirem
(async () => {
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('nome');
      table.string('email').unique();
      table.string('senha_hash');
    });
  }

  if (!(await db.schema.hasTable('orders'))) {
    await db.schema.createTable('orders', (table) => {
      table.string('id').primary();
      table.integer('user_id').references('id').inTable('users');
      table.string('status');
      table.float('valor_total');
      table.timestamp('data_criacao').defaultTo(db.fn.now());
    });
  }

  if (!(await db.schema.hasTable('order_items'))) {
    await db.schema.createTable('order_items', (table) => {
      table.increments('id').primary();
      table.string('order_id').references('id').inTable('orders');
      table.string('produto');
      table.string('estampa_url');
    });
  }
})();

// Funções de pedido
export async function saveOrder(orderId, userId, itens, valor_total) {
  await db('orders').insert({
    id: orderId,
    user_id: userId,
    status: 'aguardando_pagamento',
    valor_total,
  });

  for (const item of itens) {
    await db('order_items').insert({
      order_id: orderId,
      produto: item.produto,
      estampa_url: item.estampa,
    });
  }
}

export async function updateOrderStatus(orderId, status) {
  await db('orders').where({ id: orderId }).update({ status });
}
