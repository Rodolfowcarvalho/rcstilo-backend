// backend_rcstilo/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { createPreference, handleWebhook } from './mercadoPago.js';
import { db, saveOrder, updateOrderStatus } from './database.js';
import { registerUser, loginUser, verifyToken } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Registro e login
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

// Criar pedido e gerar link do Mercado Pago
app.post('/api/pedido', verifyToken, async (req, res) => {
  const { itens, valor_total } = req.body;
  const userId = req.user.id;
  const pedidoId = uuidv4();

  await saveOrder(pedidoId, userId, itens, valor_total);

  const preference = await createPreference(pedidoId, valor_total);
  res.json({ init_point: preference.init_point });
});

// Webhook Mercado Pago
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      const status = await handleWebhook(paymentId);
      if (status.pedidoId && status.status === 'approved') {
        await updateOrderStatus(status.pedidoId, 'pago');
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Erro no webhook');
  }
});

// Buscar pedidos do usuário
app.get('/api/pedidos', verifyToken, async (req, res) => {
  const pedidos = await db('orders').where({ user_id: req.user.id });
  res.json(pedidos);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

