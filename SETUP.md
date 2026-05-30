# NexBill Setup Guide

Complete guide to setting up and running the NexBill POS Billing System.

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 9.0.0 or higher (or npm/yarn)
- MongoDB 5.0 or higher (local or cloud)
- Git (for version control)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install dependencies
pnpm install

# Or with npm
npm install

# Or with yarn
yarn install
```

### 2. Database Setup

#### Option A: Local MongoDB

If you have MongoDB installed locally:

```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB from Services or run mongod directly
```

#### Option B: MongoDB Atlas (Cloud)

1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Add your IP address to the network access whitelist

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Required: MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/billease
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/billease

# Required: JWT secret for authentication
JWT_SECRET=your-super-secret-key-change-this-in-production

# Optional: Twilio WhatsApp Integration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Security Note**: Never commit `.env.local` to version control. Use `.env.local` for development only.

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://100.64.x.x:3000

## First-Time Setup Walkthrough

### Step 1: Create Your Account

1. Open http://localhost:3000 in your browser
2. You'll be redirected to `/auth/signup`
3. Fill in the signup form with:
   - Your Name
   - Email
   - Shop Name
   - Phone Number
   - Address
   - Password (min 6 characters)
4. Click "Create Account"
5. You'll be redirected to the dashboard

### Step 2: Create Product Categories

1. Go to **Products** section
2. Click **New Product**
3. When creating your first product, click **+ Create New Category**
4. Add categories like:
   - Electronics
   - Clothing
   - Food & Beverages
   - etc.

### Step 3: Add Products

1. Go to **Products** > **New Product**
2. Fill in product details:
   - Product Name
   - SKU (unique identifier)
   - Category
   - Unit Price (selling price)
   - Cost Price
   - Current Stock
   - Reorder Level (alerts when stock falls below this)
3. Check "Tax Applicable" if GST applies (default: 18%)
4. Click "Create Product"

Repeat for all your products.

### Step 4: Add Customers

1. Go to **Customers** > **New Customer**
2. Fill in customer details:
   - Full Name
   - Phone Number (required)
   - Email (optional)
   - Address (optional)
   - Customer Type (Retail or Wholesale)
   - GST Number (for wholesale customers)
3. Click "Create Customer"

Repeat for all your customers.

### Step 5: Create Your First Invoice

1. Go to **Billing** > **New Invoice**
2. Select a customer
3. Click **+ Add Item**
4. Select a product and enter quantity
5. System automatically calculates:
   - Price per unit
   - Tax (18% if applicable)
   - Subtotal
6. Add more items if needed
7. Set Payment Method (Cash/Card/Online/Credit)
8. Add discount if applicable
9. Review total
10. Click "Create Invoice"
11. View your created invoice in the Billing section

### Step 6: Monitor Dashboard

1. Go to **Dashboard**
2. View key metrics:
   - Total Revenue
   - Total Orders
   - Average Order Value
   - Active Customers
3. Check revenue trends chart
4. See top-selling products

## Project Structure Overview

```
NexBill/
├── app/                 # Next.js app directory
│   ├── api/            # Backend API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Protected dashboard pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (redirects to login/dashboard)
│   └── globals.css     # Global styles
├── components/         # Reusable React components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── BillingForm.tsx # Invoice creation form
│   ├── ProductForm.tsx # Product management form
│   └── CustomerForm.tsx # Customer management form
├── models/            # MongoDB Mongoose schemas
│   ├── User.ts
│   ├── Shop.ts
│   ├── Product.ts
│   ├── Customer.ts
│   ├── Invoice.ts
│   ├── Category.ts
│   ├── WhatsAppMessage.ts
│   └── Settings.ts
├── lib/              # Utility functions
│   ├── db.ts         # MongoDB connection
│   ├── auth.ts       # JWT authentication
│   └── api.ts        # API response helpers
├── middleware.ts     # Route protection middleware
├── .env.local        # Environment variables (local development)
├── .env.example      # Example environment variables
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md

```

## API Routes Structure

```
GET  /api/products               - List products
POST /api/products               - Create product
GET  /api/products/[id]          - Get product details
PUT  /api/products/[id]          - Update product
DELETE /api/products/[id]        - Delete product

GET  /api/customers              - List customers
POST /api/customers              - Create customer
GET  /api/customers/[id]         - Get customer details
PUT  /api/customers/[id]         - Update customer
DELETE /api/customers/[id]       - Delete customer

GET  /api/categories             - List categories
POST /api/categories             - Create category
GET  /api/categories/[id]        - Get category details
PUT  /api/categories/[id]        - Update category
DELETE /api/categories/[id]      - Delete category

POST /api/invoices               - Create invoice
GET  /api/invoices               - List invoices
GET  /api/invoices/[id]          - Get invoice details
PUT  /api/invoices/[id]          - Update invoice
DELETE /api/invoices/[id]        - Delete invoice

GET  /api/analytics              - Get dashboard analytics

POST /api/auth/signup            - Register new user
POST /api/auth/login             - Login user
```

## Development Workflow

### Making Code Changes

1. Edit files in your code editor
2. Next.js will automatically reload with Hot Module Replacement (HMR)
3. Check the browser for updates
4. Check terminal for any TypeScript or linting errors

### Adding New Features

1. Create API route in `/app/api/`
2. Create or modify components in `/components/`
3. Create pages in `/app/dashboard/`
4. Test with the dev server

### Testing API Endpoints

Use tools like:
- **curl**: `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/products`
- **Postman**: Import API endpoints
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

## Troubleshooting

### MongoDB Connection Issues

**Error**: `connection refused`
- Check if MongoDB is running
- Verify MONGODB_URI is correct
- Check firewall settings for port 27017

**Error**: `MongoNetworkError`
- For MongoDB Atlas, ensure your IP is whitelisted
- Check internet connection
- Verify connection string format

### Build Errors

**Error**: `Cannot find module`
- Run `pnpm install` to install missing dependencies
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

**Error**: `Type errors`
- Check TypeScript errors: `pnpm tsc --noEmit`
- Review error messages in terminal

### Login/Authentication Issues

**"Invalid email or password"**
- Verify your credentials are correct
- Check if your account exists in the database
- Ensure password was entered correctly

**"Unauthorized" API errors**
- Token might have expired
- Login again to get a new token
- Check if token is stored in localStorage

### Port Already in Use

**Error**: `Port 3000 is in use`
- Kill existing process: `kill -9 $(lsof -t -i:3000)`
- Or specify different port: `pnpm dev -- -p 3001`

## Performance Tips

1. **Database Indexing**: Indexes are already added on frequently queried fields
2. **Pagination**: Lists are paginated by default
3. **Search**: Use search filters to reduce data loaded
4. **Images**: Optimize product images before uploading

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use MongoDB Atlas with strong password
- [ ] Enable IP whitelist on MongoDB Atlas
- [ ] Use HTTPS in production
- [ ] Set secure cookies for JWT
- [ ] Regular backups of MongoDB
- [ ] Monitor unauthorized access attempts
- [ ] Keep dependencies updated: `pnpm update`

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- MONGODB_URI
- JWT_SECRET
- TWILIO_* (if using WhatsApp)

### Deploy to Other Platforms

Works with any Node.js hosting:
- Railway
- Render
- Fly.io
- DigitalOcean
- AWS

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

## Next Steps

1. Customize the invoice template
2. Integrate WhatsApp messaging
3. Add email notifications
4. Set up automated backups
5. Configure for production deployment
6. Train team members on usage
7. Monitor and optimize performance

---

For detailed information about specific features, see [README.md](./README.md)
