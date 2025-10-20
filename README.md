# Checks Dashboard

A modern Progressive Web App (PWA) for managing your payments and checks, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✅ **Check Management**: Create, edit, and delete checks
- 📊 **Dashboard Analytics**: View statistics by currency and status
- 🔍 **Advanced Filtering**: Filter by today, overdue, upcoming, completed, or removed checks
- 💰 **Multi-Currency Support**: Support for USD, JOD, and ILS
- 🎯 **Priority System**: Set priority levels (low, medium, high) for checks
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔥 **Real-time Updates**: Powered by Firebase Firestore
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS
- 📲 **PWA Support**: Install as a native app on your device
- 🔄 **Offline Functionality**: Works offline with service worker caching
- 🚀 **Fast Loading**: Optimized performance with caching strategies

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **State Management**: React Hooks
- **PWA**: Service Worker, Web App Manifest
- **Image Processing**: Sharp (for icon generation)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd checksDashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Copy your Firebase config to `src/services/firebase.ts`

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Install as PWA** (Optional):
   - On mobile: Use "Add to Home Screen" from your browser menu
   - On desktop: Look for the install prompt or use browser's install option
   - The app will work offline after installation

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with PWA meta tags
│   └── page.tsx           # Main dashboard page
├── public/                # Static assets
│   ├── icons/            # PWA icons in various sizes
│   ├── manifest.json     # Web app manifest
│   ├── sw.js            # Service worker
│   └── icon.svg         # Source icon for generation
├── scripts/              # Build scripts
│   └── generate-icons.js # Icon generation script
├── src/
│   ├── components/       # React components
│   │   ├── PWAInstallPrompt.tsx # PWA install prompt
│   │   ├── CheckCard.tsx  # Individual check card
│   │   └── ConfirmDialog.tsx # Confirmation modal
│   ├── constants/        # App constants
│   ├── services/         # Firebase services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── next.config.js       # Next.js configuration with PWA settings
└── tailwind.config.js   # Tailwind configuration
```

## Usage

### Adding a Check
1. Click the "+" button in the top-right corner
2. Fill in the check details:
   - Title (required)
   - Amount (required)
   - Payee (optional)
   - Currency (USD, JOD, or ILS)
   - Priority (low, medium, or high)
   - Due date
3. Click "Add Check"

### Managing Checks
- **Mark as Complete**: Click on a check card when viewing "Today" filter
- **Delete**: Click the trash icon on any unpaid check
- **Restore**: View "Removed" filter to restore deleted checks

### Filtering
Use the filter buttons to view:
- **All**: All checks
- **Today**: Checks due today
- **Overdue**: Past due checks
- **Upcoming**: Checks due within 7 days
- **Completed**: Paid checks
- **Removed**: Deleted checks

## PWA Features

This app is a Progressive Web App (PWA) with the following features:

### Installation
- **Mobile**: Use "Add to Home Screen" from your browser menu
- **Desktop**: Look for the install prompt or use browser's install option
- **Automatic Prompt**: The app will show an install prompt when appropriate

### Offline Functionality
- **Service Worker**: Caches resources for offline use
- **Offline Access**: View previously loaded checks when offline
- **Background Sync**: Syncs data when connection is restored

### App-like Experience
- **Standalone Mode**: Runs without browser UI when installed
- **Custom Icons**: Beautiful app icons for all platforms
- **Splash Screen**: Native-like loading experience
- **Push Notifications**: Ready for future notification features

### Performance
- **Fast Loading**: Optimized caching strategies
- **Reduced Data Usage**: Efficient resource caching
- **Background Updates**: Updates content in the background

## Firebase Configuration

The app uses Firebase Firestore for data persistence. Make sure to:

1. Create a Firebase project
2. Enable Firestore Database
3. Update the Firebase config in `src/services/firebase.ts`
4. Set up appropriate Firestore security rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.