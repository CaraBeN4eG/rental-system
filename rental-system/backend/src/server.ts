// cd 'C:\DocENt95\© UŁ\WMII\Programowanie aplikacji webowych\rental_system\projekt\'
// cd .\rental-system\backend\ | npm run dev
// cd .\rental-system\frontend\ | ng serve
// cd .\rental-system\backend\ | npx prisma studio

import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { equipmentRouter } from './modules/equipment/equipment.router';
import { categoriesRouter } from './modules/categories/categories.router';
import { clientsRouter } from './modules/clients/clients.router';
import { rentalsRouter } from './modules/rentals/rentals.router';
import { equipmentServiceRouter } from './modules/techcheck/equipmentService.router';
import { auditRouter } from './modules/audit/audit.router';
import { reportsRouter } from './modules/reports/reports.router';
import { usersRouter } from './modules/users/users.router';

const app = express();
const PORT = 3000;

// Zezwolenie na zapytania z frontendu
app.use
(cors
  ({
    origin: 'http://localhost:4200'
  })
);

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('api/equipmentService', equipmentServiceRouter);
app.use('/api/audit', auditRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on http://localhost:${PORT}`);
});