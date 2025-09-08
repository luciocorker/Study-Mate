# StudyMate Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables
In Vercel dashboard, add these environment variables:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Alternative: Deploy Frontend and Backend Separately

### Frontend to Netlify/Vercel
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify or Vercel
3. Update API URLs in your frontend to point to your deployed backend

### Backend to Railway/Render
1. Create a `package.json` with your server dependencies
2. Deploy to Railway, Render, or Heroku
3. Set environment variables on the platform

## Environment Variables Needed:
- `GEMINI_API_KEY`: For AI functionality
- `SUPABASE_URL`: Database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Backend database access
- `VITE_SUPABASE_PROJECT_ID`: Frontend database connection
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Frontend database access
- `VITE_SUPABASE_URL`: Frontend database connection

## Post-Deployment:
1. Update CORS settings if needed
2. Test all functionality
3. Update any hardcoded localhost URLs
