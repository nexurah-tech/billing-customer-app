# NexBill - POS Billing System

A complete shop owner billing and inventory management system built with Next.js 16, MongoDB, and modern web technologies.

## Features

### Core Features Implemented
- **Authentication**: Email/password signup and login with JWT token management
- **Product Management**: Full CRUD operations for products with categories, stock tracking, and reorder alerts
- **Customer Management**: Maintain customer database with retail/wholesale segmentation and loyalty points
- **Billing Module**: Create invoices with automatic calculations, tax handling, and multiple payment methods
- **Invoice Management**: View, edit, and print invoices with detailed breakdowns
- **Analytics Dashboard**: Real-time revenue tracking, top products, and customer metrics
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Backend APIs
- Authentication endpoints (signup, login)
- RESTful APIs for products, customers, categories, and invoices
- Advanced analytics with aggregation pipelines
- Shop isolation - users only see their own data

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Charts**: Recharts for data visualization
- **Additional**: Twilio for WhatsApp integration (configured but not fully integrated)

## Project Structure

```
/app
  /api                    # Backend API routes
    /auth                # Authentication endpoints
    /products           # Product management
    /customers          # Customer management
    /invoices           # Invoice operations
    /categories         # Category management
    /analytics          # Analytics data
  /auth                  # Authentication pages (login, signup)
  /dashboard            # Protected dashboard pages
    /billing           # Billing and invoices
    /products          # Product management pages
    /customers         # Customer management pages
    /whatsapp          # WhatsApp integration page
    /settings          # Shop settings page

/components
  - Sidebar.tsx        # Navigation sidebar
  - BillingForm.tsx    # Create invoices form
  - ProductForm.tsx    # Create/edit products form
  - CustomerForm.tsx   # Create/edit customers form

/models              # Mongoose schemas
  - User.ts
  - Shop.ts
  - Product.ts
  - Customer.ts
  - Invoice.ts
  - Category.ts
  - WhatsAppMessage.ts
  - Settings.ts

/lib
  - db.ts             # MongoDB connection
  - auth.ts           # JWT utilities
  - api.ts            # API response helpers
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB instance (local or cloud)

### Installation

1. Clone the project and install dependencies:
```bash
pnpm install
```

2. Create a `.env.local` file with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/billease
JWT_SECRET=your-super-secret-key-change-this-in-production

# Optional: For WhatsApp integration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

3. Start the development server:
```bash
pnpm dev
```

4. Open http://localhost:3000 in your browser

## Getting Started with the App

### First Time Setup
1. Click "Create Account" to register as a shop owner
2. Provide your shop details (name, phone, address)
3. Create your initial categories for products
4. Add products to your inventory
5. Add customers to your database
6. Start creating invoices

### Key Workflows

#### Creating an Invoice
1. Go to **Billing** > **New Invoice**
2. Select a customer
3. Add products by selecting them from the dropdown
4. Adjust quantities and review auto-calculated totals
5. Select payment method and add discount if needed
6. Submit to create the invoice

#### Managing Products
1. Go to **Products**
2. Add new products with SKU, pricing, and stock levels
3. System alerts when stock is below reorder level
4. Search and filter products by name or SKU
5. Edit or delete products as needed

#### Managing Customers
1. Go to **Customers**
2. Add new customers with contact information
3. Specify retail or wholesale customer type
4. Add GST number for wholesale customers
5. View customer card with contact details

#### Viewing Analytics
1. Go to **Dashboard**
2. View KPI cards showing revenue, orders, and active customers
3. Check revenue trends over the last 7 days
4. See top selling products by quantity and revenue

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new shop owner
- `POST /api/auth/login` - Login existing user

### Products
- `GET /api/products` - List products (with pagination, search, category filter)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Customers
- `GET /api/customers` - List customers (with search)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Invoices
- `GET /api/invoices` - List invoices (with status filter and pagination)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice status/notes
- `DELETE /api/invoices/[id]` - Delete invoice

### Analytics
- `GET /api/analytics` - Get dashboard analytics (period parameter: day, week, month, year)

## Features To Implement

- Complete WhatsApp integration with Twilio webhook
- Invoice PDF export and email sending
- Customer purchase history
- Loyalty points system
- Multi-user staff management
- Advanced reporting and exports
- Invoice templates customization
- Bulk product import
- Inventory alerts and notifications

## Database Schema Highlights

### User
- Email, password (hashed), name, role, status
- Associated with a single shop

### Shop
- Name, address, phone, email, GSTIN, license
- Tax rates and business hours
- Associated with one or more users

### Product
- Name, SKU, category, pricing (unit/cost)
- Stock tracking with reorder levels
- Tax applicability flag

### Invoice
- Auto-generated invoice number
- Line items with calculations
- Tax and discount support
- Multiple payment methods and statuses
- Customer and shop references

## Authentication

The app uses JWT tokens for API authentication. Tokens are stored in localStorage after login and sent in the Authorization header with each API request.

**Security Notes:**
- Passwords are hashed with bcrypt before storage
- Each API request validates the JWT token
- Shop isolation - users can only access their own shop's data
- Middleware protects dashboard routes

## Performance Considerations

- Database indexes on frequently queried fields (shop_id, customer_id, etc.)
- Aggregation pipelines for efficient analytics queries
- Pagination support on large datasets
- Search optimization with regex queries

## Future Enhancements

- Real-time stock updates with WebSockets
- Advanced reporting with chart exports
- Mobile app using React Native
- Email invoice delivery
- QR code generation for invoices
- Barcode scanning for products
- Multi-location support
- Inventory forecasting

## Contributing

Feel free to extend this system with additional features. The codebase is organized for easy expansion.

## License

This project is open source and available under the MIT License.

---

**Note**: This is a fully functional POS system ready for shop owners to manage their business. Ensure you configure MongoDB and environment variables before deploying to production.
