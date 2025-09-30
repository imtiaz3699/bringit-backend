import { validationResult } from "express-validator";
import Product from "../models/product.model.js";

class ProductController {
  // Helper method to check for suspicious patterns
  containsSuspiciousPatterns(data) {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, // Script tags
      /javascript:/i, // JavaScript protocol
      /data:/i, // Data URI scheme
      /vbscript:/i, // VBScript protocol
      /onclick/i, // Event handlers
      /onload/i,
      /onerror/i,
      /(\$gt|\$lt|\$ne|\$in|\$nin|\$or|\$and)/g, // NoSQL injection patterns
      /(\b(select|insert|update|delete|drop|union|exec|eval)\b)/i, // SQL injection patterns
    ];

    // Check all string values in the object
    const checkValue = (value) => {
      if (typeof value === "string") {
        return suspiciousPatterns.some((pattern) => pattern.test(value));
      }
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };

    return checkValue(data);
  }
  /**
   * Create a new product
   * @route POST /api/products
   */
  async createProduct(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      // Additional security checks
      if (this.containsSuspiciousPatterns(req.body)) {
        return res.error("Invalid input detected", 400);
      }

      const product = await Product.create(req.body);
      res.success("Product created successfully", product, 201);
    } catch (error) {
      res.error("Failed to create product", 500, error);
    }
  }

  /**
   * Get all products with filtering, sorting, and pagination
   * @route GET /api/products
   */
  async getProducts(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};

      // Add category filter
      if (req.query.category) {
        query.category = req.query.category;
      }

      // Add search functionality
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }

      // Add active filter
      query.isActive = true;

      // Build sort object
      let sort = {};
      if (req.query.sort) {
        const sortField = req.query.sort.startsWith("-")
          ? req.query.sort.substring(1)
          : req.query.sort;
        const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
        sort[sortField] = sortOrder;
      } else {
        sort = { createdAt: -1 }; // Default sort by newest
      }

      // Execute query with pagination
      const products = await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      res.success("Products retrieved successfully", {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.error("Failed to fetch products", 500, error);
    }
  }

  /**
   * Get a single product by ID
   * @route GET /api/products/:id
   */
  async getProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.notFound("Product not found");
      }

      res.success("Product retrieved successfully", product);
    } catch (error) {
      res.error("Failed to fetch product", 500, error);
    }
  }

  /**
   * Update a product
   * @route PUT /api/products/:id
   */
  async updateProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.notFound("Product not found");
      }

      // Update product
      Object.assign(product, req.body);
      await product.save();

      res.success("Product updated successfully", product);
    } catch (error) {
      res.error("Failed to update product", 500, error);
    }
  }

  /**
   * Delete a product (soft delete)
   * @route DELETE /api/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.notFound("Product not found");
      }

      // Soft delete by setting isActive to false
      product.isActive = false;
      await product.save();

      res.success("Product deleted successfully");
    } catch (error) {
      res.error("Failed to delete product", 500, error);
    }
  }

  /**
   * Search products
   * @route GET /api/products/search
   */
  async searchProducts(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validationError(errors.array());
      }

      const { q } = req.query;

      if (!q) {
        return res.validationError([{ msg: "Search query is required" }]);
      }

      const products = await Product.find(
        {
          $text: { $search: q },
          isActive: true,
        },
        {
          score: { $meta: "textScore" },
        }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(20);

      res.success("Search results retrieved successfully", products);
    } catch (error) {
      res.error("Failed to search products", 500, error);
    }
  }
}

export default new ProductController();
