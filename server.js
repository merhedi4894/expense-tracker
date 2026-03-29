require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI; // আমরা Render থেকে এটি পাস করব

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

// --- Schema ---
const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    date: Date,
    month: Number,
    year: Number
});
const Expense = mongoose.model('Expense', expenseSchema);

// --- Admin Credentials ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456'; // আপনি চাইলে এখানে পাসওয়ার্ড বদলে ফেলতে পারেন

// --- Routes ---

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'ভুল তথ্য!' });
    }
});

// Add Expense
app.post('/api/add-expense', async (req, res) => {
    try {
        const { description, amount, date } = req.body;
        const d = new Date(date);
        
        const newExpense = new Expense({
            description,
            amount,
            date: d,
            month: d.getMonth() + 1,
            year: d.getFullYear()
        });
        
        await newExpense.save();
        res.json({ success: true, message: 'খরচ সেভ হয়েছে' });
   } catch (error) {
    console.error("Save Error:", error); // এই লাইনটি যোগ হলো
    res.status(500).json({ success: false, message: error.message }); // এরর মেসেজ দেখাবে
}
});

// Get Expenses
app.get('/api/expenses', async (req, res) => {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const expenses = await Expense.find(query).sort({ date: -1 });
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    res.json({ expenses, total });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
