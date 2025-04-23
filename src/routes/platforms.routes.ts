import { Router } from 'express';
import { getPlatforms, getPlatformBySlug } from '../controllers/platforms.controller';

const router = Router();

router.get('/', getPlatforms);
router.get('/:slug', getPlatformBySlug);

export default router;