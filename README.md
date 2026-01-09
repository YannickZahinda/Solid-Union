# SolidUnion

A modern web application built with React and Vite, powered by Supabase for backend services. SolidUnion provides a robust foundation for scalable web applications with real-time capabilities and a polished UI.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Git for version control
- A Supabase account (for backend services)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YannickZahinda/SolidUnion.git
cd SolidUnion

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env file with your Supabase credentials

# 4. Start the development server
npm run dev

# 5. Open your browser and navigate to:
# http://localhost:5173
```

## 🏗️ Project Structure

```
SolidUnion/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Application pages/routes
│   ├── lib/           # Utilities and configurations
│   ├── styles/        # Global styles and Tailwind config
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── index.html         # Main HTML file
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **Routing**: React Router
- **State Management**: React Hooks & Context
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 📁 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint

# Run TypeScript type checking
npm run type-check
```

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from Project Settings → API
3. Update the `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your database schema using the Supabase dashboard or migrations

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# 1. Push your code to GitHub
git push origin main

# 2. Import your repository in Vercel (https://vercel.com)
# 3. Add your environment variables in Vercel project settings
# 4. Deploy!
```

### Build and Deploy
```bash
# Build the project
npm run build

# The built files will be in the 'dist' directory
```

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "react-router-dom": "^6.20.0",
    "tailwindcss": "^3.3.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.47.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author
**Yannick Zahinda**
- GitHub: [@YannickZahinda](https://github.com/YannickZahinda)
- Project: [SolidUnion](https://github.com/YannickZahinda/SolidUnion)

## 🙏 Acknowledgments
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Supabase](https://supabase.com/) for the open-source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support
For support, email yannickzahinda@example.com or open an issue in the GitHub repository.

---

*Built with ❤️ using modern web technologies*