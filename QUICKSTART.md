# Quick Start Guide - Amma Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Supabase account (for backend)

### Installation

1. **Clone and Install**
```bash
npm install
```

2. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

3. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app.

### Build for Production

```bash
npm run build
```

The production build will be created in the `docs/` directory.

### Deploy

```bash
npm run deploy
```

This will build and push to GitHub Pages automatically.

## 📁 Project Structure

```
├── docs/              # Production build output
│   ├── assets/        # Compiled JS/CSS
│   └── images/        # Optimized images
├── public/            # Static assets
│   └── images/        # Source images
├── src/               # Source code
│   ├── assets/        # Source assets (SVG, etc)
│   ├── components/    # Reusable UI components
│   ├── examples/      # Example components
│   ├── pages/         # Page components
│   └── utils/         # Utility functions
└── setup/             # Database and deployment guides
```

## 🔑 Key Features

- Google OAuth authentication
- Patient and Doctor profiles
- File upload and management
- Session management
- Secure database with RLS

## 📚 Additional Resources

- See `setup/guides/` for detailed setup instructions
- Check `setup/sql/` for database schemas
- Read `GITHUB_PAGES_CONFIG.md` for deployment details

## 🆘 Troubleshooting

### Blank page after deployment
- Check that GitHub Pages is set to deploy from `main` branch, `/docs` folder
- Verify CNAME file exists in `docs/` folder
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Login not working
- Verify Google OAuth credentials in `.env`
- Check Supabase connection settings
- Review browser console for errors

## 📞 Support

For issues, check the setup guides in the `setup/` directory.

