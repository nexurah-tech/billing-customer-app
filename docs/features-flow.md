# System User Flows & Lifecycles

This document describes the operational workflows and user lifecycles within the NexBill application.

---

## 1. Cashier Billing & Checkout Flow

The POS checkout terminal is the central interface for retail sales. Cashiers search items, set customer associations, apply discounts, and complete sales transactions.

```mermaid
sequenceDiagram
    actor Cashier
    participant Terminal as BillingForm UI
    participant API as Invoices API
    participant DB as MongoDB

    Cashier->>Terminal: Select/Create Customer
    Cashier->>Terminal: Tap catalog item or scan barcode
    Terminal->>Terminal: Add item to ticket cart
    Note right of Terminal: Decimal items (kg, litre) start with min(1, stock)<br/>Discrete items (pcs) start with 1.
    Cashier->>Terminal: Adjust quantity (increment by step or type decimal)
    Cashier->>Terminal: Choose Payment Method & click "Finalize POS Ticket"
    Terminal->>API: POST /api/invoices (items & quantities)
    API->>DB: Query Product stock levels
    alt Insufficient Stock
        API-->>Terminal: Error: Out of Stock
        Terminal-->>Cashier: Show stock error alert
    else Stock Available
        API->>DB: Decrement Product.stock by quantity
        API->>DB: Create & Save Invoice document
        API-->>Terminal: Success: Return created Invoice
        Terminal-->>Cashier: Open invoice published success modal
    end
```

### Key UI Features
- **Manual Input**: Cashiers can click standard increment buttons (which adjust quantity by `0.1` for decimal items and `1` for discrete items) or type custom decimals (e.g. `2.25`) directly in the cart's numeric input.
- **WhatsApp Share**: Upon checkout finalization, cashiers can click "Share WhatsApp" to generate a pre-formatted message that redirects to the client's WhatsApp number using a `whatsapp://send` deep link.

---

## 2. Product Ingestion & Bulk Import Flow

NexBill allows shop owners to upload bulk product files (CSV or Excel) to rapidly seed their inventory database.

```mermaid
graph TD
    A[Shop Owner] -->|Select Excel or CSV File| B[BulkUploadModal UI]
    B -->|Parse columns using SheetJS| C[Validate Columns & Format]
    C -->|Identify SKU Code, Name, Price, Stock, Unit| D{Validation Warnings?}
    D -->|Yes| E[Show warnings table: empty names, negative prices]
    E -->|Check: Skip Invalid Rows| F[Filter only valid rows]
    E -->|Unchecked| G[Disable Import Confirmation]
    D -->|No / Filtered| H[Click Confirm Import]
    H -->|POST products array| I[Bulk Products API Route]
    I -->|Identify existing SKU duplicates| J[Skip existing database SKUs]
    I -->|Create non-existent Categories| K[Save new Products to DB]
    K -->|Return response stats| B
    B -->|Show Import Successful screen| A
```

### Ingestion Logic
- **Header Normalization**: The parser matches columns resiliently based on common headers (e.g. mapping `'uom'`, `'measurement'`, and `'unit'` all to the model's `unit` field).
- **Float Parsing**: Quantities and reorder parameters are parsed as floats (`parseFloat`) to accommodate weight/volume measurements (e.g. `250.5` kg of sugar).
- **Duplicate Prevention**: Existing database SKUs are skipped during bulk save to prevent unique database index violations.

---

## 3. Subscription Grace & Lockout Flow

Shop owners pay a recurring flat fee to keep their POS terminals active. If the subscription expires, a grace period begins.

```mermaid
stateDiagram-v2
    [*] --> Trialing : Registration (14 days free trial)
    Trialing --> Active : Admin registers payment
    Trialing --> Grace_Period : Expiration (ExpiresAt reached)
    Active --> Grace_Period : Expiration (ExpiresAt reached)
    
    state Grace_Period {
        [*] --> Warning_Banner : Expiry Day 1 to 3
        Warning_Banner --> Locked_Out : Expiry Day > 3
    }
    
    Warning_Banner --> Active : Admin registers manual payment
    Locked_Out --> Active : Admin registers manual payment
    
    Locked_Out --> [*] : Shop signs out
```

### Verification Pipeline
1. **Status Poll**: The retailer app frequently polls `/api/auth/status`. If authenticated, it updates `lastActiveAt` on the `Shop` schema to track active connections.
2. **Access Evaluation**: The root wrapper evaluate shop subscription values:
   - If `Date.now() <= shop.subscriptionExpiresAt`, the terminal is fully active.
   - If `Date.now() > shop.subscriptionExpiresAt`, the system calculates elapsed days:
     - **Days <= 3**: Renders a warning notification banner: *"Your subscription expired X days ago. Please pay to avoid POS lockout."*
     - **Days > 3**: Interrupts execution and displays a full-screen locking backdrop containing the admin's central UPI QR code, renewal instructions, and a logout button.
3. **Manual Audit & Unlock**:
   - The retailer pays and shares the screenshot to the admin's WhatsApp: `+91 96009 50190`.
   - The Super Admin verifies the receipt, clicks "Record Manual Payment" in the super control panel, which issues a `POST /api/shops` payload to log a new `Payment` audit, updates the shop subscription to `'active'`, and extends `subscriptionExpiresAt` by 30 days.
   - The retailer's blocker overlay disappears immediately on the next auth check.
