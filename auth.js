const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = [];
const SECRET = 'rcstilo_super_secreto';

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  const hashed = await bcrypt.hash(senha, 10);
  users.push({ id: Date.now(), nome, email, senha: hashed });
  res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) return res.status(401).json({ message: 'Senha inválida' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;