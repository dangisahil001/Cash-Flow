# Loan Manager - EMI & Customer Management Web App

## Project Overview

Loan Manager is a browser-based solution for small lenders to handle customer records, EMI timelines, and repayment workflows from initiation to closure. It streamlines daily loan operations through integrated modules for:

- **Customer Registration**: Add and manage borrower profiles
- **EMI Planning**: Create EMI schedules and track payment timelines
- **Transaction Recording**: Log collections and repayments
- **Historical Retrieval**: Access past transaction history
- **Data-Driven Dashboards**: Visualize collection patterns and portfolio insights
- **Dynamic Filters**: Faster decision-making with filtered reports

### Key Features
- **Customer Management**: Complete customer database with contact and occupation details
- **Loan Initiation**: Create loans with customizable EMI periods and interest rates
- **EMI Scheduling**: Automatic EMI calculation and schedule generation
- **Payment Tracking**: Record and track repayments with multiple payment methods
- **Dashboard Analytics**: Visual reports using Chart.js with collection patterns, portfolio insights
- **Responsive UI**: Works on desktop and mobile devices with large, accessible fonts
- **Firebase Authentication**: Secure user login and registration

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, React 18, Vite
- **Backend**: NestJS + TypeScript + Node.js
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **Data Visualization**: Chart.js, React-ChartJS-2
- **API**: REST APIs
- **Responsive Design**: Mobile-first approach

## Project Structure

```
loan-manager/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Authentication
│   │   │   ├── customers/         # Customer management
│   │   │   ├── loans/             # Loan management
│   │   │   ├── emi/               # EMI scheduling
│   │   │   ├── transactions/      # Payment recording
│   │   │   ├── reports/           # Analytics & dashboards
│   │   │   └── lenders/           # Lender management
│   │   ├── database/
│   │   │   └── schemas/
│   │   │       ├── user.schema.ts
│   │   │       ├── lender.schema.ts
│   │   │       ├── customer.schema.ts
│   │   │       ├── loan.schema.ts
│   │   │       ├── emi.schema.ts
│   │   │       └── transaction.schema.ts
│   │   ├── common/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React Web App
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/        # Dashboard charts & metrics
│   │   │   ├── customers/        # Customer UI components
│   │   │   ├── loans/            # Loan UI components
│   │   │   ├── emi/              # EMI UI components
│   │   │   ├── transactions/     # Transaction UI components
│   │   │   └── shared/           # Reusable components
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx     # Main dashboard with charts
│   │   │   ├── CustomersPage.jsx
│   │   │   ├── LoansPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── store/
│   │   │   └── authStore.js      # Auth state management
│   │   ├── styles/
│   │   │   └── simple.css        # Responsive design
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── package.json
│
├── shared/                   # Shared types and utilities
│   ├── types/
│   ├── constants/
│   └── package.json
│
├── docs/                     # API documentation
├── .env.example
├── .gitignore
├── package.json              # Workspace root
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new lender account
- `POST /api/auth/login` - Login with credentials

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Loans
- `GET /api/loans` - List all loans
- `GET /api/loans/:id` - Get loan details
- `GET /api/loans/lender/:lenderId` - Get loans for lender
- `GET /api/loans/customer/:customerId` - Get customer's loans
- `POST /api/loans` - Create new loan
- `PUT /api/loans/:id` - Update loan
- `PUT /api/loans/:id/close` - Close loan
- `DELETE /api/loans/:id` - Delete loan

### EMI (Equated Monthly Installments)
- `GET /api/emi` - List all EMIs
- `GET /api/emi/:id` - Get EMI details
- `GET /api/emi/loan/:loanId` - Get EMIs for loan
- `POST /api/emi` - Create EMI
- `PUT /api/emi/:id` - Update EMI

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions/loan/:loanId` - Get loan transactions
- `GET /api/transactions/customer/:customerId` - Get customer transactions
- `POST /api/transactions` - Record new transaction

### Reports
- `GET /api/reports/dashboard?lenderId=xxx` - Dashboard metrics
- `GET /api/reports/collection-pattern?lenderId=xxx` - Monthly collections
- `GET /api/reports/portfolio-insights?lenderId=xxx` - Portfolio analysis
- `GET /api/reports/customer-performance?customerId=xxx` - Customer performance

## Database Schema

### User Schema
- Authentication and authorization for lenders/staff
- Roles: Lender, Staff, Admin

### Lender Schema
- Store lender business information
- Bank account details for payouts

### Customer Schema
- Customer information and contact details
- ID proof details (Aadhar, PAN)
- Monthly income and occupation

### Loan Schema
- Principal amount, interest rate, duration
- Start date, end date, status tracking
- Amount paid and outstanding balance

### EMI Schema
- EMI number, amount breakdown
- Principal and interest components
- Due date, payment status

### Transaction Schema
- Payment method (cash, cheque, bank, UPI)
- Amount and transaction date
- Reference numbers for tracking

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn
- Firebase account (optional, for auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd loan-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install --workspace=backend
   npm install --workspace=frontend
   ```

3. **Configure environment variables**
   
   Backend `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/loan-manager
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

   Frontend `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

### Running the Application

**Development Mode:**
```bash
npm run dev
```

This runs both backend (NestJS on port 3000) and frontend (Vite on port 5173) concurrently.

**Production Build:**
```bash
npm run build
```

**Testing:**
```bash
npm run test
```

**Linting:**
```bash
npm run lint
```

## Usage Guide

### 1. **Register & Login**
   - Lender registers with business details
   - Firebase or JWT-based authentication
   - Dashboard redirects after login

### 2. **Add Customers**
   - Navigate to "Customers" page
   - Add customer details (name, phone, address)
   - Optional: Add ID proof and monthly income

### 3. **Create Loans**
   - Go to "Loans" page
   - Select customer and enter loan amount
   - Set interest rate and duration (in months)
   - System calculates total amount with interest

### 4. **EMI Schedule**
   - EMI schedule automatically generated
   - View all EMIs for a loan
   - Track payment status (Scheduled, Paid, Overdue, Partial)

### 5. **Record Payments**
   - Navigate to "Transactions" page
   - Record payment with method (cash, cheque, UPI, bank transfer)
   - System updates EMI and loan status

### 6. **View Reports**
   - Dashboard shows:
     - Total loans, active loans, closed loans
     - Total outstanding amount
     - Monthly collection patterns (chart)
     - Portfolio distribution by status
     - Collection rate percentage

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Lender, Staff, Admin roles
- **Password Hashing**: Bcrypt for secure password storage
- **HTTPS Support**: Ready for production deployment
- **Input Validation**: DTO validation on all endpoints

## Performance Optimizations

- **Indexed Database Queries**: Fast lookups on lenderId, customerId, loanId
- **Pagination Ready**: API supports result pagination
- **Caching**: Reports cached for faster dashboard load
- **Responsive UI**: CSS Grid and Flexbox for optimal rendering

## Future Enhancements

- SMS/Email notifications for payment reminders
- Automated recovery workflow
- Export reports to Excel/PDF
- Multi-lender support with role hierarchy
- Receipt generation and printing
- Payment gateway integration (Razorpay, Stripe)
- Advanced analytics and forecasting

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or feature requests, please create an issue in the repository.

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/credit-baazar
JWT_SECRET=your-secret-key
UPI_GATEWAY_URL=https://api.upi-provider.com
KYC_SERVICE_URL=https://api.kyc-provider.com
```

5. Start MongoDB
```bash
# If using local MongoDB
mongod
```

6. Start development servers
```bash
# In separate terminals
npm run dev --workspace=backend   # Runs on http://localhost:3000
npm run dev --workspace=frontend  # Runs on http://localhost:5173
```

## Key Features Explained

### 1. **Loan Agreement Flow**

When a vendor creates a loan:
1. A loan agreement is created in "PENDING" status
2. Borrower receives notification and sees it in their dashboard
3. Both parties confirm via popup: "Do you agree to this ₹100 payment?"
4. Once both confirm → Status becomes "ACTIVE"
5. Borrower can now make payment

### 2. **Payment Flow (UPI)**

1. Borrower initiates payment
2. UPI transaction flag sent to payment gateway
3. Payment status tracked in real-time
4. Loan marked as PAID on successful payment
5. Payment history maintained for audit trail

### 3. **Automated KYC**

- Initiated by user during registration
- Integrated with KYC provider API
- Auto-verified on document submission
- KYC status tracked and expires yearly

### 4. **Payment Recovery (Method A)**

- Tracks overdue loans
- Automated retry mechanism every 7 days
- Max 3 retry attempts before escalation
- Notifications sent to borrower

## API Endpoints

### Auth
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### KYC
- `POST /kyc/initiate` - Start KYC verification
- `GET /kyc/status` - Get KYC status

### Loans
- `POST /loans/create` - Create loan agreement
- `GET /loans/vendor-loans` - Get vendor's loans
- `GET /loans/borrower-loans` - Get borrower's loans
- `POST /loans/confirm-by-vendor` - Vendor confirms
- `POST /loans/confirm-by-borrower` - Borrower confirms

### Transactions
- `POST /transactions/initiate-payment` - Initiate payment
- `GET /transactions/history` - Payment history

## Database Schema

### User
```
{
  phoneNumber: String (unique),
  name: String,
  role: 'vendor' | 'borrower' | 'admin',
  email: String,
  password: String (hashed),
  kycVerified: Boolean,
  upiId: String,
  bankAccount: { accountNumber, bankName, ifscCode },
  address: { street, city, state, pincode, country }
}
```

### LoanAgreement
```
{
  vendorId: ObjectId,
  borrowerId: ObjectId,
  amount: Number,
  description: String,
  dueDate: Date,
  status: 'pending' | 'vendor_confirmed' | 'borrower_confirmed' | 'active' | 'paid' | 'defaulted',
  vendorConfirmedAt: Date,
  borrowerConfirmedAt: Date,
  bothConfirmedAt: Date,
  paidAmount: Number
}
```

### Payment
```
{
  loanId: ObjectId,
  fromUserId: ObjectId,
  toUserId: ObjectId,
  amount: Number,
  method: 'upi' | 'bank_transfer',
  status: 'initiated' | 'pending' | 'success' | 'failed',
  upiTransactionId: String,
  initiatedAt: Date,
  completedAt: Date
}
```

## Design Philosophy

- **Simple UI**: Large fonts (18px+), clear language
- **Accessible**: Designed for all age groups
- **Mobile-first**: Responsive design for small screens
- **Clear CTAs**: Obvious action buttons and flows
- **Security**: JWT auth, encrypted passwords, audit trails
- **Compliant**: KYC + audit trails for regulatory compliance

## Next Steps

1. **Implement frontend register page**
2. **Add UPI payment gateway integration**
3. **Build admin dashboard for monitoring**
4. **Add notification system (email/SMS)**
5. **Implement payment recovery automation**
6. **Add analytics dashboard**
7. **Set up deployment (Docker, AWS/GCP)**
8. **Add testing (Jest for backend, Vitest for frontend)**

## Running Tests

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```

## Building for Production

```bash
npm run build --workspace=backend
npm run build --workspace=frontend
```

## Contributing

Follow these guidelines when contributing:
1. Use descriptive commit messages
2. Create feature branches
3. Follow the existing code style
4. Test your changes
5. Create PRs with clear descriptions

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
#   C a s h - F l o w  
 