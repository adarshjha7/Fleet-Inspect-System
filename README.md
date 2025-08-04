# 🚌 FleetInspect — Fleet Inspection & Management System

A modern application for bus companies to manage vehicle inspections, track maintenance alerts, and ensure fleet compliance.

---

## ⚙️ Features

* **Digital Inspections** — Fill forms with photo/video evidence
* **Role-Based Access** — Drivers & Admins with separate views
* **Live Dashboard** — Real-time fleet status & alerts
* **Media Uploads** — Attach files to inspections
* **Admin Controls** — Change statuses, resolve alerts
* **Responsive UI** — Works on mobile, tablet, desktop

---


## 🛠 Tech Stack

- **Node.js** – Backend runtime
- **Express.js** – Web framework
- **SQLite** – Lightweight relational database
- **React with TypeScript** – Responsive UI (Type safety and modern JavaScript features).

---

## 🚀 Core Functionalities

- **Vehicle Management**
  - Add, update, and retrieve vehicle details
  - Store inspection history and status

- **Inspection Reports**
  - Submit new inspections with details, photos, and status
  - Update inspection statuses (pass, fail, pending)
  - Fetch inspection history

- **Maintenance Alerts**
  - Auto-generate alerts on failed or overdue inspections
  - View and manage unresolved maintenance alerts

- **Data Storage**
  - Uses SQLite for lightweight local persistence
  - Media (photos/videos) stored as base64-encoded strings in DB

---


## 🚦 App Flow

### Driver

* Login → Dashboard → Fill inspection → Attach media → Submit

### Admin

* Login → View reports → Manage statuses & alerts

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd Fleet-Inspection-System

# Install dependencies
npm install

# Start dev server
npm run dev
```

Access at: `http://localhost:8080`

---

## 🧪 Scripts

```bash
npm run dev        # Dev server
```

---

## 🧪 Live Screenshots

<img width="1920" height="1080" alt="Screenshot (133)" src="https://github.com/user-attachments/assets/7f8ae624-af91-49ab-bece-9f28db317173" />
<img width="1920" height="1080" alt="Screenshot (134)" src="https://github.com/user-attachments/assets/85946918-ad22-4f1c-af5b-1ef5c8d0d371" />
<img width="1920" height="1080" alt="Screenshot (135)" src="https://github.com/user-attachments/assets/3e80775b-2321-4c5f-90a0-0d18356e7679" />
<img width="1920" height="1080" alt="Screenshot (136)" src="https://github.com/user-attachments/assets/dd3e53aa-2b45-4977-b0e4-92bce0f0d1ea" />
<img width="1920" height="1080" alt="Screenshot (137)" src="https://github.com/user-attachments/assets/d3647941-f445-4d6f-98e9-f8b8e1d0f261" />
---
