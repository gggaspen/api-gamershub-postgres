import { Router } from 'express';
import { getCategories, getCategoryBySlug } from '../controllers/categories.controller';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

export default router;