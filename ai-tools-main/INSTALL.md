# Installation Guide

This guide will walk you through the complete installation process for the Online Tools Platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning the repository)

## Step-by-Step Installation

### 1. Get the Code

**Option A: Clone from Git**
```bash
git clone <your-repository-url>
cd online-tools-platform
```

**Option B: Download ZIP**
- Download and extract the ZIP file
- Navigate to the extracted folder

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Prisma
- Tailwind CSS
- And other dependencies

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# Encryption Key (IMPORTANT: Generate a secure key!)
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# Admin Credentials (Change these!)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Site Configuration
NEXT_PUBLIC_SITE_NAME="Online Tools Platform"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Generate a secure encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Initialize the Database

```bash
# Push the database schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 5. Create Admin User

```bash
node scripts/init-admin.js
```

This will create an admin user with the credentials from your `.env` file.

### 6. (Optional) Seed Sample Data

```bash
node scripts/seed-sample-data.js
```

This will create:
- 5 sample categories
- 1 sample tool (Character Counter)

### 7. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 8. First Login

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials (default: admin/admin123)
3. **IMPORTANT**: Change your password immediately!

## Verification

After installation, verify everything is working:

1. **Home Page**: Visit `http://localhost:3000` - should show the landing page
2. **Tools Page**: Visit `http://localhost:3000/tools` - should show tools list
3. **Admin Login**: Visit `http://localhost:3000/admin/login` - should show login form
4. **Admin Dashboard**: After login, should show dashboard with stats

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it:

```bash
PORT=3001 npm run dev
```

### Database Errors

If you encounter database errors:

```bash
# Delete the database and start fresh
rm prisma/dev.db
npm run db:push
node scripts/init-admin.js
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Prisma Client Errors

```bash
# Regenerate Prisma client
npm run db:generate
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Update your `.env` file for production:

```env
DATABASE_URL="file:./production.db"
ENCRYPTION_KEY="<secure-32-character-key>"
ADMIN_USERNAME="<your-username>"
ADMIN_PASSWORD="<strong-password>"
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use a strong encryption key (32+ characters)
- [ ] Enable HTTPS
- [ ] Set secure cookie settings
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

## Next Steps

1. **Customize the Site**
   - Update site name and branding
   - Customize colors in `tailwind.config.js`
   - Add your logo

2. **Add Categories**
   - Go to `/admin/categories`
   - Create categories for your tools

3. **Add Tools**
   - Go to `/admin/tools`
   - Create your first tool

4. **Configure SEO**
   - Update metadata in `src/app/layout.tsx`
   - Add Open Graph images
   - Create sitemap

## Support

If you encounter any issues:

1. Check the [README.md](README.md) for common solutions
2. Review the [troubleshooting section](#troubleshooting)
3. Open an issue on GitHub

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Congratulations! Your Online Tools Platform is now installed and ready to use!** 🎉
