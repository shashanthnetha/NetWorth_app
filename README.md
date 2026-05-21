# 📈 NetWorth — Financial Life Tycoon Simulator

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Capacitor JS](https://img.shields.io/badge/Capacitor-8.3-cyan?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)
[![Zustand State](https://img.shields.io/badge/Zustand-5.0-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android-green?style=for-the-badge&logo=android)](https://developer.android.com/)

**NetWorth** is a premium, highly addictive financial life simulator and tycoon game. Designed with a sleek, futuristic dark glassmorphism dashboard, players begin as an entry-level delivery driver with ₹5,000 in cash and must strategize their way to becoming a billionaire. 

The game combines **behavioral psychology, progression-heavy mechanics, and complex financial engines** to deliver a satisfying, dopamine-rich simulator where cash flow, credit, investments, businesses, and life stats collide in a monthly simulation loop.

---

## 🎨 Design System & Aesthetics

NetWorth features a state-of-the-art **Glassmorphism Design System** designed to feel like a high-end Bloomberg Terminal merged with a modern gaming console:
- **Visual Theme**: Deep Matte Black background (`#0D0D0D`) layered with semi-transparent card panels, soft borders, and vivid neon accent glows (Neon Green for wealth building, Electric Blue for analytics, Gold for VIP/Elite, and Crimson Red for losses).
- **Fluid UI**: Monospace numerical typography (`IBM Plex Mono`) for clean aligning, custom animations, micro-interactions for button presses, and real-time interactive financial charts built with `Recharts`.
- **Dopamine Loops**: Satisfying counting transitions (`AnimatedNumber`), sound triggers, interactive progress meters, and glowing milestone banners.

---

## 🕹️ Core Simulation Engines (15+ Subsystems)

NetWorth is driven by a series of interconnected mathematical engines that update in a **monthly tick-based cycle**:

### 1. 💼 Career & Skill Progression
- **Tiered Occupations**: Climb from Entry-Level (Delivery Driver, Waiter) through Mid-Level (Software Engineer, Marketing Manager) up to High-Income tracks (CTO, VP, Day Trader, Startup Founder).
- **Skill Training**: Level up skills across 7 areas (Technical, Business, Communication, Leadership, Finance, Marketing, Analytics) using study and education systems.
- **Negotiations & Promos**: Negotiate salary raises or secure promotions based on job tenure, skill requirements, and credit checks. Keep stress in check to avoid forced burnout breaks.

### 2. 🎓 Education & Certifications
- Buy courses (Google/AWS certs, Soft Skills) or enroll in premium degrees (Bachelor's, MBA, AI Masters) that dynamically unlock career tiers, grant permanent salary multipliers, and boost skill ratings.

### 3. 📉 Dynamic Stock Market
- Real-time simulation of 10 distinct corporations representing major sectors (Tech, EV, Energy, Biotech, Green Energy, Aerospace).
- **Market Cycles**: Tracks macro trends (`bull`, `bear`, `neutral`) with monthly price histories, volatility indexes, and dividend yields paid directly to your cash reserves.
- **Advanced Orders**: Set **Limit Buy**, **Limit Sell**, and **Stop-Loss** triggers that execute automatically when the market moves.

### 4. 📊 Mutual Funds & SIPs
- Invest in 5 classes of Mutual Funds (Large Cap, Mid Cap, Small Cap, Index Funds, and ELSS Tax Savers).
- Automate wealth building with **Systematic Investment Plans (SIP)**, auto-deducting fixed monthly amounts to accumulate fund units.

### 5. 🌾 Forex & Commodity Trading
- **Forex**: Trade major currency pairs (`USD/INR`, `EUR/INR`, `GBP/INR`, `JPY/INR`) with leverage parameters (10x-50x), broker margins, and long/short options.
- **Commodities**: Trade Physical Gold, Digital Gold, Sovereign Gold Bonds (SGB with yields), and Silver, tracking daily spot prices.

### 6. 🚀 Venture Startup Capitalist
- Launch an AI, Fintech, or Healthtech startup. Track MVP releases, Series A/B funding rounds, runway cash management, dilution percentages, employee headcount, product quality, and valuation multiples.
- Exit your company through a massive acquisition or file for an IPO.

### 7. 🏪 Business Tycoon Empire
- Build and operate cash-flowing enterprises: Tea Stalls, Coffee Shops, Freelance Agencies, Fitness Studios, or Retail Networks.
- Hire managers, launch marketing campaigns, install business upgrades, and optimize margins. Reinvest profits or sell the entire business at 10-20x profit valuations.

### 8. 🏢 Real Estate & Mortgages
- Rent or buy residences (1BHKs, Apartments, Commercial Spaces, Land Plots).
- Finance acquisitions with 30-year home mortgages. Deal with property taxes (0.5%), annual maintenance costs (1.0%), and dynamic appreciation trends.

### 9. 🪙 Crypto & Option Bets
- Trade volatile digital tokens (NetCoin, VoltToken, AI-Chain) with extreme shifts.
- Buy Calls & Puts options based on monthly VIX volatility metrics. Gain 10x payouts or lose the entire option premium.

### 10. 💳 Banking, Credit & Debt
- Manage credit cards with variable limits, interest rates, annual fees, and cashbacks.
- Pay off multiple loans (education, personal, business, home mortgages) or execute debt consolidations to secure lower interest EMIs.
- Maintain your Credit Score (500 to 900) by avoiding late payments.

### 11. 👨‍👩‍👧‍👦 Family, Love & Relationships
- Date, marry, sign prenuptial agreements, and throw weddings.
- Partner salaries pool into your household income. Raise children, choose their schooling/college tiers, and manage monthly child-raising expenses.

### 12. 🍷 Lifestyle & Social Status
- Purchase status symbols (Sports Cars, Luxury Watches, Designer Apparel) to boost your reputation and happiness metrics.
- Spend on monthly wellness memberships (Gym, Therapy, Dating apps) to optimize health and energy.

### 13. 🤝 Networking & Angel Syndicates
- Attend elite high-society events. Meet mentors, unlock exclusive angel investment deals, receive high-tier job invitations, and build corporate relationships.

### 14. 💸 progressive Taxation & Planning
- Pay progressive income taxes and capital gains tax.
- Practice tax optimization by investing in Section 80C/80D instruments (Public Provident Fund (PPF), National Pension Scheme (NPS), ELSS tax-saving mutual funds).

### 15. 🏆 Achievements, Goals & News
- **News Generator**: Macro events (earnings season, Fed rates, recessions, oil spikes) shape stock, commodity, and real estate pricing.
- **Goals & Seasons**: Complete custom objectives (Savings target, portfolio size) or play through seasonal events (Diwali booms, Union Budget announcements, IPO season) to unlock VIP Wealth Tokens.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand) (Immutable game loops, monthly calculations, and UI states)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & custom CSS-in-JS utility configurations
- **Animation**: [Framer Motion](https://www.framer.com/motion/) for micro-interactions and transitions
- **Charts**: [Recharts](https://recharts.org/) for real-time asset breakdowns & stock lines
- **Mobile Wrapper**: [Capacitor JS v8](https://capacitorjs.com/) for compile-to-native Android targets with Haptics and Local Notification plugins

---

## 📱 Mobile App Setup & Android Studio

NetWorth is fully set up as a native Android app wrapper using Capacitor. Follow these steps to build and compile the app inside Android Studio:

### Prerequisites
- Install [Node.js](https://nodejs.org/) (v18+ recommended)
- Install [Android Studio](https://developer.android.com/studio) and ensure you have the Android SDK command-line tools configured.

### Step 1: Install Dependencies
Clone the repository and install all npm libraries:
```bash
npm install
```

### Step 2: Next.js Static Export
Compile and export the frontend code to a static bundle (`out` directory):
```bash
npm run build
```
*(Next.js will generate static HTML, CSS, and JS assets in the `/out` directory, which is the web asset source for the Android wrapper).*

### Step 3: Sync Capacitor with Android Project
Copy the web build into the Android source code using Capacitor CLI:
```bash
npx cap sync android
```
*(This command syncs web assets from `/out` to the `/android` directory, updating plugins, manifest resources, and configurations).*

### Step 4: Open in Android Studio
Launch Android Studio and open the project:
```bash
npx cap open android
```
*(Alternatively, launch Android Studio, click **Open Project**, and navigate to the `/android` directory within the workspace).*

### Step 5: Run on Emulator/Device
In Android Studio:
1. Select your target device (Emulator or physically connected phone).
2. Click **Run (Green Play Button)**.
3. To generate a release APK or App Bundle, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 💻 Web Development Server

If you want to run the web simulator locally in your browser for testing:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
├── android/                 # Native Android Studio Project (Capacitor wrapper)
├── capacitor.config.ts      # Capacitor JS bridge configurations
├── next.config.ts           # Next.js configurations with static export settings
├── tailwind.config.ts       # Tailwind design system and CSS configuration
├── src/
│   ├── app/                 # Next.js app routes, globals, and initial layout
│   ├── components/
│   │   ├── game/            # Modal systems (New Game, Event notifications)
│   │   ├── layout/          # Dashboard framing (Bottom Navigation, Monthly Statements)
│   │   ├── screens/         # Tab Screen views (Dashboard, Career, Invest, Business, Finance, Profile)
│   │   └── ui/              # Glassmorphic atoms (Cards, progress bars, tickers, buttons)
│   ├── engine/              # Simulation engines
│   │   ├── gameStore.ts     # Core Zustand store & month-tick transaction loop
│   │   ├── marketEngine.ts  # Volatility, stock/crypto fluctuation calculations
│   │   ├── types.ts         # Strictly-typed game state structures
│   │   └── *Data.ts/System  # Sub-mechanic data stores (Tax, Startups, Seasons, Networking)
│   └── lib/                 # Tailwind visual helper utilities
```

---

## 💳 License
Distributed under the MIT License. See `LICENSE` for more information.
