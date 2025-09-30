import express from 'express';
import productController from '../controllers/product.controller.js';
import {
  createProductValidation,
  updateProductValidation,
  getProductsValidation
} from '../middleware/productValidation.js';
import { param } from 'express-validator';

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', getProductsValidation, productController.getProducts);

// Create a new product
router.post('/', createProductValidation, productController.createProduct);

// Search products
router.get('/search', getProductsValidation, productController.searchProducts);

// Get a single product
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid product ID'),
  productController.getProduct
);

// Update a product
router.put('/:id', updateProductValidation, productController.updateProduct);

// Delete a product
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid product ID'),
  productController.deleteProduct
);

export default router;