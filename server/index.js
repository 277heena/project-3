require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const { User, Project, Inquiry } = require('./models');

const app = express();
const port = process.env.PORT || 5001;
const mongoUrl = process.env.MONGODB_URI;
if (!mongoUrl || !process.env.SESSION_SECRET) {
  console.error('Missing MONGODB_URI or SESSION_SECRET. Copy .env.example to .env.');
  process.exit(1);
}

mongoose.connect(mongoUrl).then(() => console.log('MongoDB connected')).catch((error) => {
  console.error('MongoDB connection failed:', error.message); process.exit(1);
});

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'archconnect.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
  store: MongoStore.create({ mongoUrl }),
  cookie: { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const requireAuth = (req, res, next) => req.session.userId ? next() : res.status(401).json({ message: 'Please log in first.' });

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ message: 'Enter a name, valid email, and password of at least 8 characters.' });
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    req.session.userId = user._id; res.status(201).json(publicUser(user));
  } catch (e) { next(e); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
    req.session.userId = user._id; res.json(publicUser(user));
  } catch (e) { next(e); }
});
app.post('/api/auth/logout', (req, res, next) => req.session.destroy((e) => e ? next(e) : res.clearCookie('archconnect.sid').json({ message: 'Logged out.' })));
app.get('/api/auth/me', async (req, res, next) => { try { if (!req.session.userId) return res.json(null); const u = await User.findById(req.session.userId); res.json(u ? publicUser(u) : null); } catch (e) { next(e); } });

app.get('/api/projects', async (_req, res, next) => { try { res.json(await Project.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
app.post('/api/projects', requireAuth, async (req, res, next) => { try { const p = await Project.create({ ...req.body, createdBy: req.session.userId }); res.status(201).json(p); } catch (e) { next(e); } });
app.put('/api/projects/:id', requireAuth, async (req, res, next) => { try { const p = await Project.findOneAndUpdate({ _id: req.params.id, createdBy: req.session.userId }, req.body, { new: true, runValidators: true }); if (!p) return res.status(404).json({ message: 'Project not found or not yours.' }); res.json(p); } catch (e) { next(e); } });
app.delete('/api/projects/:id', requireAuth, async (req, res, next) => { try { const p = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.session.userId }); if (!p) return res.status(404).json({ message: 'Project not found or not yours.' }); res.json({ message: 'Project deleted.' }); } catch (e) { next(e); } });

app.post('/api/inquiries', async (req, res, next) => {
  try {
    const { name, email, projectType, budget, timeline, message } = req.body;
    if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || !projectType || !budget || !timeline || !message) return res.status(400).json({ message: 'Complete every required inquiry field.' });
    const inquiry = await Inquiry.create({ name, email, projectType, budget, timeline, message, submittedBy: req.session.userId || null });
    res.status(201).json({ id: inquiry._id, message: 'Inquiry submitted. We will be in touch.' });
  } catch (e) { next(e); }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.use((req, res, next) => req.method === 'GET' ? res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')) : next());
}
app.use((err, _req, res, _next) => { console.error(err); res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: err.name === 'ValidationError' ? Object.values(err.errors).map(x => x.message).join(' ') : 'Something went wrong.' }); });
app.listen(port, () => console.log(`ArchConnect server running on port ${port}`));
