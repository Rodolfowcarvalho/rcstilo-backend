const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let pedidos = [];

app.post('/pedido', (req, res) => {
  const pedido = { id: Date.now(), ...req.body };
  pedidos.push(pedido);
  res.status(201).json(pedido);
});

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

app.listen(3000, () => {
  console.log('Backend RC Stilo rodando na porta 3000');
});
