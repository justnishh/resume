# Release Notes

## v1.0.0 - Initial Release

### 🚀 Features

#### Dashboard
- Overview of tracked job applications
- Quick stats: Total, Not Applied, Applied, Interviewing, Offers, Rejected
- Recent jobs list
- Quick actions panel
- Search preferences preview
- Application pipeline visualization

#### Job Management
- Add jobs manually
- Track application status (Not Applied → Applied → Interview → Offer → Rejected)
- One-click apply opens job URL in new tab
- Filter jobs by status
- Search jobs by title/company
- Delete jobs

#### Job Scraping (Apify Integration)
- Scrape jobs from LinkedIn and Indeed
- Configure search roles and locations
- Auto-scrape via Vercel cron (24-hour interval)
- Deduplicate scraped jobs
- Source tracking (linkedin, indeed, manual)

#### Resume Manager
- Create multiple resume versions
- Set default resume
- Personal info (name, email, phone, location, LinkedIn, website, summary)
- Experience section (company, title, dates, description)
- Education section (institution, degree, field, dates)
- Skills section (categorized: technical, soft, tools, languages)
- Projects section
- Export to Markdown
- Export to JSON

#### Asana Integration
- Connect Asana account (OAuth)
- Fetch completed projects
- Import projects as resume experience
- Sync workspace data

#### Settings
- Configure job search preferences
- Manage tracked job roles
- Manage locations
- Select job sources (LinkedIn, Indeed)
- Connect/disconnect Asana
- View environment variables info

### 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Job Scraping**: Apify API
- **Deployment**: Vercel

### 📁 Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── cron/scrape/
│   │   ├── jobs/
│   │   └── resume/
│   ├── dashboard/
│   ├── jobs/
│   ├── resume/
│   └── settings/
├── components/
├── lib/
│   ├── services/
│   │   ├── apify.ts
│   │   ├── asana.ts
│   │   └── resume.ts
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
└── types/
```

### 🔧 Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**
   - Push to GitHub
   - Import project in Vercel
   - Add environment variables
   - Deploy

### ⚠️ Known Limitations
- Apify free tier: 5,000 credits/month (~50-100 job searches)
- Vercel free tier: 100 hours serverless functions/month
- Single user recommended (perSONal job tracker)

### 📋 Environment Variables Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth |
| `NEXTAUTH_URL` | Your app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `GITHUB_CLIENT_ID` | GitHub OAuth (optional) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional) |
| `APIFY_API_TOKEN` | Apify API token |
| `ASANA_CLIENT_ID` | Asana OAuth (optional) |
| `ASANA_CLIENT_SECRET` | Asana OAuth (optional) |
| `CRON_SECRET` | Secret for cron endpoint |

### 🔜 Coming Soon
- PDF resume export
- Email notifications for new jobs
- More resume templates
- Job application notes
- Interview scheduling
- Analytics dashboard

---

Built with ❤️ for job seekers
