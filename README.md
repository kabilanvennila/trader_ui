# Zone Trader Dashboard

A modern trading dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- **Real-time Metrics Display**: Running P&L, Max Profit, Max Loss
- **Portfolio Overview**: Deployed capital, Risk percentage, Buying Power
- **Strategy Table**: Detailed view of trading strategies with visual indicators
- **Modern UI**: Clean, professional design with responsive layout

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── Header.tsx         # Navigation header
│   ├── MetricsCard.tsx    # Reusable metrics card
│   └── StrategyTable.tsx  # Trading strategies table
├── App.tsx                # Root component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Dashboard Components

### Metrics Cards
- **Running Profit/Loss**: Highlighted green card showing current P&L
- **Max Profit**: Maximum profit achieved
- **Max Loss**: Maximum loss incurred
- **Deployed**: Capital deployed in trades
- **Risk**: Current risk percentage
- **Buying Power**: Available buying power

### Strategy Table
Displays trading strategies with:
- Date and time
- Index (Nifty/Bank Nifty)
- Strategy type (STTR - Side Target Range)
- Strike price
- Entry price
- Target with visual progress bar
- Stop loss
- Trail percentage
- P&L status

## Customization

The dashboard uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Layout in component files
- Data structure in `StrategyTable.tsx`

## License

MIT
