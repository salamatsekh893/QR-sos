import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ================= USER ROUTES =================
app.get('/api/users/:userId', async (req: Request, res: Response) => {
  // Prisma call: await prisma.user.findUnique({ where: { uid: req.params.userId } })
  res.json({ message: 'User endpoint ready for MySQL Prisma query' });
});

app.put('/api/users/:userId', async (req: Request, res: Response) => {
  // Prisma call: await prisma.user.upsert(...)
  res.json({ status: 'success' });
});

app.patch('/api/users/:userId/role', async (req: Request, res: Response) => {
  // Prisma call: await prisma.user.update(...)
  res.json({ status: 'updated' });
});

// ================= MEDICAL ROUTES =================
app.get('/api/medical/:userId', async (req: Request, res: Response) => {
  res.json({ message: 'Medical profile endpoint ready' });
});

app.put('/api/medical/:userId', async (req: Request, res: Response) => {
  res.json({ status: 'saved' });
});

app.get('/api/medical/:userId/contacts', async (req: Request, res: Response) => {
  res.json([]);
});

app.put('/api/medical/contacts/:contactId', async (req: Request, res: Response) => {
  res.json({ status: 'contact saved' });
});

app.delete('/api/medical/contacts/:contactId', async (req: Request, res: Response) => {
  res.json({ status: 'contact deleted' });
});

// ================= QR TAG ROUTES =================
app.get('/api/qr/:qrId', async (req: Request, res: Response) => {
  res.json({ message: 'QR Tag lookup endpoint ready' });
});

app.get('/api/qr/user/:userId', async (req: Request, res: Response) => {
  res.json([]);
});

app.put('/api/qr/:qrId', async (req: Request, res: Response) => {
  res.json({ status: 'QR tag saved' });
});

app.patch('/api/qr/:qrId/lock', async (req: Request, res: Response) => {
  res.json({ status: 'Lock toggled' });
});

// ================= SOS ROUTES =================
app.post('/api/sos', async (req: Request, res: Response) => {
  res.json({ status: 'SOS dispatched to MySQL DB' });
});

app.get('/api/sos/active', async (req: Request, res: Response) => {
  res.json([]);
});

app.patch('/api/sos/:alertId/status', async (req: Request, res: Response) => {
  res.json({ status: 'SOS status updated' });
});

// ================= ORDERS & WALLET =================
app.get('/api/orders/user/:userId', async (req: Request, res: Response) => {
  res.json([]);
});

app.post('/api/orders', async (req: Request, res: Response) => {
  res.json({ status: 'Order created' });
});

app.get('/api/wallet/transactions/:userId', async (req: Request, res: Response) => {
  res.json([]);
});

export default app;
