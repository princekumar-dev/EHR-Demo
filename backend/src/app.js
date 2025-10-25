import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import lookupRoutes from './routes/lookupRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lookup', lookupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// provide a simple root route so requests to `/` don't trigger the Not Found middleware
app.get('/', (req, res) => {
  // If you prefer, this can redirect to the API docs: res.redirect('/api/docs');
  res.json({ message: 'API is running' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
