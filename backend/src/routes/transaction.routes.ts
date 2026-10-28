import { Router } from 'express';
import { createTransaction, getPendingTransactions, updateTransactionStatus, payVendor, buyProducts } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all transaction routes

router.post('/request', createTransaction); // Vendor requests credit/payment
router.get('/pending', getPendingTransactions); // Customer fetches their pending requests
router.put('/:id/status', updateTransactionStatus); // Customer approves/rejects
router.post('/pay', payVendor); // Customer makes a payment
router.post('/buy', buyProducts); // Customer buys products on credit

export default router;
