# Loan Manager - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except `/auth/*`) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication API

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "email": "lender@example.com",
  "name": "John Doe",
  "password": "securepassword",
  "businessName": "ABC Lending Co.",
  "businessCategory": "Lending",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  }
}

Response: 200 OK
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "password": "securepassword"
}

Response: 200 OK
{
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "phoneNumber": "+919876543210",
    "role": "lender"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 2. Customers API

### List All Customers
```
GET /customers

Response: 200 OK
[
  {
    "_id": "64abc123...",
    "lenderId": "64abc111...",
    "name": "Raj Kumar",
    "phoneNumber": "9876543210",
    "email": "raj@example.com",
    "occupation": "Shop Owner",
    "monthlyIncome": 50000,
    "totalLoansGiven": 2,
    "outstandingAmount": 100000,
    "address": { ... }
  }
]
```

### Get Customer Details
```
GET /customers/:id

Response: 200 OK
{
  "_id": "64abc123...",
  "name": "Raj Kumar",
  ...
}
```

### Add New Customer
```
POST /customers
Content-Type: application/json

{
  "lenderId": "64abc111...",
  "name": "Raj Kumar",
  "phoneNumber": "9876543210",
  "email": "raj@example.com",
  "address": {
    "street": "456 Market St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  },
  "occupation": "Shop Owner",
  "monthlyIncome": 50000,
  "aadharNumber": "123456789012",
  "panNumber": "AABCD1234E"
}

Response: 201 Created
{ ... customer object ... }
```

### Update Customer
```
PUT /customers/:id
Content-Type: application/json

{
  "monthlyIncome": 60000,
  "occupation": "Business Owner"
}

Response: 200 OK
{ ... updated customer ... }
```

### Delete Customer
```
DELETE /customers/:id

Response: 200 OK
{ deleted: true }
```

---

## 3. Loans API

### List All Loans
```
GET /loans

Response: 200 OK
[
  {
    "_id": "64abc456...",
    "lenderId": "64abc111...",
    "customerId": "64abc123...",
    "principalAmount": 100000,
    "interestRate": 12,
    "loanDuration": 12,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2025-01-01T00:00:00.000Z",
    "status": "active",
    "totalAmountWithInterest": 112000,
    "amountPaid": 12000,
    "outstandingAmount": 100000
  }
]
```

### Get Loans for Lender
```
GET /loans/lender/:lenderId

Response: 200 OK
[ ... array of loans ... ]
```

### Get Loans for Customer
```
GET /loans/customer/:customerId

Response: 200 OK
[ ... array of customer loans ... ]
```

### Create New Loan
```
POST /loans
Content-Type: application/json

{
  "lenderId": "64abc111...",
  "customerId": "64abc123...",
  "principalAmount": 100000,
  "interestRate": 12,
  "loanDuration": 12,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2025-01-01T00:00:00.000Z",
  "totalAmountWithInterest": 112000,
  "outstandingAmount": 112000,
  "purpose": "Business Expansion",
  "status": "initiated"
}

Response: 201 Created
{ ... loan object ... }
```

### Close Loan
```
PUT /loans/:id/close

Response: 200 OK
{
  "_id": "64abc456...",
  "status": "closed"
}
```

---

## 4. EMI API

### Get All EMIs
```
GET /emi

Response: 200 OK
[
  {
    "_id": "64abc789...",
    "loanId": "64abc456...",
    "customerId": "64abc123...",
    "lenderId": "64abc111...",
    "emiNumber": 1,
    "principalAmount": 8333.33,
    "interestAmount": 1000,
    "totalEmiAmount": 9333.33,
    "dueDate": "2024-02-01T00:00:00.000Z",
    "status": "scheduled",
    "paidAmount": 0,
    "remainingAmount": 9333.33
  }
]
```

### Get EMIs for Loan
```
GET /emi/loan/:loanId

Response: 200 OK
[ ... array of EMIs ... ]
```

### Create EMI
```
POST /emi
Content-Type: application/json

{
  "loanId": "64abc456...",
  "customerId": "64abc123...",
  "lenderId": "64abc111...",
  "emiNumber": 1,
  "principalAmount": 8333.33,
  "interestAmount": 1000,
  "totalEmiAmount": 9333.33,
  "dueDate": "2024-02-01T00:00:00.000Z",
  "remainingAmount": 9333.33
}

Response: 201 Created
{ ... EMI object ... }
```

---

## 5. Transactions API

### Record Payment
```
POST /transactions
Content-Type: application/json

{
  "lenderId": "64abc111...",
  "loanId": "64abc456...",
  "emiId": "64abc789...",
  "customerId": "64abc123...",
  "amount": 9333.33,
  "method": "cash",
  "status": "success",
  "referenceNumber": "TXN001",
  "notes": "EMI #1 payment",
  "transactionDate": "2024-02-01T10:00:00.000Z"
}

Response: 201 Created
{ ... transaction object ... }
```

### Get Transactions for Loan
```
GET /transactions/loan/:loanId

Response: 200 OK
[ ... array of transactions ... ]
```

### Get Transactions for Customer
```
GET /transactions/customer/:customerId

Response: 200 OK
[ ... array of customer transactions ... ]
```

---

## 6. Reports API

### Dashboard Metrics
```
GET /reports/dashboard?lenderId=64abc111...

Response: 200 OK
{
  "totalLoans": 5,
  "activeLoans": 3,
  "completedLoans": 1,
  "defaultedLoans": 1,
  "totalOutstanding": 250000,
  "totalDisbursed": 500000,
  "totalCollected": 250000,
  "collectionRate": 50
}
```

### Collection Pattern
```
GET /reports/collection-pattern?lenderId=64abc111...

Response: 200 OK
{
  "monthlyCollections": {
    "2024-01": 50000,
    "2024-02": 45000,
    "2024-03": 55000
  },
  "totalTransactions": 30
}
```

### Portfolio Insights
```
GET /reports/portfolio-insights?lenderId=64abc111...

Response: 200 OK
{
  "totalPortfolioValue": 500000,
  "byStatus": {
    "active": 3,
    "closed": 1,
    "defaulted": 1
  },
  "avgLoanAmount": 100000,
  "avgInterestRate": 12
}
```

### Customer Performance
```
GET /reports/customer-performance?customerId=64abc123...

Response: 200 OK
{
  "totalBorrowed": 200000,
  "totalRepaid": 100000,
  "totalOutstanding": 100000,
  "repaymentPercentage": 50,
  "loanCount": 2,
  "transactionCount": 10
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "User does not have permission"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Something went wrong"
}
```

---

## Payment Methods
- `cash` - Cash payment
- `cheque` - Cheque
- `bank_transfer` - Bank transfer
- `upi` - UPI payment
- `wallet` - Digital wallet

## Loan Status
- `initiated` - Loan just created
- `active` - Loan is active
- `closed` - Loan completed
- `defaulted` - Loan defaulted

## EMI Status
- `scheduled` - EMI scheduled but not paid
- `paid` - EMI fully paid
- `overdue` - EMI payment overdue
- `partial` - EMI partially paid
