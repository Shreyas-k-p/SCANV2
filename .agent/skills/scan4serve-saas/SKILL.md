---
name: scan4serve-saas
description: Builds and maintains the Scan4Serve multi-restaurant QR-based SaaS platform with hierarchical role management (Super Admin → Restaurant Admin → Manager → Sub-Manager → Waiter/Kitchen), real-time order tracking, JioBase proxy integration, strict multi-tenant isolation, and production-ready architecture.
---

# Scan4Serve SaaS Skill

# 1. Product Vision

Scan4Serve is a multi-restaurant SaaS platform that enables QR-based table ordering, real-time kitchen coordination, hierarchical staff management, subscription-based restaurant onboarding, and centralized platform governance.

The system must be:

- Multi-tenant
- Secure
- Role-hierarchical
- Real-time enabled
- Mobile-first
- Production-ready
- Cleanly structured
- Scalable

---

# 2. Core Problem Statement

Restaurants face:

- Manual ordering errors
- Slow waiter dependency
- Poor communication between kitchen and service staff
- No centralized analytics
- No real-time order tracking
- Lack of structured digital infrastructure

Scan4Serve solves this using QR-based ordering, live status updates, role-based dashboards, and SaaS-level restaurant management.

---

# 3. Governance & Role Hierarchy

## Platform Level

Super Admin (Platform Owner)

## Restaurant Level

Restaurant Admin  
Manager  
Sub-Manager  
Waiter  
Kitchen  
Customer (QR Session-Based)

---

# 4. Role Definitions & Permissions

## 4.1 Super Admin (Platform Owner)

Controls entire SaaS.

Permissions:
- Create restaurants
- Assign Restaurant Admin
- Manage subscription plans
- Activate / Deactivate restaurants
- View total platform revenue
- View system analytics
- Lock accounts
- Access audit logs

Restrictions:
- Cannot modify restaurant orders unless elevated access mode

---

## 4.2 Restaurant Admin

Owner of a specific restaurant inside platform.

Permissions:
- Manage restaurant profile
- Assign Managers
- View full restaurant analytics
- Monitor subscription
- Override manager permissions

Restrictions:
- Cannot access other restaurants
- Cannot modify platform-level configuration

---

## 4.3 Manager

Operational head of restaurant.

Permissions:
- Manage menu (CRUD)
- Manage categories
- Manage tables & generate QR
- Add Sub-Managers
- Add Waiters
- Add Kitchen Staff
- View revenue reports
- Monitor live orders

Restrictions:
- Cannot modify subscription
- Cannot create Restaurant Admin
- Cannot access platform analytics

---

## 4.4 Sub-Manager

Assistant operational controller.

Permissions:
- Monitor orders
- Manage waiters
- View reports
- Update availability

Restrictions:
- Cannot assign managers
- Cannot modify subscription
- Cannot access financial controls

---

## 4.5 Kitchen

Permissions:
- View incoming orders
- Accept orders
- Mark preparing
- Mark ready
- Mark item unavailable
- Update estimated time

Conditions:
If item unavailable:
- Disable item
- Notify manager
- Prevent new orders

---

## 4.6 Waiter

Permissions:
- View table grid
- View order status
- Mark served
- Handle payment (cash)
- Respond to call waiter alerts

Conditions:
If payment fails:
- Retry
- Switch to cash
- Escalate to manager

---

## 4.7 Customer (QR Based Session)

No login required.

Permissions:
- Scan QR
- Browse menu
- Add to cart
- Add notes
- Place order
- Track status
- Call waiter
- Pay
- Leave feedback

Conditions:
- If QR invalid → Show error
- If item out of stock → Disable selection
- If kitchen rejects → Notify & suggest alternative
- If payment fails → Retry
- If network fails → Retry queue

---

# 5. Multi-Tenant Architecture

All data must include:

restaurantId

Super Admin records do not require restaurantId.

Strict Rule:
Every database query must filter by restaurantId except platform-level operations.

Data isolation is mandatory.

---

# 6. System Architecture

Customer Device
    ↓
Frontend (React / Next.js)
    ↓
Backend API (Node.js + Express)
    ↓
JioBase Proxy Layer
    ↓
Primary Database (MongoDB / PostgreSQL)
    ↓
WebSocket Server (Real-Time Engine)

---

# 7. JioBase Proxy Integration

JioBase acts as:

- API gateway
- Rate limiter
- Security layer
- Request logger
- Regional router

Business logic must remain in backend.
Proxy must not contain application logic.

---

# 8. Real-Time System Design

Use WebSocket (Socket.io).

Rooms:

- platform_global
- restaurant_<restaurantId>
- kitchen_<restaurantId>
- waiter_<restaurantId>
- table_<tableId>

Events:

- new_order
- order_status_update
- stock_update
- call_waiter
- subscription_change
- payment_update

---

# 9. Order Lifecycle

Placed  
→ Accepted  
→ Preparing  
→ Ready  
→ Served  
→ Completed  

Edge Conditions:

- Cancel before acceptance
- Partial rejection
- Payment failure
- Timeout escalation
- Duplicate prevention
- Refund scenario

---

# 10. Database Schema (Core Collections)

## Restaurants
- _id
- name
- subscriptionStatus
- plan
- createdAt
- isActive

## Users
- _id
- name
- email
- password
- role
- restaurantId
- createdBy
- isActive

## Tables
- _id
- restaurantId
- tableNumber
- qrCodeUrl
- active

## Categories
- _id
- restaurantId
- name

## MenuItems
- _id
- restaurantId
- categoryId
- name
- price
- image
- available

## Orders
- _id
- restaurantId
- tableId
- items[]
- totalAmount
- status
- paymentStatus
- timestamps

## AuditLogs
- _id
- userId
- action
- timestamp

---

# 11. API Design Standards

Prefix:
 /api/v1/

Response format:

{
  success: boolean,
  message: string,
  data: object
}

Rules:
- Validate inputs (Joi / Zod)
- Centralized error middleware
- Role middleware
- Rate limiting
- Request sanitization

---

# 12. Frontend Architecture

## Folder Structure

client/
  components/
  pages/
  layouts/
  hooks/
  services/
  context/
  utils/

## UI Principles

- Mobile-first
- Clean minimal design
- Touch-friendly buttons
- High contrast
- Responsive grids
- Sticky cart button
- Real-time indicators

---

# 13. Backend Architecture

server/
  controllers/
  routes/
  models/
  middleware/
  services/
  sockets/
  config/
  utils/

Rules:
- Business logic in services
- Routes only map endpoints
- Async/await only
- Proper error handling
- Logging middleware

---

# 14. Security Requirements

- JWT authentication
- Role-based access control
- Bcrypt hashing
- CORS protection
- Helmet headers
- Rate limiting
- Input validation
- Mongo injection prevention
- Soft delete strategy

---

# 15. Performance Requirements

- Index restaurantId
- Paginate order history
- Lazy load images
- Use compression middleware
- Avoid blocking operations
- Cache frequent reads if needed

---

# 16. Mobile Responsiveness Requirements

- Responsive layout for all dashboards
- Table grid responsive scaling
- Large touch targets
- Optimized image sizes
- Fast loading

---

# 17. Subscription Enforcement Logic

If subscription expired:

- Disable ordering
- Disable kitchen dashboard
- Disable waiter dashboard
- Show renewal screen
- Only Super Admin can reactivate

---

# 18. Edge Case Handling Checklist

- Invalid QR
- Duplicate orders
- Network disconnect
- Item out of stock mid-order
- Kitchen rejection
- Payment failure
- Staff disabled mid-shift
- Subscription expired
- Role abuse attempt
- WebSocket reconnect logic

---

# 19. Development Workflow

1. Setup backend structure
2. Implement authentication
3. Implement multi-tenant filtering
4. Implement role hierarchy
5. Build order lifecycle
6. Integrate WebSockets
7. Build dashboards
8. Add proxy integration
9. Add validation & logging
10. Test edge cases
11. Deploy staging
12. Perform load test
13. Deploy production

---

# 20. Coding Standards

- Clear naming conventions
- No mixed logic in routes
- Reusable components
- DRY principle
- Environment variable configuration
- Clean commit structure
- Document APIs

---

# 21. Future Expansion

- Multi-branch support
- Inventory automation
- AI-based demand prediction
- Loyalty programs
- Native mobile app
- Offline mode sync
- Smart kitchen queue optimization

---

# Final Rule

When building Scan4Serve:

- Always enforce tenant isolation.
- Always enforce role hierarchy.
- Always validate inputs.
- Always handle edge cases.
- Always maintain clean separation of concerns.
- Always prioritize mobile responsiveness.
- Always design for scale.

This skill defines the complete production blueprint for Scan4Serve SaaS.
