const API = '/api/items';

const form = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submit');
const cancelBtn = document.getElementById('cancel');
const message = document.getElementById('message');
const rows = document.getElementById('item-rows');
const empty = document.getElementById('empty');

let editingId = null; // null = creating, number = updating

async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// READ
async function loadItems() {
  try {
    const items = await request(API);
    render(items);
  } catch (err) {
    message.textContent = err.message;
  }
}

function render(items) {
  rows.innerHTML = '';
  empty.hidden = items.length > 0;

  items.forEach(item => {
    const tr = document.createElement('tr');
    if (item.id === editingId) tr.classList.add('editing');

    [item.id, item.name, item.price].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value; // textContent avoids HTML injection
      tr.appendChild(td);
    });

    const actions = document.createElement('td');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(item));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => removeItem(item));

    actions.append(editBtn, delBtn);
    tr.appendChild(actions);
    rows.appendChild(tr);
  });
}

// CREATE / UPDATE
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.textContent = '';

  const body = JSON.stringify({ name: nameInput.value, price: priceInput.value });
  const headers = { 'Content-Type': 'application/json' };

  try {
    if (editingId === null) {
      await request(API, { method: 'POST', headers, body });
    } else {
      await request(`${API}/${editingId}`, { method: 'PUT', headers, body });
    }
    resetForm();
    loadItems();
  } catch (err) {
    message.textContent = err.message;
  }
});

function startEdit(item) {
  editingId = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  submitBtn.textContent = 'Update';
  cancelBtn.hidden = false;
  message.textContent = '';
  nameInput.focus();
  loadItems();
}

// DELETE
async function removeItem(item) {
  if (!confirm(`Delete "${item.name}"?`)) return;
  try {
    await request(`${API}/${item.id}`, { method: 'DELETE' });
    if (editingId === item.id) resetForm();
    loadItems();
  } catch (err) {
    message.textContent = err.message;
  }
}

function resetForm() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Submit';
  cancelBtn.hidden = true;
  message.textContent = '';
}

cancelBtn.addEventListener('click', () => { resetForm(); loadItems(); });

loadItems();