const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// ---------- Utility Functions ----------

/**
 * Box-Muller transform for Gaussian random numbers
 */
function randomGaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generate 90 days of realistic historical price data for a stock.
 * @param {number} basePrice - The starting base price
 * @param {number} baseVolume - The base daily volume
 * @returns {Object} - { historicalData, currentPrice, previousClose, dayHigh, dayLow, openPrice }
 */
function generateHistoricalData(basePrice, baseVolume) {
  const historicalData = [];
  let prevClose = basePrice;
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Open price: previous close with small random gap
    const gapPercent = (Math.random() - 0.5) * 0.01;
    const open = parseFloat((prevClose * (1 + gapPercent)).toFixed(2));

    // Close price: open with random walk
    const dailyReturn = randomGaussian() * 0.02;
    const close = parseFloat((open * (1 + dailyReturn)).toFixed(2));

    // High and Low
    const highExtra = Math.random() * 0.015;
    const lowExtra = Math.random() * 0.015;
    const high = parseFloat((Math.max(open, close) * (1 + highExtra)).toFixed(2));
    const low = parseFloat((Math.min(open, close) * (1 - lowExtra)).toFixed(2));

    // Volume with random variation (70% to 130% of base)
    const volume = Math.floor(baseVolume * (0.7 + Math.random() * 0.6));

    historicalData.push({
      date,
      open,
      high,
      low,
      close,
      volume,
    });

    prevClose = close;
  }

  const lastDay = historicalData[historicalData.length - 1];
  const secondLastDay = historicalData[historicalData.length - 2];

  return {
    historicalData,
    currentPrice: lastDay.close,
    previousClose: secondLastDay.close,
    dayHigh: lastDay.high,
    dayLow: lastDay.low,
    openPrice: lastDay.open,
    lastVolume: lastDay.volume,
  };
}

// ---------- Stock Definitions: All 50 Stocks ----------

const stockDefinitions = [
  // ==================== TECHNOLOGY (10) ====================
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    basePrice: 190,
    baseVolume: 55000000,
    sharesOutstanding: 15400000000,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories. It also provides AppleCare support and cloud services.',
    logo: 'https://logo.clearbit.com/apple.com',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    basePrice: 140,
    baseVolume: 25000000,
    sharesOutstanding: 12600000000,
    description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
    logo: 'https://logo.clearbit.com/abc.xyz',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    basePrice: 415,
    baseVolume: 22000000,
    sharesOutstanding: 7430000000,
    description: 'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates in Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
    logo: 'https://logo.clearbit.com/microsoft.com',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Technology',
    basePrice: 180,
    baseVolume: 45000000,
    sharesOutstanding: 10300000000,
    description: 'Amazon.com Inc. engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores. It operates through North America, International, and Amazon Web Services (AWS) segments.',
    logo: 'https://logo.clearbit.com/amazon.com',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Technology',
    basePrice: 480,
    baseVolume: 18000000,
    sharesOutstanding: 2560000000,
    description: 'Meta Platforms Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
    logo: 'https://logo.clearbit.com/meta.com',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    basePrice: 880,
    baseVolume: 40000000,
    sharesOutstanding: 24700000000,
    description: 'NVIDIA Corporation provides graphics and compute and networking solutions in the United States, Taiwan, China, Hong Kong, and internationally. The company operates in Graphics and Compute & Networking segments powering AI infrastructure.',
    logo: 'https://logo.clearbit.com/nvidia.com',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Technology',
    basePrice: 175,
    baseVolume: 95000000,
    sharesOutstanding: 3180000000,
    description: 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles and energy generation and storage systems in the United States, China, and internationally. It operates through Automotive and Energy Generation and Storage segments.',
    logo: 'https://logo.clearbit.com/tesla.com',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Technology',
    basePrice: 620,
    baseVolume: 8000000,
    sharesOutstanding: 432000000,
    description: 'Netflix Inc. provides entertainment services. It offers TV series, documentaries, feature films, and games across various genres and languages. The company has approximately 270 million paid memberships in over 190 countries.',
    logo: 'https://logo.clearbit.com/netflix.com',
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices Inc.',
    sector: 'Technology',
    basePrice: 160,
    baseVolume: 50000000,
    sharesOutstanding: 1620000000,
    description: 'Advanced Micro Devices Inc. operates as a semiconductor company worldwide. It offers x86 microprocessors and graphics processing units (GPUs) for data centers, client computing, gaming, and embedded applications.',
    logo: 'https://logo.clearbit.com/amd.com',
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    sector: 'Technology',
    basePrice: 265,
    baseVolume: 7000000,
    sharesOutstanding: 973000000,
    description: 'Salesforce Inc. provides customer relationship management (CRM) technology that brings companies and customers together worldwide. Its service includes sales, service, marketing, commerce, and platform and other cloud services.',
    logo: 'https://logo.clearbit.com/salesforce.com',
  },

  // ==================== HEALTHCARE (10) ====================
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    basePrice: 155,
    baseVolume: 7500000,
    sharesOutstanding: 2410000000,
    description: 'Johnson & Johnson researches and develops, manufactures, and sells various products in the healthcare field worldwide. The company operates through Innovative Medicine and MedTech segments.',
    logo: 'https://logo.clearbit.com/jnj.com',
  },
  {
    symbol: 'PFE',
    name: 'Pfizer Inc.',
    sector: 'Healthcare',
    basePrice: 28,
    baseVolume: 30000000,
    sharesOutstanding: 5630000000,
    description: 'Pfizer Inc. discovers, develops, manufactures, markets, distributes, and sells biopharmaceutical products worldwide. It offers medicines and vaccines in oncology, inflammation, immunology, and rare disease areas.',
    logo: 'https://logo.clearbit.com/pfizer.com',
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group Inc.',
    sector: 'Healthcare',
    basePrice: 520,
    baseVolume: 3500000,
    sharesOutstanding: 924000000,
    description: 'UnitedHealth Group Incorporated operates as a diversified healthcare company in the United States. It operates through UnitedHealthcare and Optum segments providing health care coverage and services.',
    logo: 'https://logo.clearbit.com/unitedhealthgroup.com',
  },
  {
    symbol: 'ABBV',
    name: 'AbbVie Inc.',
    sector: 'Healthcare',
    basePrice: 170,
    baseVolume: 6000000,
    sharesOutstanding: 1770000000,
    description: 'AbbVie Inc. discovers, develops, manufactures, and sells pharmaceuticals worldwide. The company offers products in immunology, oncology, neuroscience, eye care, and aesthetics portfolios.',
    logo: 'https://logo.clearbit.com/abbvie.com',
  },
  {
    symbol: 'MRK',
    name: 'Merck & Co. Inc.',
    sector: 'Healthcare',
    basePrice: 125,
    baseVolume: 9000000,
    sharesOutstanding: 2540000000,
    description: 'Merck & Co. Inc. operates as a healthcare company worldwide. It operates through Pharmaceutical and Animal Health segments. The company offers therapeutic and preventive agents to treat cardiovascular, type 2 diabetes, and other conditions.',
    logo: 'https://logo.clearbit.com/merck.com',
  },
  {
    symbol: 'TMO',
    name: 'Thermo Fisher Scientific Inc.',
    sector: 'Healthcare',
    basePrice: 570,
    baseVolume: 2000000,
    sharesOutstanding: 383000000,
    description: 'Thermo Fisher Scientific Inc. provides life sciences solutions, analytical instruments, specialty diagnostics, and laboratory products and biopharma services worldwide. It serves pharmaceutical, biotechnology, and healthcare companies.',
    logo: 'https://logo.clearbit.com/thermofisher.com',
  },
  {
    symbol: 'ABT',
    name: 'Abbott Laboratories',
    sector: 'Healthcare',
    basePrice: 110,
    baseVolume: 5500000,
    sharesOutstanding: 1720000000,
    description: 'Abbott Laboratories discovers, develops, manufactures, and sells healthcare products worldwide. It operates in Established Pharmaceutical, Diagnostic, Nutritional, and Medical Devices segments.',
    logo: 'https://logo.clearbit.com/abbott.com',
  },
  {
    symbol: 'DHR',
    name: 'Danaher Corporation',
    sector: 'Healthcare',
    basePrice: 255,
    baseVolume: 3000000,
    sharesOutstanding: 737000000,
    description: 'Danaher Corporation designs, manufactures, and markets professional, medical, industrial, and commercial products and services worldwide. It operates through Biotechnology, Life Sciences, and Diagnostics segments.',
    logo: 'https://logo.clearbit.com/danaher.com',
  },
  {
    symbol: 'BMY',
    name: 'Bristol-Myers Squibb Co.',
    sector: 'Healthcare',
    basePrice: 42,
    baseVolume: 15000000,
    sharesOutstanding: 2020000000,
    description: 'Bristol-Myers Squibb Company discovers, develops, licenses, manufactures, markets, distributes, and sells biopharmaceutical products worldwide. It offers products in hematology, oncology, cardiovascular, and immunology therapeutic areas.',
    logo: 'https://logo.clearbit.com/bms.com',
  },
  {
    symbol: 'LLY',
    name: 'Eli Lilly and Company',
    sector: 'Healthcare',
    basePrice: 780,
    baseVolume: 3500000,
    sharesOutstanding: 951000000,
    description: 'Eli Lilly and Company discovers, develops, and markets human pharmaceuticals worldwide. Its products include diabetes treatments like Mounjaro, oncology drugs, immunology treatments, and neuroscience products.',
    logo: 'https://logo.clearbit.com/lilly.com',
  },

  // ==================== FINANCE (10) ====================
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Finance',
    basePrice: 195,
    baseVolume: 10000000,
    sharesOutstanding: 2870000000,
    description: 'JPMorgan Chase & Co. operates as a financial services company worldwide. It operates through Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management segments.',
    logo: 'https://logo.clearbit.com/jpmorganchase.com',
  },
  {
    symbol: 'BAC',
    name: 'Bank of America Corp.',
    sector: 'Finance',
    basePrice: 37,
    baseVolume: 35000000,
    sharesOutstanding: 7950000000,
    description: 'Bank of America Corporation provides banking and financial products and services for individual consumers, small and middle-market businesses, institutional investors, large corporations, and governments worldwide.',
    logo: 'https://logo.clearbit.com/bankofamerica.com',
  },
  {
    symbol: 'GS',
    name: 'Goldman Sachs Group Inc.',
    sector: 'Finance',
    basePrice: 430,
    baseVolume: 2500000,
    sharesOutstanding: 334000000,
    description: 'The Goldman Sachs Group Inc. is a global investment banking, securities, and investment management firm. It provides financial services to corporations, financial institutions, governments, and individuals worldwide.',
    logo: 'https://logo.clearbit.com/goldmansachs.com',
  },
  {
    symbol: 'MS',
    name: 'Morgan Stanley',
    sector: 'Finance',
    basePrice: 95,
    baseVolume: 8000000,
    sharesOutstanding: 1620000000,
    description: 'Morgan Stanley is a global financial services firm providing investment banking, securities, wealth management, and investment management services. It operates through Institutional Securities, Wealth Management, and Investment Management segments.',
    logo: 'https://logo.clearbit.com/morganstanley.com',
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    sector: 'Finance',
    basePrice: 280,
    baseVolume: 7000000,
    sharesOutstanding: 2050000000,
    description: 'Visa Inc. operates as a payments technology company worldwide. It facilitates digital payments among consumers, merchants, financial institutions, and government entities through VisaNet, its transaction processing network.',
    logo: 'https://logo.clearbit.com/visa.com',
  },
  {
    symbol: 'MA',
    name: 'Mastercard Inc.',
    sector: 'Finance',
    basePrice: 460,
    baseVolume: 3500000,
    sharesOutstanding: 933000000,
    description: 'Mastercard Incorporated is a technology company that provides transaction processing and other payment-related products and services. It facilitates the processing of payment transactions including authorization, clearing, and settlement.',
    logo: 'https://logo.clearbit.com/mastercard.com',
  },
  {
    symbol: 'BRK.B',
    name: 'Berkshire Hathaway Inc.',
    sector: 'Finance',
    basePrice: 410,
    baseVolume: 4000000,
    sharesOutstanding: 1300000000,
    description: 'Berkshire Hathaway Inc. is a holding company owning subsidiaries engaged in insurance, freight rail transportation, energy generation, manufacturing, retailing, and services. It is led by Warren Buffett.',
    logo: 'https://logo.clearbit.com/berkshirehathaway.com',
  },
  {
    symbol: 'C',
    name: 'Citigroup Inc.',
    sector: 'Finance',
    basePrice: 58,
    baseVolume: 14000000,
    sharesOutstanding: 1900000000,
    description: 'Citigroup Inc. is a diversified financial services holding company that provides various financial products and services to consumers, corporations, governments, and institutions worldwide.',
    logo: 'https://logo.clearbit.com/citigroup.com',
  },
  {
    symbol: 'WFC',
    name: 'Wells Fargo & Co.',
    sector: 'Finance',
    basePrice: 58,
    baseVolume: 16000000,
    sharesOutstanding: 3750000000,
    description: 'Wells Fargo & Company is a diversified financial services company. It provides banking, investment, mortgage, and consumer and commercial finance products and services through its branches, ATMs, and digital platforms.',
    logo: 'https://logo.clearbit.com/wellsfargo.com',
  },
  {
    symbol: 'AXP',
    name: 'American Express Co.',
    sector: 'Finance',
    basePrice: 225,
    baseVolume: 3000000,
    sharesOutstanding: 720000000,
    description: 'American Express Company is an integrated payments company. It provides charge and credit payment card products, merchant acquisition and processing services, network services, and travel-related services worldwide.',
    logo: 'https://logo.clearbit.com/americanexpress.com',
  },

  // ==================== ENERGY (10) ====================
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corp.',
    sector: 'Energy',
    basePrice: 107,
    baseVolume: 16000000,
    sharesOutstanding: 4080000000,
    description: 'Exxon Mobil Corporation explores for and produces crude oil and natural gas in the United States and internationally. It also manufactures, trades, transports, and sells crude oil, natural gas, petroleum products, and petrochemicals.',
    logo: 'https://logo.clearbit.com/exxonmobil.com',
  },
  {
    symbol: 'CVX',
    name: 'Chevron Corp.',
    sector: 'Energy',
    basePrice: 155,
    baseVolume: 8000000,
    sharesOutstanding: 1880000000,
    description: 'Chevron Corporation is an integrated energy and chemicals company. It operates through Upstream and Downstream segments, engaging in oil and natural gas exploration, production, refining, marketing, and transportation.',
    logo: 'https://logo.clearbit.com/chevron.com',
  },
  {
    symbol: 'COP',
    name: 'ConocoPhillips',
    sector: 'Energy',
    basePrice: 115,
    baseVolume: 7000000,
    sharesOutstanding: 1200000000,
    description: 'ConocoPhillips explores for, produces, transports, and markets crude oil, bitumen, natural gas, liquefied natural gas, and natural gas liquids worldwide. It operates through six geographical segments.',
    logo: 'https://logo.clearbit.com/conocophillips.com',
  },
  {
    symbol: 'SLB',
    name: 'Schlumberger Ltd.',
    sector: 'Energy',
    basePrice: 48,
    baseVolume: 10000000,
    sharesOutstanding: 1430000000,
    description: 'Schlumberger Limited provides technology and services for the energy industry worldwide. It operates through Digital & Integration, Reservoir Performance, Well Construction, and Production Systems divisions.',
    logo: 'https://logo.clearbit.com/slb.com',
  },
  {
    symbol: 'EOG',
    name: 'EOG Resources Inc.',
    sector: 'Energy',
    basePrice: 125,
    baseVolume: 3500000,
    sharesOutstanding: 582000000,
    description: 'EOG Resources Inc. explores for, develops, produces, and markets crude oil and natural gas primarily in productive basins in the United States, the Republic of Trinidad and Tobago, and internationally.',
    logo: 'https://logo.clearbit.com/eogresources.com',
  },
  {
    symbol: 'MPC',
    name: 'Marathon Petroleum Corp.',
    sector: 'Energy',
    basePrice: 165,
    baseVolume: 4000000,
    sharesOutstanding: 393000000,
    description: 'Marathon Petroleum Corporation is an integrated downstream energy company. It operates the largest refining system in the United States, including 13 refineries, and an extensive marketing and transportation network.',
    logo: 'https://logo.clearbit.com/marathonpetroleum.com',
  },
  {
    symbol: 'PSX',
    name: 'Phillips 66',
    sector: 'Energy',
    basePrice: 140,
    baseVolume: 3000000,
    sharesOutstanding: 435000000,
    description: 'Phillips 66 operates as an energy manufacturing and logistics company. It operates through Midstream, Chemicals, Refining, and Marketing and Specialties segments in the United States and internationally.',
    logo: 'https://logo.clearbit.com/phillips66.com',
  },
  {
    symbol: 'VLO',
    name: 'Valero Energy Corp.',
    sector: 'Energy',
    basePrice: 145,
    baseVolume: 3500000,
    sharesOutstanding: 337000000,
    description: 'Valero Energy Corporation manufactures, markets, and sells transportation fuels and petrochemical products. It operates through Refining, Renewable Diesel, and Ethanol segments in the United States, Canada, and internationally.',
    logo: 'https://logo.clearbit.com/valero.com',
  },
  {
    symbol: 'OXY',
    name: 'Occidental Petroleum Corp.',
    sector: 'Energy',
    basePrice: 62,
    baseVolume: 12000000,
    sharesOutstanding: 890000000,
    description: 'Occidental Petroleum Corporation engages in the acquisition, exploration, and development of oil and gas properties in the United States, the Middle East, and North Africa. It operates through Oil and Gas, Chemical, and Midstream segments.',
    logo: 'https://logo.clearbit.com/oxy.com',
  },
  {
    symbol: 'HAL',
    name: 'Halliburton Co.',
    sector: 'Energy',
    basePrice: 35,
    baseVolume: 8000000,
    sharesOutstanding: 888000000,
    description: 'Halliburton Company provides products and services to the energy industry worldwide. It operates through Completion and Production and Drilling and Evaluation divisions, offering cementing, stimulation, and drilling services.',
    logo: 'https://logo.clearbit.com/halliburton.com',
  },

  // ==================== CONSUMER (10) ====================
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Consumer',
    basePrice: 165,
    baseVolume: 8000000,
    sharesOutstanding: 8040000000,
    description: 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide. It operates through Walmart U.S., Walmart International, and Sam\'s Club segments offering everyday low prices.',
    logo: 'https://logo.clearbit.com/walmart.com',
  },
  {
    symbol: 'KO',
    name: 'Coca-Cola Co.',
    sector: 'Consumer',
    basePrice: 62,
    baseVolume: 12000000,
    sharesOutstanding: 4320000000,
    description: 'The Coca-Cola Company manufactures, markets, and sells various nonalcoholic beverages worldwide. It offers sparkling soft drinks, water, enhanced water, sports drinks, juice, dairy, tea, coffee, and energy drinks.',
    logo: 'https://logo.clearbit.com/coca-cola.com',
  },
  {
    symbol: 'PEP',
    name: 'PepsiCo Inc.',
    sector: 'Consumer',
    basePrice: 175,
    baseVolume: 5000000,
    sharesOutstanding: 1380000000,
    description: 'PepsiCo Inc. manufactures, markets, distributes, and sells various beverages and convenient foods worldwide. It operates through Frito-Lay North America, Quaker Foods North America, PepsiCo Beverages, and international segments.',
    logo: 'https://logo.clearbit.com/pepsico.com',
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble Co.',
    sector: 'Consumer',
    basePrice: 165,
    baseVolume: 6000000,
    sharesOutstanding: 2360000000,
    description: 'The Procter & Gamble Company provides branded consumer packaged goods worldwide. It operates through Beauty, Grooming, Health Care, Fabric & Home Care, and Baby, Feminine & Family Care segments.',
    logo: 'https://logo.clearbit.com/pg.com',
  },
  {
    symbol: 'COST',
    name: 'Costco Wholesale Corp.',
    sector: 'Consumer',
    basePrice: 720,
    baseVolume: 2500000,
    sharesOutstanding: 443000000,
    description: 'Costco Wholesale Corporation operates membership warehouses in the United States, Puerto Rico, Canada, Mexico, Japan, and other countries. It offers branded and private-label products across a range of merchandise categories.',
    logo: 'https://logo.clearbit.com/costco.com',
  },
  {
    symbol: 'MCD',
    name: "McDonald's Corp.",
    sector: 'Consumer',
    basePrice: 265,
    baseVolume: 4000000,
    sharesOutstanding: 720000000,
    description: "McDonald's Corporation operates and franchises McDonald's restaurants in the United States and internationally. It is the world's largest restaurant chain by revenue, serving approximately 69 million customers daily.",
    logo: 'https://logo.clearbit.com/mcdonalds.com',
  },
  {
    symbol: 'NKE',
    name: 'Nike Inc.',
    sector: 'Consumer',
    basePrice: 95,
    baseVolume: 8000000,
    sharesOutstanding: 1500000000,
    description: 'NIKE Inc. designs, develops, markets, and sells athletic footwear, apparel, equipment, and accessories worldwide. It sells products through NIKE-owned retail stores, digital platforms, and independent distributors.',
    logo: 'https://logo.clearbit.com/nike.com',
  },
  {
    symbol: 'SBUX',
    name: 'Starbucks Corp.',
    sector: 'Consumer',
    basePrice: 78,
    baseVolume: 9000000,
    sharesOutstanding: 1140000000,
    description: 'Starbucks Corporation, together with its subsidiaries, operates as a roaster, marketer, and retailer of specialty coffee worldwide. It operates through North America, International, and Channel Development segments.',
    logo: 'https://logo.clearbit.com/starbucks.com',
  },
  {
    symbol: 'DIS',
    name: 'Walt Disney Co.',
    sector: 'Consumer',
    basePrice: 110,
    baseVolume: 11000000,
    sharesOutstanding: 1830000000,
    description: 'The Walt Disney Company operates as an entertainment company worldwide. It operates through Disney Entertainment, ESPN, and Disney Experiences segments including theme parks, streaming, and media networks.',
    logo: 'https://logo.clearbit.com/thewaltdisneycompany.com',
  },
  {
    symbol: 'HD',
    name: 'Home Depot Inc.',
    sector: 'Consumer',
    basePrice: 345,
    baseVolume: 4000000,
    sharesOutstanding: 997000000,
    description: 'The Home Depot Inc. operates as a home improvement retailer. It sells building materials, home improvement products, lawn and garden products, decor, and facilities maintenance products in the United States, Canada, and Mexico.',
    logo: 'https://logo.clearbit.com/homedepot.com',
  },
];

// ---------- Seed Function ----------

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.\n');

    // Clear all collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Stock.deleteMany({}),
      Transaction.deleteMany({}),
      Portfolio.deleteMany({}),
    ]);
    console.log('All collections cleared.\n');

    // ---------- Create Users ----------
    console.log('Creating users...');

    const adminUser = await User.create({
      name: 'TradeSphere Admin',
      email: 'admin@tradesphere.com',
      password: 'Admin@123',
      role: 'ADMIN',
      virtualBalance: 1000000,
    });
    console.log(`  ✓ Admin user created: ${adminUser.email}`);

    const demoUser = await User.create({
      name: 'Guduguntla Manikanta',
      email: 'manikanta@tradesphere.com',
      password: 'Manikanta123',
      role: 'USER',
      virtualBalance: 100000,
    });
    console.log(`  ✓ Demo user created: ${demoUser.email}\n`);

    // ---------- Create Stocks ----------
    console.log('Creating 50 stocks with 90 days of historical data...');

    const createdStocks = [];

    for (const def of stockDefinitions) {
      const {
        historicalData,
        currentPrice,
        previousClose,
        dayHigh,
        dayLow,
        openPrice,
        lastVolume,
      } = generateHistoricalData(def.basePrice, def.baseVolume);

      const marketCap = Math.floor(currentPrice * def.sharesOutstanding);

      const stock = await Stock.create({
        symbol: def.symbol,
        name: def.name,
        sector: def.sector,
        currentPrice,
        previousClose,
        dayHigh,
        dayLow,
        openPrice,
        volume: lastVolume,
        marketCap,
        description: def.description,
        logo: def.logo,
        historicalData,
        isActive: true,
      });

      createdStocks.push(stock);

      const change = (currentPrice - previousClose).toFixed(2);
      const changePct = (((currentPrice - previousClose) / previousClose) * 100).toFixed(2);
      console.log(
        `  ✓ ${def.symbol.padEnd(6)} | ${def.name.padEnd(35)} | $${currentPrice.toFixed(2).padStart(8)} | ${changePct > 0 ? '+' : ''}${changePct}%`
      );
    }

    console.log(`\n  Total stocks created: ${createdStocks.length}`);

    // Sector summary
    const sectorCounts = {};
    for (const s of createdStocks) {
      sectorCounts[s.sector] = (sectorCounts[s.sector] || 0) + 1;
    }
    console.log('\n  Stocks by sector:');
    for (const [sector, count] of Object.entries(sectorCounts)) {
      console.log(`    ${sector}: ${count}`);
    }

    // ---------- Create Portfolios ----------
    console.log('\nCreating empty portfolios...');

    await Portfolio.create({
      user: adminUser._id,
      holdings: [],
      totalInvested: 0,
    });
    console.log(`  ✓ Portfolio created for Admin`);

    await Portfolio.create({
      user: demoUser._id,
      holdings: [],
      totalInvested: 0,
    });
    console.log(`  ✓ Portfolio created for John Trader`);

    // ---------- Summary ----------
    console.log('\n========================================');
    console.log('  SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log(`  Users:        2`);
    console.log(`  Stocks:       ${createdStocks.length}`);
    console.log(`  Sectors:      ${Object.keys(sectorCounts).length}`);
    console.log(`  Transactions: 0`);
    console.log('========================================');
    console.log('\n  Login Credentials:');
    console.log('  Admin:  admin@tradesphere.com / Admin@123');
    console.log('  User:   manikanta@tradesphere.com / Manikanta123');
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Seed complete.');
    process.exit(0);
  } catch (error) {
    console.error('\nSeed Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
