# Food Ordering Website Specification

## 1. Project Overview

**Project Name:** Foodie - Restaurant Food Ordering System

**Project Type:** Full-stack Web Application (Next.js)

**Core Functionality:** A complete food ordering platform with a customer-facing ordering interface and an admin panel for restaurant management. Customers can browse menus, customize orders, and track their deliveries. Admins can manage menu items, categories, and process customer orders.

**Target Users:**
- Restaurant customers wanting to order food online
- Restaurant staff/admin managing orders and menu

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite with Prisma ORM
- **State Management:** React Context for cart
- **Icons:** Lucide React

---

## 2. UI/UX Specification

### Design Philosophy
Clean, modern, and appetizing design that highlights food imagery. Warm color palette to evoke hunger and comfort. Simple, intuitive navigation for seamless ordering experience.

### Color Palette
```css
--primary: #FF6B35        /* Warm Orange - CTAs, highlights */
--primary-dark: #E55A2B   /* Darker orange for hover states */
--secondary: #2D3436      /* Dark charcoal - text, headers */
--accent: #00B894         /* Fresh green - success, badges */
--background: #FAFAFA     /* Off-white - main background */
--surface: #FFFFFF        /* Pure white - cards, modals */
--muted: #636E72          /* Gray - secondary text */
--border: #DFE6E9         /* Light gray - borders */
--danger: #D63031         /* Red - delete, errors */
--warning: #FDCB6E        /* Yellow - pending status */
```

### Typography
- **Font Family:** "Plus Jakarta Sans" (headings), "DM Sans" (body)
- **Headings:** 
  - H1: 48px, weight 700
  - H2: 32px, weight 600
  - H3: 24px, weight 600
  - H4: 18px, weight 600
- **Body:** 16px, weight 400
- **Small:** 14px, weight 400

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Structure

#### Customer Site
1. **Header (sticky)**
   - Logo (left)
   - Navigation links: Home, Menu, About (center)
   - Cart icon with badge count (right)
   - Height: 72px

2. **Hero Section (Homepage)**
   - Full-width background image with overlay
   - Restaurant name and tagline
   - "Order Now" CTA button
   - Height: 70vh on desktop, 50vh on mobile

3. **Menu Page**
   - Category sidebar/sticky tabs on mobile
   - Grid of menu items (3 columns desktop, 2 tablet, 1 mobile)
   - Each item: image, name, description, price, "Add" button

4. **Cart Sidebar**
   - Slide-in from right
   - List of cart items with quantity controls
   - Subtotal and "Checkout" button

5. **Checkout Page**
   - Customer info form (name, phone, address)
   - Order summary
   - Payment method selection (simulated)
   - Place Order button

6. **Footer**
   - Restaurant info, hours, contact
   - Social links

#### Admin Panel
1. **Sidebar Navigation**
   - Logo at top
   - Links: Dashboard, Orders, Menu, Categories, Settings
   - Width: 260px (collapsible on mobile)

2. **Dashboard**
   - Stats cards: Today's Orders, Revenue, Pending, Completed
   - Recent orders list
   - Quick actions

3. **Orders Page**
   - Table with order details
   - Status badges (Pending, Preparing, Ready, Delivered)
   - Action buttons (Accept, Complete, Cancel)

4. **Menu Management**
   - Grid/List toggle view
   - Add new item button
   - Edit/Delete actions
   - Search and filter

5. **Category Management**
   - List of categories
   - Add/Edit/Delete

### Component Specifications

#### Menu Item Card
- Image: 200px height, object-cover, rounded-t-lg
- Content padding: 16px
- Name: H4 style
- Description: 2 lines max, ellipsis
- Price: Primary color, bold
- Add button: Full width, primary color

#### Cart Item
- Horizontal layout
- Image thumbnail: 60x60px
- Name and price
- Quantity controls: -, count, +
- Remove button

#### Order Card (Admin)
- Status badge at top
- Customer name and order details
- Items list
- Total amount
- Action buttons

#### Form Inputs
- Height: 48px
- Border: 1px solid border color
- Border radius: 8px
- Focus: Primary color border, subtle shadow

#### Buttons
- Primary: Primary color bg, white text, rounded-lg
- Secondary: Transparent bg, primary color border/text
- Danger: Danger color bg, white text
- Height: 44px (default), 36px (small), 52px (large)
- Padding: 16px horizontal
- Hover: Darken by 10%

### Animations & Transitions
- All transitions: 200ms ease
- Button hover: Scale 1.02
- Card hover: Subtle shadow increase
- Page transitions: Fade in (300ms)
- Cart sidebar: Slide in from right (250ms)
- Toast notifications: Slide up and fade

---

## 3. Functionality Specification

### Customer Features

#### Homepage
- Display restaurant branding
- Show featured/popular items
- Quick links to menu
- Operating hours

#### Menu Browsing
- View all categories
- Filter by category
- Search items by name
- View item details in modal
- Add items to cart with quantity

#### Shopping Cart
- View all cart items
- Adjust quantities
- Remove items
- See subtotal
- Proceed to checkout

#### Checkout
- Enter customer details (name, phone, address)
- Select order type (Pickup/Delivery)
- Review order
- Place order (simulated payment)
- Receive order confirmation

#### Order Tracking
- View order status
- Statuses: Pending → Preparing → Ready → Delivered

### Admin Features

#### Dashboard
- Today's order count
- Today's revenue
- Pending orders count
- Recent orders list (last 10)
- Quick stats chart (last 7 days)

#### Order Management
- View all orders (filterable by status)
- Update order status
- View order details
- Cancel orders

#### Menu Management
- View all menu items
- Add new menu item (name, description, price, category, image)
- Edit existing item
- Delete item
- Toggle availability

#### Category Management
- View all categories
- Add new category
- Edit category
- Delete category (if empty)

### Data Models

#### Category
```prisma
model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  items     MenuItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

#### MenuItem
```prisma
model MenuItem {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  image       String?
  available   Boolean     @default(true)
  category    Category    @relation(fields: [categoryId], references: [id])
  categoryId  String
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

#### Order
```prisma
model Order {
  id            String      @id @default(cuid())
  customerName   String
  customerPhone  String
  customerAddress String?
  orderType     String      @default("pickup") // pickup, delivery
  status        String      @default("pending") // pending, preparing, ready, delivered, cancelled
  total         Float
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

#### OrderItem
```prisma
model OrderItem {
  id         String   @id @default(cuid())
  quantity   Int
  price      Float    // Price at time of order
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  menuItemId String
  order      Order    @relation(fields: [orderId], references: [id])
  orderId    String
}
```

### API Endpoints

#### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

#### Menu Items
- `GET /api/menu-items` - List all items (with category filter)
- `POST /api/menu-items` - Create item
- `PUT /api/menu-items/[id]` - Update item
- `DELETE /api/menu-items/[id]` - Delete item

#### Orders
- `GET /api/orders` - List orders (with status filter)
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status

---

## 4. Page Structure

```
/                           - Homepage
/menu                      - Menu page
/cart                      - Cart page (optional, sidebar preferred)
/checkout                  - Checkout page
/order/[id]                - Order confirmation/tracking

/admin                     - Admin dashboard
/admin/orders              - Order management
/admin/menu                - Menu item management
/admin/categories          - Category management
/admin/settings            - Settings (optional)
```

---

## 5. Acceptance Criteria

### Customer Site
- [ ] Homepage loads with restaurant branding and CTA
- [ ] Menu displays all categories and items correctly
- [ ] Users can filter menu by category
- [ ] Users can add items to cart
- [ ] Cart shows correct items and totals
- [ ] Checkout form validates required fields
- [ ] Order submission creates order in database
- [ ] Order confirmation displays order details

### Admin Panel
- [ ] Dashboard shows accurate stats
- [ ] All orders display with correct status
- [ ] Admin can update order status
- [ ] Admin can add/edit/delete menu items
- [ ] Admin can add/edit/delete categories
- [ ] Menu items appear correctly on customer site

### General
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] All pages load without errors
- [ ] Database operations work correctly
- [ ] UI matches color palette and typography specs

---

## 6. Seed Data

### Initial Categories
1. Appetizers
2. Main Courses
3. Burgers
4. Pizzas
5. Drinks
6. Desserts

### Sample Menu Items (per category)
- 2-3 items per category with placeholder images from picsum.photos
- Realistic prices ($8 - $25 range)
- Brief descriptions
