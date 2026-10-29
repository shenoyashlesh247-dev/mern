const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory "database": an array of items
let items = [
  { id: 1, name: 'Book', price: 250 },
  { id: 2, name: 'Pen', price: 25 }
];
let nextId = 3;

function validate(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = Number(body.price);
  if (!name) return { error: 'Name is required.' };
  if (body.price === '' || body.price === null || Number.isNaN(price) || price < 0)
    return { error: 'Price must be a number that is 0 or more.' };
  return { name, price };
}

// READ all
app.get('/api/items', (req, res) => res.json(items));

// READ one
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found.' });
  res.json(item);
});

// CREATE
app.post('/api/items', (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const item = { id: nextId++, name: v.name, price: v.price };
  items.push(item);
  res.status(201).json(item);
});

// UPDATE
app.put('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found.' });
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  item.name = v.name;
  item.price = v.price;
  res.json(item);
});

// DELETE
app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Item not found.' });
  const [removed] = items.splice(index, 1);
  res.json(removed);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));