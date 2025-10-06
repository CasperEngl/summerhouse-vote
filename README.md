# 🏠 Sommerhus Afstemning

A modern web application for voting on summer houses available for rent in Denmark. Users can register, vote on their favorite summer houses, and view real-time voting results.

## ✨ Features

- **User Registration**: Simple name-based registration with session management
- **Summer House Voting**: Browse and vote on beautiful Danish summer houses
- **Real-time Results**: View live voting results with vote counts
- **Vote Management**: Users can vote and unvote for multiple summer houses
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Session-based Authentication**: Cookie-based sessions for user management

## 🛠 Tech Stack

- **Runtime**: [Bun](https://bun.com) - Fast all-in-one JavaScript runtime
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sommerhus-vote
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Seed the database**
   ```bash
   bun run src/seed.ts
   ```

4. **Start the development server**
   ```bash
   bun dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📝 Usage

### For Users

1. **Register**: Enter your name to create a user account
2. **Browse Summer Houses**: View the available summer houses with images and booking links
3. **Vote**: Click the heart icon on summer houses you like
4. **View Results**: Switch to the "Resultater" tab to see voting results
5. **Manage Votes**: Click the heart icon again to remove your vote

### For Developers

#### Available Scripts

- `bun dev` - Start development server with hot reloading
- `bun start` - Start production server
- `bun run build.ts` - Build the project for production
- `bun run src/seed.ts` - Seed the database with sample summer houses

#### Project Structure

```
src/
├── api.ts                 # API client functions
├── app.tsx               # Main React application
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── SummerHouseCard.tsx
│   ├── SummerHousesList.tsx
│   ├── ResultsList.tsx
│   ├── UserForm.tsx
│   └── UserSection.tsx
├── database.ts          # Database schema and operations
├── frontend.tsx         # Frontend entry point
├── hooks/              # Custom React hooks
├── index.html          # HTML template
├── index.tsx           # Server entry point
├── queryClient.ts      # TanStack Query client
├── seed.ts            # Database seeding script
├── types.ts           # TypeScript type definitions
└── utils.ts           # Utility functions
```

#### Database Schema

The application uses three main tables:

- **users**: User accounts with session management
- **summer_houses**: Available summer houses with images and booking URLs
- **votes**: User votes linking users to summer houses

#### API Endpoints

- `POST /api/users` - Create or update user
- `GET /api/users` - Get current user
- `DELETE /api/users` - Logout user
- `GET /api/summer-houses` - Get all summer houses
- `POST /api/votes` - Cast a vote
- `DELETE /api/votes` - Remove a vote
- `GET /api/results` - Get voting results

## 🎨 Customization

### Adding Summer Houses

Edit `src/seed.ts` to add new summer houses:

```typescript
const newSummerHouse = {
  name: "Your Summer House Name",
  imageUrl: "https://example.com/image.jpg",
  bookingUrl: "https://booking-site.com/house"
};
```

Then run the seed script again.

### Styling

The app uses Tailwind CSS with shadcn/ui components. Customize styles in:
- `src/index.css` - Global styles
- Component files - Component-specific styles

## 🚀 Deployment

### Coolify Deployment

This application is configured for easy deployment on [Coolify](https://coolify.io/). Coolify is a self-hosted deployment platform that supports Docker Compose.

#### Prerequisites

- A Coolify instance set up and running
- Git repository accessible to Coolify

#### Deployment Steps

1. **Connect your repository** to Coolify
2. **Create a new service** and select "Docker Compose"
3. **Point to your repository** and specify the `docker-compose.yml` file
4. **Configure environment variables** (if needed):
   - `NODE_ENV=production`
5. **Deploy** - Coolify will automatically build and deploy the application

#### What happens during deployment

- **Multi-stage build**: Uses separate builder and runtime stages for optimal image size
- **Bun runtime**: Ensures the application runs on Bun's fast JavaScript runtime instead of Node.js
- **Database initialization**: Automatically runs migrations and seeds sample summer houses on first startup
- **Health checks**: Built-in health monitoring using Bun's native fetch
- **Port 3000**: Application serves on port 3000
- **Persistent storage**: SQLite database data is preserved using Docker volumes

#### Database Persistence

The SQLite database is stored in a Docker volume (`voting_data`), ensuring that your voting data persists between deployments and container restarts.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Summer house data and images sourced from Danish rental platforms
- Built with modern web technologies for optimal performance
- Danish language interface for local users
