# 🍜 Restaurant Management System (POS + Ordering)

## 📌 Overview

This project is a full-stack **Restaurant Management System** built with Next.js, Prisma, and Docker.
It supports ordering, inventory management (BOM), payments, promotions, and offline sync.

---

# 🚀 Development Roadmap (Step-by-Step)

## 🔰 Phase 1: Core UI & Basic System (START HERE)

### 1. 🔐 Authentication

**Pages to build:**

* `/login` → Login page
* `/register` (optional)

**Features:**

* Login / Register
* Store JWT
* Redirect after login

---

### 2. 🍔 Menu Page (Customer View)

**Path:** `/menu`

**Features:**

* Show all products (อาหาร)
* Display:

  * Name
  * Price
  * Options (e.g. เพิ่มชีส / หวานน้อย)
* Add item to cart

---

### 3. 🧾 Order Page (Cart / POS)

**Path:** `/order`

**Features:**

* Show selected items
* Update quantity
* Remove items
* Calculate total price
* Apply promotion code
* Submit order

---

## ⚡ Phase 2: Backend Integration

### 4. 📦 Product API

* `GET /api/products`
* `POST /api/products`

👉 Connect menu page to real data

---

### 5. 🧾 Order API

* `POST /api/orders`
* `GET /api/orders`

👉 Save orders to database

---

### 6. 💳 Payment System

* `POST /api/payments`

**Features:**

* Cash / QR
* Mark order as paid

---

## 🔥 Phase 3: Advanced Features

### 7. 📦 Inventory System (BOM)

**Features:**

* Ingredient management
* Stock tracking
* Deduct stock when order created

---

### 8. 🎟️ Promotion System

**Features:**

* Discount code
* Validate promotion
* Apply discount to order

---

### 9. 🔄 Offline Mode

**Features:**

* Store orders in localStorage
* Sync with `/api/orders/sync` when online

---

## 🧪 Phase 4: Testing & Optimization

### Testing

* Pricing logic
* Inventory deduction
* Offline sync

### Optimization

* API validation
* Error handling
* Performance tuning

---

## 🚀 Phase 5: Deployment

### Setup:

* Docker (Full system)
* Environment variables (.env)

### Deploy:

* Frontend + Backend
* Database connection

---

# 🧭 Recommended Build Order

1. Login Page
2. Menu Page
3. Order Page
4. Product API
5. Order API
6. Payment
7. Inventory (BOM)
8. Promotion
9. Offline Sync
10. Testing + Deploy

---

# 🎯 Goal

Build a system that can:

* Handle real restaurant orders
* Work offline (POS style)
* Manage inventory automatically
* Support promotions & payments

---

# 💡 Notes

* Start simple → then scale
* Focus on working features first
* Keep UI minimal, logic strong
* Prioritize Order + Menu before advanced features

---

# 🔥 Final Vision

> A production-ready restaurant POS system with full-stack architecture, offline capability, and real-world business logic.
