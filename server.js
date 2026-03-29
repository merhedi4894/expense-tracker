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
const MONGO_URI = process.env.MONGO_URI;

// ডাটাবেস কানেক্ট হচ্ছে কিনা চেক করা
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.log('MongoDB Connection Error:', err));

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
const ADMIN_PASS = '123456';

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

// Add Expense (এখানে এরর ডিটেইলস যোগ করা হয়েছে)
app.post('/api/add-expense', async (req, res) => {
    try {
        const { description, amount, date } = req.body;
        
        // চেক করা ডাটা আসছে কিনা
        if(!description || !amount || !date) {
            return res.json({ success: false, message: 'সব তথ্য পূরণ করুন!' });
        }

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
        // এই লাইনটি ব্রাউজারে আসল এররটি দেখাবে
        console.error("Save Error:", error);
        res.json({ success: false, message: `Server Error: ${error.message}` });
    }
});

// Get Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = {};
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const expenses = await Expense.find(query).sort({ date: -1 });
        const total = expenses.reduce((sum, item) => sum + item.amount, 0);
        res.json({ expenses, total });
    } catch (error) {
        res.json({ expenses: [], total: 0 });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
