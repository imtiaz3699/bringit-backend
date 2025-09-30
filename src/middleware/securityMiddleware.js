import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Specific routes rate limiter (for more sensitive routes)
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: 'Too many accounts created from this IP, please try again after an hour'
});

// Security Middleware Configuration
const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Rate limiting
  app.use('/api/', limiter);
  app.use('/api/products/create', apiLimiter);
  
  // Data sanitization against XSS attacks
  app.use(xss());
  
  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
  
  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'price',
      'stock',
      'rating',
      'category'
    ]
  }));

  // Enable CORS with specific options
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type,Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
};

export default securityMiddleware;