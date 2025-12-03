# Quick Start Guide

## 🎉 Your Online Tools Platform is Ready!

The project has been successfully initialized with sample data. Follow these steps to start using it.

## 🚀 Start the Development Server

```bash
cd /d/phpstudy_pro/WWW/online-tools-platform
npm run dev
```

The application will be available at: **http://localhost:3000**

## 🔑 Admin Access

### Login Credentials
- **URL**: http://localhost:3000/admin/login
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## 📦 What's Included

### Sample Data
✅ **5 Categories** created:
- 📝 Text Tools
- 🖼️ Image Tools
- 💻 Developer Tools
- 🔄 Converters
- ⚡ Generators

✅ **1 Sample Tool** created:
- 🔢 Character Counter (in Text Tools category)

### Pages Available
- **Home**: http://localhost:3000
- **Tools List**: http://localhost:3000/tools
- **Admin Dashboard**: http://localhost:3000/admin
- **Category Management**: http://localhost:3000/admin/categories
- **Tool Management**: http://localhost:3000/admin/tools

## 📝 Next Steps

### 1. Test the Application
```bash
# Visit the home page
http://localhost:3000

# Try the sample tool
http://localhost:3000/tools/character-counter

# Login to admin panel
http://localhost:3000/admin/login
```

### 2. Add Your First Tool

1. Login to admin panel
2. Go to "Manage Tools"
3. Click "Add Tool"
4. Fill in the details:
   - Name: Your tool name
   - Slug: url-friendly-name
   - Description: Brief description
   - Icon: 🛠️ (any emoji)
   - Category: Select from dropdown
   - Code: Your HTML/CSS/JavaScript code

### 3. Customize the Site

**Update Site Name**:
Edit `.env` file:
```env
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Customize Colors**:
Edit `tailwind.config.js` to change the primary color scheme.

**Update Branding**:
- Edit [src/components/Header.tsx](src/components/Header.tsx) for header
- Edit [src/components/Footer.tsx](src/components/Footer.tsx) for footer
- Edit [src/app/page.tsx](src/app/page.tsx) for home page content

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio

# Scripts
node scripts/init-admin.js        # Create admin user
node scripts/seed-sample-data.js  # Seed sample data
```

## 📚 Documentation

- [README.md](README.md) - Full project documentation
- [INSTALL.md](INSTALL.md) - Detailed installation guide

## 🎨 Tool Development Tips

### Basic Tool Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tool</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Tool</h1>
    <!-- Your tool UI here -->
  </div>
  <script>
    // Your JavaScript here
  </script>
</body>
</html>
```

### Security Notes
- Tools run in sandboxed iframes
- External scripts are blocked by default
- Use `skipSecurityCheck` only for trusted code

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update ENCRYPTION_KEY in .env
- [ ] Review and test all tools before publishing
- [ ] Enable HTTPS in production
- [ ] Set up regular database backups

## 🐛 Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm run dev
```

### Database Issues
```bash
rm prisma/dev.db
npm run db:push
node scripts/init-admin.js
node scripts/seed-sample-data.js
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

## 🎯 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
Update `.env`:
```env
DATABASE_URL="file:./production.db"
ENCRYPTION_KEY="<secure-32-character-key>"
ADMIN_USERNAME="<your-username>"
ADMIN_PASSWORD="<strong-password>"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 📞 Support

If you encounter any issues:
1. Check the [README.md](README.md)
2. Review the [INSTALL.md](INSTALL.md)
3. Check the console for error messages

---

**Happy Building! 🚀**
