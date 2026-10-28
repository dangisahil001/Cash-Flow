import { Router } from 'express';
import { addProduct, getVendorProducts, getMyProducts } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all routes

router.post('/', addProduct); // Vendor adds product
router.get('/my-products', getMyProducts); // Vendor gets their own products
router.get('/:vendorId', getVendorProducts); // Customer views vendor's products

export default router;
