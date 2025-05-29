// backend_rcstilo/auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database.js';

const SECRET = process.env.JWT_SECRET || 'segredo123';

export async function registerUser(req, res) {
  const { nome, email, senha } = req.body;
  try {
    const existing = await db('users').where({ email }).first();
    if (existing) return res.status(400).json({ erro: 'E-mail já registrado' });

    const senha_hash = await bcrypt.hash(senha, 10);
    const [id] = await db('users').insert({ nome, email, senha_hash });
    const token = jwt.sign({ id, email }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no registro' });
  }
}

export async function loginUser(req, res) {
  const { email, senha } = req.body;
  try {
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(400).json({ erro: 'Usuário não encontrado' });

    const match = await bcrypt.compare(senha, user.senha_hash);
    if (!match) return res.status(401).json({ erro: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no login' });
  }
}

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ erro: 'Token inválido' });
  }
}
