# Twitter Clone

A full-featured Twitter clone built with Next.js, TypeScript, Tailwind CSS, and Prisma. This application replicates all the core features of Twitter with a modern, responsive design.

## Features

### 🔐 Authentication
- User registration and login
- Session management with NextAuth.js
- Protected routes and user sessions

### 🐦 Core Twitter Features
- **Tweet Creation**: Compose tweets with character count and validation
- **Tweet Feed**: Real-time timeline with all tweets
- **Interactions**: Like, retweet, and comment on tweets
- **User Profiles**: Complete user profiles with bio, location, website
- **Follow System**: Follow/unfollow users
- **Responsive Design**: Exact Twitter UI replication

### 📱 Pages & Navigation
- **Home Feed**: Personalized timeline
- **Explore**: Trending topics and discovery
- **Notifications**: Activity notifications
- **Messages**: Direct messaging interface
- **Profile Pages**: User profiles with tweets and stats
- **Authentication Pages**: Sign in and sign up

### 🎨 UI/UX
- Exact Twitter design replication
- Dark/light mode support
- Responsive layout for all devices
- Smooth animations and transitions
- Loading states and error handling

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: JSON file (simple, on-device storage)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twitterclone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npm run setup
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Commands

- **Initialize database**: `npm run db:init`
- **Reset database**: `npm run db:reset`
- **Backup database**: `npm run db:backup`
- **View database**: `npm run db:view` (requires jq)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── explore/           # Explore page
│   ├── messages/          # Messages page
│   ├── notifications/     # Notifications page
│   ├── profile/           # Profile pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── tweet/             # Tweet-related components
│   ├── ui/                # UI components
│   └── providers/         # Context providers
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## API Routes

- `POST /api/auth/register` - User registration
- `GET/POST /api/tweets` - Get/create tweets
- `POST /api/tweets/[id]/like` - Like/unlike tweets
- `POST /api/tweets/[id]/retweet` - Retweet/unretweet
- `GET/POST /api/tweets/[id]/comments` - Get/create comments
- `POST /api/users/[id]/follow` - Follow/unfollow users

## Features in Detail

### Tweet System
- Character limit (280 characters)
- Real-time character counter
- Tweet validation
- Image support (placeholder)
- Optimistic updates

### User Interactions
- Like/unlike with heart animation
- Retweet with count display
- Comment system
- Follow/unfollow functionality
- User profile viewing

### Responsive Design
- Mobile-first approach
- Tablet and desktop layouts
- Touch-friendly interactions
- Accessible navigation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes. Please respect Twitter's intellectual property and terms of service.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- Update `DATABASE_URL` for production database
- Set `NEXTAUTH_URL` to your domain
- Configure authentication providers if using OAuth

## Support

If you encounter any issues or have questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and TypeScript
