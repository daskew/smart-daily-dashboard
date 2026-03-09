# Smart Daily Dashboard - Project Specification

## Overview
- **Project Name**: Smart Daily Dashboard
- **Purpose**: Combine Gmail and Outlook calendar, todo, and email into one unified daily view
- **Target Users**: Professionals managing multiple email/calendar accounts
- **URL**: https://smart-daily-dashboard.vercel.app/

## Credentials Status
- **GitHub**: ✅ Have token (user: daskew)
- **Vercel**: ✅ Deployed at https://smart-daily-dashboard.vercel.app/
- **Supabase**: ✅ URL: https://cilkpbwkxkeacnqcuyof.supabase.co

## Progress (TDD - Tests First)
### Phase 1: Foundation ✅
- [x] **1.1** Initialize React + Vite project with TypeScript
- [x] **1.2** Set up Vercel configuration
- [x] **1.3** Set up Supabase project and database schema
- [x] **1.4** Configure GitHub repo and push initial code

### Phase 2: Authentication ✅ (4 tests passing)
- [x] **2.1** Write tests for user registration (TDD)
- [x] **2.2** Write tests for user login (TDD)
- [x] **2.3** Implement user auth with email/password
- [x] **2.4** Implement session management
- [x] **2.5** Write tests for protected routes (TDD)
- [x] **2.6** Deploy and test auth

---

## Next Steps
### Phase 3: Account Connection (Google)
- [ ] **3.1** Write tests for Google OAuth flow (TDD)
- [ ] **3.2** Implement Google OAuth consent screen
- [ ] **3.3** Store Google tokens securely
- [ ] **3.4** Implement Google Calendar API integration
- [ ] **3.5** Implement Gmail API integration
- [ ] **3.6** Deploy and test Google connection

### Phase 4: Account Connection (Outlook)
- [ ] **4.1** Write tests for Microsoft OAuth flow (TDD)
- [ ] **4.2** Implement Microsoft OAuth consent screen
- [ ] **4.3** Store Microsoft tokens securely
- [ ] **4.4** Implement Microsoft Graph API for Calendar
- [ ] **4.5** Implement Microsoft Graph API for Email
- [ ] **4.6** Implement Microsoft Graph API for Tasks
- [ ] **4.7** Deploy and test Outlook connection

### Phase 5-9: Dashboard UI, Todos, Settings (TBD)
