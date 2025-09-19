import { Router } from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/serviceController';
import { login, changePassword } from '../controllers/authController';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { getAppointments, createAppointment, getAvailability, deleteAppointment } from '../controllers/appointmentController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// --- Rotas Públicas ---

// Auth
router.post('/auth/login', login);

// Serviços (leitura pública)
router.get('/services', getServices);

// Configurações (leitura pública)
router.get('/settings', getSettings);

// Agendamentos (disponibilidade e criação são públicos)
router.get('/appointments/availability', getAvailability);
router.post('/appointments', createAppointment);


// --- Rotas Protegidas (requerem autenticação de admin) ---

// Auth
router.post('/auth/change-password', authMiddleware, changePassword);

// Serviços (criação, atualização, exclusão)
router.post('/services', authMiddleware, createService);
router.put('/services/:id', authMiddleware, updateService);
router.delete('/services/:id', authMiddleware, deleteService);

// Configurações (atualização)
router.put('/settings', authMiddleware, updateSettings);

// Agendamentos (leitura e exclusão)
router.get('/appointments', authMiddleware, getAppointments);
router.delete('/appointments/:id', authMiddleware, deleteAppointment);


export default router;