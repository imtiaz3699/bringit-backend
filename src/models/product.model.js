import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    short_description: {
      type: String,
      required: [true, "Please enter product description"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
      default: 0.0,
    },
    originalPrice: {
      type: Number,
      required: [true, "Please enter product buying price."],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please select category for this product"],
      enum: {
        values: [
          "Electronics",
          "Cameras",
          "Laptops",
          "Accessories",
          "Headphones",
          "Food",
          "Books",
          "Clothes/Shoes",
          "Beauty/Health",
          "Sports",
          "Outdoor",
          "Home",
        ],
        message: "Please select correct category",
      },
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    product_images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isSale: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
    },
    rating: {
      type: Number,
    },
    reviews: [
      {
        review: {
          type: String,
        },
        user: {
          type: mongoose.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Add index for better search performance
productSchema.index({ name: "text", description: "text" });

// Add a virtual field for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Add instance method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Add static method to find active products
productSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Middleware to run before saving
productSchema.pre("save", function (next) {
  // You can add any pre-save logic here
  // For example, generating a SKU, validating fields, etc.
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
