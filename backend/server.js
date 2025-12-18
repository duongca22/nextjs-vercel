import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { usersData } from './data/users.js';
import { productsData } from './data/products.js';
import { addOrder, getOrdersByUser } from './data/orders.js';

const app = express();
const JWT_SECRET = 'ECOM_MOCK_SECRET';
const PORT = process.env.PORT || 4000;


app.set('trust proxy', 1);

const allowList = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nextjs-vercel-opal.vercel.app'
];

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (allowList.includes(origin)) return cb(null, true);
            try {
                const hostname = new URL(origin).hostname;
                if (hostname.endsWith('.vercel.app')) return cb(null, true);
            } catch (e) { }
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

app.options('*', cors());


app.use(express.json());

// In-memory (reset khi restart)
let users = [...usersData];
let products = [...productsData];

//auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = payload;
        next();
    });
}

// auth API
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
        return res.status(400).json({ message: 'Thiếu name/email/password' });

    if (users.some(u => u.email === email))
        return res.status(409).json({ message: 'Email đã tồn tại' });

    const id = Date.now().toString();
    const user = { id, name, email, role: 'user', password };
    users.push(user);

    const token = jwt.sign(
        { id, email, name, role: 'user' },
        JWT_SECRET,
        { expiresIn: '30m' }
    );
    res.status(201).json({ user: { id, name, email, role: 'user' }, token });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ message: 'Thiếu email/password' });

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Thông tin đăng nhập sai' });

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '30m' }
    );
    res.json({ token });
});

app.get('/api/users', auth, (req, res) => {
    res.json(users.map(({ password, ...u }) => u));
});

//products API
app.get('/api/products', (req, res) => {
    const { featured } = req.query;
    let list = products;

    if (featured === '1' || featured === 'true') {
        list = products.filter(p => p.featured);
    }

    res.json(list);
});

// order API
app.post('/api/orders', auth, (req, res) => {
    const userId = req.user.id;
    const { items, totalPrice, address, note } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const newOrder = {
        id: Date.now().toString(),
        userId,
        items,
        totalPrice,
        address: address || '',
        note: note || '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    addOrder(newOrder);
    res.status(201).json(newOrder);
});

app.get('/api/orders/my', auth, (req, res) => {
    const userId = req.user.id;
    const list = getOrdersByUser(userId);
    res.json(list);
});
app.listen(PORT, () => {
    console.log(`API chạy ở http://localhost:${PORT}`);
    console.log('Restart server để reset dữ liệu in-memory.');
});
