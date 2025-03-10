# pilot-logbook-parser

[![npm version](https://img.shields.io/npm/v/pilot-logbook-parser.svg)](https://www.npmjs.com/package/pilot-logbook-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A TypeScript library for parsing, analyzing, and managing pilot logbook data from ForeFlight exports.

![Pilot Logbook](https://images.unsplash.com/photo-1559083991-9bdef0d244e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

## Features

- Parse ForeFlight CSV logbook exports
- Calculate comprehensive flight statistics and summaries
- Track pilot currency status (passenger, night, instrument)
- Detect pilot certifications and ratings
- Identify significant career milestones
- Export logbook data to different formats (JSON, CSV)
- Detailed aircraft and airport information

## Installation

```bash
npm install pilot-logbook-parser
```
or
```bash
yarn add pilot-logbook-parser
```

## Requirements
This library requires: 

     Node.js 14.x or higher
     The csv-parse package (automatically installed as a dependency)

## Usage
### Basic Usage
```typescript
import { parseForeflight, calculateLogbookSummary } from 'pilot-logbook-parser';

// Parse a ForeFlight logbook export
const logbookData = await parseForeflight('path/to/foreflight-export.csv');

// Calculate summary statistics
const summary = calculateLogbookSummary(logbookData);

console.log(`Total flight hours: ${summary.totalHours}`);
console.log(`PIC hours: ${summary.picHours}`);
console.log(`Unique aircraft flown: ${summary.uniqueAircraftCount}`);
console.log(`Unique airports visited: ${summary.uniqueAirports.length}`);
```
### FAA Pilot Currency Information
```typescript
import { parseForeflight, getCurrencyInfo } from 'pilot-logbook-parser';

const logbookData = await parseForeflight('path/to/foreflight-export.csv');
const currency = getCurrencyInfo(logbookData);

console.log(`Passenger currency: ${currency.passengerCurrency ? 'Current' : 'Not Current'}`);
console.log(`Night currency: ${currency.nightCurrency ? 'Current' : 'Not Current'}`);
console.log(`Instrument currency: ${currency.instrumentCurrency ? 'Current' : 'Not Current'}`);
console.log(`Last flight review: ${currency.lastBiennial}`);
```

### Certifications and Milestones
```typescript
import { 
  parseForeflight, 
  calculateLogbookSummary,
  detectCertifications,
  detectMilestones
} from 'pilot-logbook-parser';

const logbookData = await parseForeflight('path/to/foreflight-export.csv');
const summary = calculateLogbookSummary(logbookData);

// Get certifications
const certifications = detectCertifications(logbookData);
console.log('Certifications:', certifications);

// Get career milestones
const milestones = await detectMilestones(logbookData, summary);
console.log('Milestones:', milestones);
```

### Exporting Data
```typescript
import { parseForeflight, exportLogbook } from 'pilot-logbook-parser';

const logbookData = await parseForeflight('path/to/foreflight-export.csv');

// Export to JSON
await exportLogbook(logbookData, 'json', 'output/logbook.json');

// Export to CSV
await exportLogbook(logbookData, 'csv', 'output/logbook.csv');
```

## Airport Data
For full functionality, including airport name resolution and route descriptions, you need to provide an airport database CSV file. The base implementation on this library uses a public dataset available at https://github.com/datasets/airport-codes, but you can use your own dataset if desired. This file should be placed at: 
 
```
/public/data/airport-codes.csv
```

The CSV should contain airport information with at least the following columns: 

     ident (airport identifier)
     name
     municipality
     iso_region
     type
     elevation_ft
     continent
     iso_country
     coordinates

## API Documentation
### Main Functions
`parseForeflight(csvPath: string): Promise<LogbookData>`
Parses a ForeFlight CSV export file and returns structured logbook data. 

`calculateLogbookSummary(data: LogbookData): LogbookSummary`
Calculates comprehensive statistics from logbook data. 

`detectCertifications(data: LogbookData): Certification[]`
Detects pilot certifications and ratings from logbook data. 

`detectMilestones(bookSummary): Promise<Milestone[]>`
Identifies significant career milestones from logbook data. 

`getRecentFlights(data: LogbookData, count?: number): FlightEntry[]`
Returns the most recent flights from the logbook. 

`getCurrencyInfo(data: LogbookData): CurrencyInfo`
Analyzes pilot currency status for passenger carrying, night flying, and instrument flying. 

`exportLogbook(data: LogbookData, format: 'json' | 'csv', outputPath: string): Promise<boolean>`
Exports logbook data to JSON or CSV format.

### Data Types
See the [TypeScript definitions](./src/types.ts) for detailed information about all data types used in the library.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. 

     Fork the repository
     Create your feature branch (git checkout -b feature/amazing-feature)
     Commit your changes (git commit -m 'Add some amazing feature')
     Push to the branch (git push origin feature/amazing-feature)
     Open a Pull Request
     
## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.