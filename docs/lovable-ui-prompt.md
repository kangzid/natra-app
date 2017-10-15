# Prompt Desain UI NATRA Mobile untuk Lovable AI 🚀

---

## 🏗️ Project Overview
**App Name:** NATRA Mobile (Employee App)
**Full Name:** Nata Terpadu Rapi Amanah
**Purpose:** A modern, premium HRIS mobile application for field employees focusing on Attendance tracking (GPS-based), Task Management, and real-time notifications.
**Technology Stack Preference:** React, Tailwind CSS, Lucide Icons, Framer Motion (for animations), and Shadcn/UI.

---

## 🎨 Visual Identity & Aesthetics
- **Theme:** Clean, modern "Flat Design" with subtle glassmorphism.
- **Primary Color:** Deep Blue (#2563eb) and Sky Blue (#0ea5e9).
- **Secondary Colors:** Emerald Green (Success), Amber (Warnings), and Slate (Neutrals).
- **Typography:** **Plus Jakarta Sans** (Primary font). Use font-weight 800 for titles to give a premium feel.
- **Design Elements:** 
  - 1px border instead of heavy shadows (Flat UI).
  - High-precision layouts with consistent spacing (Padding 20px/5px).
  - Sticky Headers on every module page.
  - Floating Bottom Navigation with an active indicator.

---

## 📱 Page Architecture Requirements

### 1. Unified Shell & Layout
- A persistent **Bottom Navigation** bar with 5 items: Home, Attendance, Tasks, Notif, and Profile.
- A **Standardized Header Component** across all modules with a bold title (2xl) and a context area on the right.

### 2. Dashboard (Home)
- Employee info card (Avatar, Name, Position).
- Quick stats grid (Today's check-in/out time).
- "Tugas Hari Ini" preview slider.
- Recent notifications list.

### 3. Attendance Module (The Core)
- **Main Action Card:** Features a large circular action button.
- **Dynamic States:**
  - *Check-In State:* Blue button with "Absen Masuk" label.
  - *Check-Out State:* Amber button with "Absen Keluar" label.
  - *Done State:* Emerald button with a rotating curved text: **"SELAMAT iNI ANDA SUDAH ABSEN •"**.
- **Map View:** Integrated Leaflet or Mapbox preview showing a 1px bordered map with a pulse marker on the user's current location.
- **Attendance History:** A month-based calendar list showing status (Present, Late, Absent).

### 4. Task Management
- Two-tier filtering system: **Status** (Pending, Accepted, Progress, Done) and **Priority** (Urgent, High, Medium).
- Task cards featuring priority-colored top borders (e.g., Red for Urgent).
- **Detail View:** Deep dive into task description, deadline timer, and an action button flow (Accept -> Start -> Complete with Notes).

### 5. Notifications & Profile
- Clean notification list with "Mark as Read" functionality.
- Professional profile page with quick settings and logout.

---

## ⚙️ Special UI Logics to Replicate
1. **Clock Component:** Real-time digital clock on the attendance page.
2. **Curved Rotating Text:** An SVG-based circular text that spins infinitely on the "Done" state of the attendance button.
3. **Skeleton Loading:** Implement Shimmer effect skeletons for all data-fetching sections.

---

## 🚀 Final Instruction for Lovable
"Please build this app with a mobile-first approach (responsive for screens up to 480px) and prioritize visual excellence. Use high-quality components from Shadcn/UI where applicable but keep the 'NATRA' blue branding consistent. Make the transitions between pages feel fast and fluid using Framer Motion."
