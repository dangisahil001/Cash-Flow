import { Router } from 'express';
import { getVendorStats, getCustomerStats } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/vendor', getVendorStats);
router.get('/customer', getCustomerStats);

export default router;
