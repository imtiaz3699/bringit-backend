import express from 'express';
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ users: [] });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Example User' });
});

// POST /api/users
router.post('/', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

export default router;