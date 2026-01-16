# Flight Search Website

A modern, Google Flights-inspired flight search application built with React, TypeScript, and Vite. Search and compare flights using the Amadeus API with real-time price tracking, filtering, and detailed flight information.

## Features

- ✈️ **Flight Search**: Search flights by origin, destination, and dates
- 📊 **Price Trends Graph**: Visualize price trends from departure to return date
- 🔍 **Advanced Filtering**: Filter by stops, price, airlines, and cabin class
- 👥 **Passenger Selection**: Support for adults and children (up to 9 total passengers)
- 🎨 **Dark/Light Mode**: Toggle between dark and light themes
- 🏳️ **Country Flags**: Visual airport codes with country flags
- 💼 **Baggage Information**: Display checked and carry-on baggage allowances
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Amadeus API** - Flight data

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Amadeus API credentials ([Get them here](https://developers.amadeus.com/my-apps))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/khizerrajpoot/Flight-search-website.git
cd Flight-search-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Amadeus API credentials
VITE_AMADEUS_CLIENT_ID=your_client_id_here
VITE_AMADEUS_CLIENT_SECRET=your_client_secret_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment to Netlify

### Step 1: Push to GitHub
Make sure your code is pushed to GitHub (already done if you're reading this).

### Step 2: Connect to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your `Flight-search-website` repository
4. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 3: Add Environment Variables
1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add variable"** and add:
   - **Key**: `VITE_AMADEUS_CLIENT_ID`
   - **Value**: Your Amadeus Client ID
3. Click **"Add variable"** again and add:
   - **Key**: `VITE_AMADEUS_CLIENT_SECRET`
   - **Value**: Your Amadeus Client Secret
4. Click **"Save"**

### Step 4: Deploy
1. Click **"Deploy site"**
2. Wait for the build to complete
3. Your site will be live at `https://your-site-name.netlify.app`

### Step 5: Redeploy After Adding Variables
If you added environment variables after the first deploy:
- Go to **Deploys** → **Trigger deploy** → **Deploy site**

## Usage

1. **Enter Flight Details**:
   - Origin airport code (3-letter IATA code, e.g., LHE, FRA)
   - Destination airport code
   - Departure date
   - Return date (optional)
   - Number of adults and children

2. **Search Flights**: Click "Search flights" to find available flights

3. **Filter Results**:
   - Filter by number of stops (nonstop, 1 stop, 2+ stops)
   - Adjust maximum price with the slider
   - Select specific airlines
   - Filter by cabin class (Economy, Premium Economy, Business, First)

4. **Sort Results**: Sort by price or flight time

5. **View Details**: Click on any flight to see detailed information including segments, pricing breakdown, and baggage allowance

6. **Price Trends**: View the price graph showing minimum prices for each date in your selected range

## Project Structure

```
Flight-search-website/
├── src/
│   ├── api/
│   │   └── amadeusClient.ts    # Amadeus API integration
│   ├── components/
│   │   ├── DateField.tsx       # Date picker component
│   │   ├── FlightDetails.tsx   # Flight details modal
│   │   ├── Footer.tsx          # Footer component
│   │   └── PriceGraph.tsx      # Price trends graph
│   ├── types/
│   │   └── flights.ts          # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── public/                     # Static assets
├── .env.example               # Environment variables template
├── netlify.toml               # Netlify deployment configuration
└── package.json               # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AMADEUS_CLIENT_ID` | Your Amadeus API Client ID | Yes |
| `VITE_AMADEUS_CLIENT_SECRET` | Your Amadeus API Client Secret | Yes |

## Security Note

⚠️ **Never commit your `.env` file to version control!** The `.env` file is already in `.gitignore` to protect your API credentials. Always use environment variables in your deployment platform (Netlify, Vercel, etc.).

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Amadeus for Developers](https://developers.amadeus.com/) for the flight data API
- Inspired by Google Flights UI/UX
