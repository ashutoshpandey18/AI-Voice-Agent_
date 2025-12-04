import express from 'express';
import { handleAgentMessage, clearSession, getSessionStatus } from '../controllers/agentController';
import { agentLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * Agent Routes
 * Handle conversation and slot-filling logic
 */

// Apply agent rate limiter to all routes
router.use(agentLimiter);

// Main agent endpoint
router.post('/message', handleAgentMessage);

// Optional: Session management endpoints
router.delete('/session/:sessionId', clearSession);
router.get('/session/:sessionId', getSessionStatus);

export default router;
