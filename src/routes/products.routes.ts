import { Router } from 'express';
import { getProducts, getProductBySlug, getFeaturedProducts } from '../controllers/products.controller';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

export default router;