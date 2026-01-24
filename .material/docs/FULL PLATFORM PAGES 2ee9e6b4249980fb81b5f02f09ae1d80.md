# FULL PLATFORM PAGES

# 1. Platform Overview

**Heptadev** is an AI-powered project marketplace that connects idea owners (clients) with skilled talents (workers & companies) and guarantees project delivery through AI-assisted planning, escrow payments, milestones, NDA protection, dispute resolution, and long-term maintenance.

The platform is designed to:

- Remove communication barriers
- Protect client ideas
- Guarantee fair payments
- Provide clear job execution
- Enable long-term project growth

---

# 2. User Types & Roles

| Role | Description |
| --- | --- |
| Guest | Anyone browsing the platform |
| Client | Person or company posting projects |
| Talent | Individual worker or freelancer |
| Company | Enterprise-level service provider |
| Admin | Platform operators & moderators |
| Finance | Payment, escrow & dispute team |
| Support | Human dispute resolution |

---

# 3. Public Pages (Accessible Without Login)

---

## 3.1 Landing Page

**URL:** `/`

### Purpose

Introduce Heptadev, explain how it works, and convert visitors into users.

### Content

- Hero section: “Turn Ideas Into Reality”
- How Heptadev works (3 steps)
- Client benefits
- Talent benefits
- Safety & escrow explanation
- AI-powered planning explanation
- Testimonials
- Call-to-action buttons:
    - Post a Project
    - Find Work
    - Join as Company

### Access

- Everyone

---

## 3.2 How It Works Page

**URL:** `/how-it-works`

### Purpose

Explain the full workflow in detail.

### Sections

- For Clients
- For Talents
- AI Project Builder
- NDA Protection
- Escrow Payments
- Milestones
- Dispute Resolution
- Maintenance Plans

### Access

- Everyone

---

## 3.3 Explore Projects (Public View)

**URL:** `/projects`

### Purpose

Show available projects to talents.

### Features

- Project cards
- Filters (category, budget, duration)
- Search
- Enterprise priority badge
- NDA required label

### Public View Shows

- Project title
- Short description
- Budget range
- Duration
- Category

### Hidden (until NDA)

- Full requirements
- Files
- Business logic
- Sensitive IP

### Access

- Everyone (limited view)

---

## 3.4 Companies & Enterprise

**URL:** `/enterprise`

### Purpose

Sell enterprise priority access.

### Sections

- Tier 1 priority explanation
- Tier 2 priority explanation
- Early access benefits
- SLA guarantees
- Custom contracts
- Dedicated account manager

### Access

- Everyone

---

## 3.5 Pricing Page

**URL:** `/pricing`

### Purpose

Explain platform fees.

### Sections

- Client fees
- Talent fees
- Escrow fee
- Maintenance subscriptions
- Enterprise plans

---

## 3.6 Trust & Safety Page

**URL:** `/trust`

### Purpose

Build confidence.

### Sections

- Escrow protection
- NDA enforcement
- AI dispute resolution
- Human arbitration
- KYC system
- Fraud prevention

---

# 4. Authentication Pages

---

## 4.1 Login Page

**URL:** `/auth/login`

- Email/password
- Google/GitHub login
- Company SSO
- 2FA support

---

## 4.2 Register Page

**URL:** `/auth/register`

Choose role:

- Client
- Talent
- Company

---

# 5. Client Pages

---

## 5.1 Client Dashboard

**URL:** `/client/dashboard`

### Purpose

Client control center.

### Shows

- Active projects
- Draft projects
- Maintenance projects
- Escrow balance
- Notifications
- Disputes
- Messages

---

## 5.2 Create Project (AI Project Builder)

**URL:** `/client/projects/create`

### Core Engine Page

### Step 1: Idea Input

- Text description
- Voice input
- File upload
- Sketch upload

### Step 2: Process Mode

- Fast Mode
- Advanced Mode

### Step 3: AI Interview

- Dynamic questions
- Skip allowed
- AI assumptions when skipped

### Step 4: AI Plan Output

- Project summary
- Deliverables
- Timeline
- Tech hidden by default
- Show Technical Mode toggle

### Step 5: Budget & Deadline

- Budget input
- Deadline input
- AI feasibility check
- Budget warning system
- Continue anyway option

### Step 6: Publish

- Publish project
- Save draft

---

## 5.3 Project Page (Client View)

**URL:** `/client/projects/{id}`

### Sections

- Overview
- Milestones
- Applicants
- Messages
- Files
- Escrow
- NDA status
- Dispute button

---

## 5.4 Applicant Review Page

**URL:** `/client/projects/{id}/applicants`

### Features

- Applicant profiles
- Ratings
- Past projects
- Portfolio
- AI match score
- Accept / Reject

---

## 5.5 Escrow & Payments Page

**URL:** `/client/payments`

- Deposit funds
- View escrow
- Milestone releases
- Manual release (max 50%)
- Refunds

---

## 5.6 Maintenance Projects

**URL:** `/client/maintenance`

- Active maintenance subscriptions
- New maintenance request
- History timeline
- Priority queue

---

# 6. Talent Pages

---

## 6.1 Talent Dashboard

**URL:** `/talent/dashboard`

- Applied jobs
- Active jobs
- Completed jobs
- Earnings
- Ratings
- Messages

---

## 6.2 Browse Jobs

**URL:** `/talent/jobs`

- Filters
- NDA badge
- Budget range
- Category

---

## 6.3 Job Application Page

**URL:** `/talent/jobs/{id}`

- NDA agreement
- Full project details
- Apply form
- Proposal
- Timeline suggestion
- Price suggestion

---

## 6.4 Active Job Workspace

**URL:** `/talent/work/{id}`

- Milestones
- Chat
- File upload
- Progress tracking
- Delivery submission

---

## 6.5 Earnings & Withdrawals

**URL:** `/talent/payments`

- Balance
- Withdrawal
- History
- Invoices

---

# 7. Company Pages (Enterprise)

---

## 7.1 Company Dashboard

**URL:** `/company/dashboard`

- Team members
- Assigned jobs
- Priority queue
- SLA metrics

---

## 7.2 Team Management

**URL:** `/company/team`

- Invite employees
- Roles & permissions
- Task assignments

---

## 7.3 Priority Queue

**URL:** `/company/priority`

- Early access projects
- AI matching
- Auto-apply system

---

# 8. Messaging & Collaboration

---

## 8.1 Messages

**URL:** `/messages`

- Real-time chat
- File sharing
- Voice notes
- AI summary

---

## 8.2 Video Meetings

**URL:** `/meetings`

- Built-in calls
- Screen sharing
- Recording

---

# 9. Dispute System

---

## 9.1 Dispute Center

**URL:** `/disputes`

- Open disputes
- History
- AI verdict
- Appeal

---

## 9.2 Dispute Page

**URL:** `/disputes/{id}`

- Timeline
- Messages
- Evidence upload
- AI analysis
- Admin review

---

# 10. Admin Pages

---

## 10.1 Admin Dashboard

**URL:** `/admin`

- Platform metrics
- Revenue
- Projects
- Disputes
- Fraud alerts

---

## 10.2 Project Moderation

- Flagged projects
- IP violations
- Scam detection

---

## 10.3 User Management

- Ban users
- Verify KYC
- Suspend accounts

---

## 10.4 Financial Control

- Escrow monitoring
- Fraud detection
- Refund processing

---

# 11. AI Engine Pages

---

## 11.1 AI Project Analyzer

Internal system:

- Requirement extraction
- Tech planning
- Milestone generator
- Budget estimator

---

## 11.2 AI Dispute Resolver

- Chat analysis
- Contract comparison
- Delivery verification
- Verdict recommendation

---

# 12. Security & Compliance

---

## 12.1 KYC Page

**URL:** `/verification`

- ID upload
- Address verification
- Business verification

---

## 12.2 NDA System

- Digital signature
- Timestamped
- Legally binding

---

# 13. Maintenance System

---

## 13.1 Maintenance Dashboard

**URL:** `/maintenance`

- All ongoing maintenance
- Priority handling
- History timeline

---

## 13.2 Maintenance Request

- Bug report
- Feature request
- Emergency fix

---

# 14. Notifications System

- Email
- SMS
- In-app
- Web push

---

# 15. Mobile App Pages

Same structure as web:

- Client app
- Talent app
- Company app
- Admin app

---

# 16. Core Features Summary

| Feature | Included |
| --- | --- |
| AI project builder | ✅ |
| Escrow payments | ✅ |
| Milestones | ✅ |
| NDA protection | ✅ |
| Dispute resolution | ✅ |
| Enterprise priority | ✅ |
| Maintenance plans | ✅ |
| KYC system | ✅ |
| Fraud detection | ✅ |
| Video meetings | ✅ |
| AI matching | ✅ |
| Long-term project history | ✅ |

---

# 17. Business Model Pages

---

## Revenue Streams

- Transaction fee
- Enterprise subscriptions
- Maintenance subscriptions
- Dispute arbitration fee
- Priority publishing

---

# 18. Future Expansion Pages

- App marketplace
- Plugin ecosystem
- API marketplace
- White-label enterprise version

---