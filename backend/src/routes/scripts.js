import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

import { requireAuth } from '../middleware/auth.js';
import { saveScript, listScripts, getScript, deleteScript } from '../models/store.js';
import { generateScript } from '../services/scriptGenerator.js';

const router = Router();

// All script routes require authentication
router.use(requireAuth);

// ── POST /api/scripts/generate ────────────────────────────────────────────────
/**
 * Body: { symptoms: string[], tone?: string, duration?: number, title?: string }
 * Response: Script object
 */
router.post(
  '/generate',
  [
    body('symptoms')
      .isArray({ min: 1 })
      .withMessage('symptoms must be a non-empty array'),
    body('symptoms.*')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('each symptom must be a non-empty string'),
    body('tone')
      .optional()
      .isIn(['calm', 'authoritative', 'compassionate', 'energising'])
      .withMessage('tone must be calm | authoritative | compassionate | energising'),
    body('duration')
      .optional()
      .isInt({ min: 5, max: 60 })
      .withMessage('duration must be 5–60 minutes'),
    body('title').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const {
        symptoms,
        tone = 'calm',
        duration = 20,
        title = `Session — ${new Date().toLocaleDateString()}`,
      } = req.body;

      const content = await generateScript({ symptoms, tone, duration });

      const script = saveScript({
        userId: req.user.id,
        title,
        symptoms,
        tone,
        duration,
        content,
      });

      res.status(201).json(script);
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/scripts ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const scripts = listScripts(req.user.id);
  res.json({ scripts, total: scripts.length });
});

// ── GET /api/scripts/:id ──────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isUUID()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const script = getScript(req.user.id, req.params.id);
    if (!script) return res.status(404).json({ error: 'Script not found' });
    res.json(script);
  }
);

// ── DELETE /api/scripts/:id ───────────────────────────────────────────────────
router.delete(
  '/:id',
  [param('id').isUUID()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const deleted = deleteScript(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Script not found' });
    res.json({ message: 'Script deleted' });
  }
);

export default router;
