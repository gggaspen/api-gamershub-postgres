import { Router } from 'express';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import platformsRoutes from './platforms.routes';

const router = Router();

router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/platforms', platformsRoutes);

export default router;