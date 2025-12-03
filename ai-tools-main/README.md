# Online Tools Platform

A modern, free online tools platform built with Next.js, React, and TypeScript. Perfect for developers, designers, and content creators who need quick access to web-based utilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black.svg)
![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🛠️ Tool Management
- **Category Organization** - Organize tools into customizable categories
- **Tool Cards** - Beautiful card-based tool display with icons and descriptions
- **Like & View Tracking** - Track tool popularity with likes and views
- **IP-based Like Prevention** - Prevent duplicate likes from the same IP
- **Security Checks** - Optional code security validation for tools
- **Drag & Sort** - Easy sorting of categories and tools
- **Search & Filter** - Quick tool discovery

### 🎨 User Interface
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Smooth Animations** - Polished user experience with Framer Motion
- **Dark Mode Ready** - Easy to implement dark mode support

### 🔐 Admin Panel
- **Secure Authentication** - Cookie-based admin authentication
- **Tool Management** - Create, edit, and delete tools
- **Category Management** - Organize and manage categories
- **Dashboard** - Overview of statistics and quick actions
- **Code Editor** - Built-in code editor for tool development

### 🚀 Performance
- **Server-Side Rendering** - Fast initial page loads with Next.js
- **Static Generation** - Optimized for performance
- **SQLite Database** - Lightweight and fast database
- **Efficient Queries** - Optimized database queries with Prisma

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd online-tools-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="your-32-character-encryption-key-here"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

**Important**: Generate a secure 32-character encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

4. **Initialize the database**
```bash
npm run db:push
npm run db:generate
```

5. **Create admin user**
```bash
node scripts/init-admin.js
```

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
online-tools-platform/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static files
├── scripts/
│   └── init-admin.js         # Admin initialization script
├── src/
│   ├── app/
│   │   ├── admin/            # Admin pages
│   │   │   ├── categories/   # Category management
│   │   │   ├── login/        # Admin login
│   │   │   ├── tools/        # Tool management
│   │   │   └── page.tsx      # Admin dashboard
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication
│   │   │   └── tools/        # Tool APIs
│   │   ├── tools/            # Public tool pages
│   │   │   ├── [slug]/       # Tool detail page
│   │   │   └── page.tsx      # Tools list page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ToolCard.tsx
│   └── lib/                  # Utility functions
│       ├── auth.ts           # Authentication utilities
│       ├── encryption.ts     # Encryption utilities
│       ├── prisma.ts         # Prisma client
│       ├── toolSecurity.ts   # Security checks
│       └── utils.ts          # General utilities
├── .env.example              # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database file path | Yes |
| `ENCRYPTION_KEY` | 32-character encryption key | Yes |
| `ADMIN_USERNAME` | Default admin username | Yes |
| `ADMIN_PASSWORD` | Default admin password | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name | No |
| `NEXT_PUBLIC_SITE_URL` | Site URL | No |

### Database

This project uses SQLite with Prisma ORM. To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update Prisma client

## 📝 Usage

### Admin Panel

1. Navigate to `/admin/login`
2. Login with your admin credentials
3. Access the dashboard at `/admin`

### Managing Categories

1. Go to `/admin/categories`
2. Click "Add Category" to create a new category
3. Enter category name, slug, icon (emoji), and sort order
4. Click "Save"

### Managing Tools

1. Go to `/admin/tools`
2. Click "Add Tool" to create a new tool
3. Fill in tool details:
   - Name
   - Slug (URL-friendly identifier)
   - Description
   - Icon (emoji)
   - Category
   - Code (HTML/CSS/JavaScript)
4. Click "Save"

### Creating Tools

Tools are created using HTML, CSS, and JavaScript. Example:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tool</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Tool</h1>
    <p>Tool content goes here...</p>
  </div>
  <script>
    // Your JavaScript code here
  </script>
</body>
</html>
```

## 🔒 Security

### Security Features

- **Password Hashing** - Admin passwords are hashed with bcrypt
- **Encryption** - Sensitive data encrypted with AES-256-GCM
- **Code Sandboxing** - Tools run in sandboxed iframes
- **Security Checks** - Optional code validation for dangerous patterns
- **IP-based Rate Limiting** - Prevent abuse with IP tracking
- **CSRF Protection** - Cookie-based authentication with SameSite

### Security Best Practices

1. **Change default credentials** immediately after installation
2. **Use a strong encryption key** (32+ characters)
3. **Enable HTTPS** in production
4. **Regular backups** of your database
5. **Keep dependencies updated** with `npm audit`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t online-tools-platform .

# Run container
docker run -p 3000:3000 online-tools-platform
```

### Traditional Hosting

1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (nginx/Apache)

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Adding New Features

1. Create new API routes in `src/app/api/`
2. Add new pages in `src/app/`
3. Create reusable components in `src/components/`
4. Add utility functions in `src/lib/`

## 📊 Database Schema

### Models

- **Admin** - Admin user accounts
- **ToolCategory** - Tool categories
- **Tool** - Individual tools
- **ToolLike** - Like records (IP-based)
- **SiteConfig** - Site configuration

See `prisma/schema.prisma` for full schema details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📧 Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for the developer community**
