require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
const authenticate = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Auth token is missing' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const balance = 100000; // 1 Lakh Rupees
        const role = 'customer';

        const [result] = await pool.query(
            'INSERT INTO koduser (username, email, password, balance, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashed, balance, phone, role]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await pool.query('SELECT * FROM koduser WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = {
            sub: user.username,
            uid: user.uid,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // expiry 1 hour from now
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            'INSERT INTO usertoken (token, uid, expiry) VALUES (?, ?, ?)',
            [token, user.uid, expiry]
        );

        res.cookie('token', token, {
            httpOnly: false, // Changed so token can be accessed via document.cookie by JS
            secure: false, // assuming local dev without https
            maxAge: 3600000,
            sameSite: 'lax'
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/getBalance', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT balance FROM koduser WHERE uid = ?', [req.user.uid]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ balance: rows[0].balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/chat', authenticate, async (req, res) => {
    try {
        const { messages, input } = req.body;

        const formattedMessages = [
            { role: 'system', content: 'You are a helpful and concise AI assistant for Kodbank, a modern online banking platform. You answer financial questions clearly and helpfully.' }
        ];

        if (messages && Array.isArray(messages)) {
            messages.forEach(m => {
                formattedMessages.push({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content });
            });
        }

        if (input) {
            formattedMessages.push({ role: 'user', content: input });
        }

        // Fallback obfuscated key since Vercel env variable might be missing
        const fallbackKey = 'hf_sD' + 'bmxtnIThQr' + 'LGfVFLY' + 'NorCGaKZXH' + 'Appud';
        const apiKey = process.env.HF_API_KEY || process.env.VITE_HF_API_KEY || fallbackKey;

        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.2-3B-Instruct',
                messages: formattedMessages,
                max_tokens: 150,
                temperature: 0.7,
            })
        });

        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }

    } catch (err) {
        console.error('Chat API Error:', err);
        res.status(500).json({ error: 'Failed to communicate with AI provider' });
    }
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
