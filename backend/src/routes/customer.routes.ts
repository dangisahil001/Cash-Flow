import { Router } from 'express';
import { searchCustomer, linkCustomer, getLinkedCustomers, getLinkedVendors } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all customer routes

router.get('/search', searchCustomer);
router.post('/link', linkCustomer);
router.get('/list', getLinkedCustomers);
router.get('/my-vendors', getLinkedVendors);

export default router;
