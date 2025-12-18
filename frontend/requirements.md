## 📄 High-level summary of the project (from your spec)

Your project is a Web App for an **Online Auction platform**, with:

* Multiple user roles: guest, bidder (buyer), seller, admin.
* Key functions: browsing categories, searching products, bidding, watchlist, seller product listing, user profiles, admin panel, auctions, payout/checkout, notifications (mailing), optional auto-bid (proxy bidding), full authentication, etc.
* Requirements: SPA frontend (CSR), RESTful backend, at least 20 products seeded, bid history, secure auth, good UI/UX, data validation, full source control, documentation, etc.


---

## 🔧 Tasks & Screens / Views Breakdown

Below is a breakdown of **screens (views/pages)** + **tasks/features** grouped by user roles / functional area. This helps you see what needs to be implemented.

### 📌 Guest (anonymous) / Public-facing

**Views / Screens**

* Home page (landing) — shows: top-5 ending soon auctions, top-5 most-bid auctions, top-5 highest-price auctions.
* Category listing page — show categories (2-level), allow selecting a category to view products.
* Product list (category or search results) page — with pagination, sorting, filtering.
* Search results page (text + category filters).
* Product detail page — detailed info, images, bid history (masked), current price, “buy now” price (if any), seller info, related items, Q&A section.
* Sign up / login page (but login/signup might be shared across roles).

**Tasks / Features**

* Build category structure (2-level), seed categories + products.
* Implement pagination & sorting (by end time, price, newness) for listing pages.
* Full-text search supporting Vietnamese (without diacritics) + filter by category.
* Product detail view: display all info, images (main + gallery), bid history (partial anonymized), description, seller info, related items.
* Q&A (questions & answers) UI — allow posting questions (for guest? or only buyer?) — though only logged-in users can bid, but guests may view? (spec not totally explicit).
* “Buy Now” functionality: show “buy now” price if product has it.

### 👤 Bidder (logged-in buyer)

**Views / Screens**

* Watch List / Favorites — list of products user bookmarked.
* My Bids / Active Auctions — list of auctions user is currently bidding on.
* Won Auctions / Purchase History — auctions user won.
* Profile page — show user info, rating (review history), ability to edit profile, change password, view evaluations.

**Tasks / Features**

* Signup / login + authentication (password, maybe future social login).
* Email + OTP verification for signup.
* Bid functionality: allow bidding on product detail page, check bidder rating, enforce min bid + bid increment, confirm bid.
* Bid history retrieval and display (masked names).
* Watch list: add/remove product from watch list.
* Allow bidder to request “upgrade to seller” (send request, admin to approve).
* Notifications / mailing: send email when: bid success / outbid / auction won / auction ended / question answered / etc.

### 🛒 Seller

**Views / Screens**

* Seller Dashboard — list of own active auctions, history, won/lost auctions, products posted.
* Product creation / listing page — form to submit new auction: name, images (≥3), starting price, bid increment, buy-now price (optional), description (WYSIWYG), auto-extend option, etc.
* Product edit / append description page — allow appending info (not replacing).
* Q&A management — view and answer questions on own listed products.
* Post-auction order finalization page (after auction ends) — buyer payment, shipping details, seller confirmation, chat interface for buyer/seller to communicate.
* Review buyer after sale (give positive/negative feedback).

**Tasks / Features**

* Product listing form with validation, image upload, metadata.
* Auto-extend logic: if a bid arrives within last 5 minutes, extend auction by 10 minutes (configurable by admin).
* Append-only description editing for products.
* Q&A handling + notification for seller to respond.
* After auction ends: display order completion page to seller & buyer, handle payment (just simulate or stub for now), shipping info, status changes, confirmation, final review.
* Chat interface (basic messaging) between buyer and seller for transaction finalization (could be simplified).

### 🛠️ Admin

**Views / Screens**

* Admin Dashboard / Control Panel.
* Category Management — create, update, delete categories (with constraint: cannot delete category that has products).
* Product Management — remove / deactivate products.
* User Management — list users, view details, approve bidder → seller upgrade requests.
* Stats / Reports panel — show metrics: number of new auctions, revenue, new users, upgrades, etc.

**Tasks / Features**

* Admin CRUD operations for categories, products, users.
* Enforce business rules (e.g. category deletion constraint).
* Approve/deny seller upgrade requests.
* Collect & compute statistics for dashboard.

### 🧩 Shared / Other (Cross-cutting)

* Authentication & authorization (guest / buyer / seller / admin)
* Email / mailing system for notifications
* Data model & initial seed data (>= 20 products, with images, descriptions, bid history with at least 5 bids each)
* Logging / monitoring (optional / recommended)
* Source control (use Git, with frequent commits/pushes) and documentation (README, API docs — e.g. Swagger)
* Validation on backend (all endpoints), error handling, security (e.g. password hashing with bcrypt/scrypt), input sanitization.
* Frontend: consistent UI design, router, form handling / validation, state management (React Context / Redux / Zustand…), responsive design.
* Testing (basic): smoke test of main flows (bidding, auction end, user signup, product listing)
