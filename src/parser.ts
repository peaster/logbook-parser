import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { LogbookData, Aircraft, FlightEntry, AirportInfo } from './types';

/**
* Parse the ForeFlight CSV file containing both Aircraft and Flights tables
*/
export async function parseForeflight(csvPath: string): Promise<LogbookData> {
  try {
    // Read the file from the filesystem
    const filePath = path.join(process.cwd(), 'public', csvPath.replace(/^\//, ''));
    console.log('Reading logbook from:', filePath);
    const csvText = await fs.readFile(filePath, 'utf-8');
    // Split the CSV into lines
    const lines = csvText.split('\n');
    // Find the Aircraft table header
    let aircraftHeaderIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('AircraftID,TypeCode,Year,Make,Model')) {
        aircraftHeaderIndex = i;
        break;
      }
    }
    if (aircraftHeaderIndex === -1) {
      throw new Error('Could not find Aircraft table header in ForeFlight export');
    }
    // Find the Flights table header
    let flightsHeaderIndex = -1;
    for (let i = aircraftHeaderIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('Date,AircraftID,From,To,Route')) {
        flightsHeaderIndex = i;
        break;
      }
    }
    if (flightsHeaderIndex === -1) {
      throw new Error('Could not find Flights table header in ForeFlight export');
    }
    console.log(`Found Aircraft table at line ${aircraftHeaderIndex} and Flights table at line ${flightsHeaderIndex}`);
    // Parse Aircraft table
    const aircraft: Aircraft[] = [];
    for (let i = aircraftHeaderIndex + 1; i < flightsHeaderIndex; i++) {
      if (!lines[i].trim() || lines[i].includes('ForeFlight Logbook Import')) continue;
      const values = parseCSVLine(lines[i]);
      if (values.length < 13) continue; // Skip invalid lines
      aircraft.push({
        aircraftId: values[0],
        typeCode: values[1],
        year: values[2],
        make: values[3],
        model: values[4],
        gearType: values[5],
        engineType: values[6],
        equipType: values[7],
        aircraftClass: values[8],
        complexAircraft: values[9],
        taa: values[10],
        highPerformance: values[11],
        pressurized: values[12],
      });
    }
    // Parse Flights table
    const flights: FlightEntry[] = [];
    for (let i = flightsHeaderIndex + 1; i < lines.length; i++) {
      if (!lines[i].trim() || lines[i].includes('ForeFlight Logbook Import')) continue;
      const values = parseCSVLine(lines[i]);
      if (values.length < 30) continue; // Skip invalid lines
      // Get the column indices from the header
      const headers = parseCSVLine(lines[flightsHeaderIndex]);
      const getColumnIndex = (name: string) => headers.indexOf(name);
      // Define column indices
      const dateIdx = getColumnIndex('Date');
      const aircraftIdIdx = getColumnIndex('AircraftID');
      const fromIdx = getColumnIndex('From');
      const toIdx = getColumnIndex('To');
      const routeIdx = getColumnIndex('Route');
      const timeOutIdx = getColumnIndex('TimeOut');
      const timeOffIdx = getColumnIndex('TimeOff');
      const timeOnIdx = getColumnIndex('TimeOn');
      const timeInIdx = getColumnIndex('TimeIn');
      const totalTimeIdx = getColumnIndex('TotalTime');
      const picIdx = getColumnIndex('PIC');
      const sicIdx = getColumnIndex('SIC');
      const nightIdx = getColumnIndex('Night');
      const soloIdx = getColumnIndex('Solo');
      const crossCountryIdx = getColumnIndex('CrossCountry');
      const ifrIdx = getColumnIndex('IFR');
      const actualInstrumentIdx = getColumnIndex('ActualInstrument');
      const simulatedInstrumentIdx = getColumnIndex('SimulatedInstrument');
      const approach1Idx = getColumnIndex('Approach1');
      const approach2Idx = getColumnIndex('Approach2');
      const approach3Idx = getColumnIndex('Approach3');
      const approach4Idx = getColumnIndex('Approach4');
      const approach5Idx = getColumnIndex('Approach5');
      const approach6Idx = getColumnIndex('Approach6');
      const dayLandingsIdx = getColumnIndex('DayLandingsFullStop');
      const nightLandingsIdx = getColumnIndex('NightLandingsFullStop');
      const allLandingsIdx = getColumnIndex('AllLandings');
      const dualReceivedIdx = getColumnIndex('DualReceived');
      const dualGivenIdx = getColumnIndex('DualGiven');
      const pilotCommentsIdx = getColumnIndex('PilotComments');
      const instructorCommentsIdx = getColumnIndex('InstructorComments');
      const flightReviewIdx = getColumnIndex('Flight Review (FAA)');
      const ipcIdx = getColumnIndex('IPC (FAA)');
      const checkrideIdx = getColumnIndex('Checkride (FAA)');
      // Get approaches (if any)
      const approaches = [];
      if (approach1Idx !== -1 && values[approach1Idx]) approaches.push(values[approach1Idx]);
      if (approach2Idx !== -1 && values[approach2Idx]) approaches.push(values[approach2Idx]);
      if (approach3Idx !== -1 && values[approach3Idx]) approaches.push(values[approach3Idx]);
      if (approach4Idx !== -1 && values[approach4Idx]) approaches.push(values[approach4Idx]);
      if (approach5Idx !== -1 && values[approach5Idx]) approaches.push(values[approach5Idx]);
      if (approach6Idx !== -1 && values[approach6Idx]) approaches.push(values[approach6Idx]);
      flights.push({
        date: values[dateIdx],
        aircraftId: values[aircraftIdIdx],
        from: values[fromIdx],
        to: values[toIdx],
        route: values[routeIdx],
        timeOut: values[timeOutIdx],
        timeOff: values[timeOffIdx],
        timeOn: values[timeOnIdx],
        timeIn: values[timeInIdx],
        totalTime: parseFloat(values[totalTimeIdx]) || 0,
        pic: parseFloat(values[picIdx]) || 0,
        sic: parseFloat(values[sicIdx]) || 0,
        night: parseFloat(values[nightIdx]) || 0,
        solo: parseFloat(values[soloIdx]) || 0,
        crossCountry: parseFloat(values[crossCountryIdx]) || 0,
        ifr: parseFloat(values[ifrIdx]) || 0,
        actualInstrument: parseFloat(values[actualInstrumentIdx]) || 0,
        simulatedInstrument: parseFloat(values[simulatedInstrumentIdx]) || 0,
        approaches,
        dayLandings: parseInt(values[dayLandingsIdx]) || 0,
        nightLandings: parseInt(values[nightLandingsIdx]) || 0,
        allLandings: parseInt(values[allLandingsIdx]) || 0,
        dualReceived: parseFloat(values[dualReceivedIdx]) || 0,
        dualGiven: parseFloat(values[dualGivenIdx]) || 0,
        pilotComments: values[pilotCommentsIdx] || '',
        instructorComments: values[instructorCommentsIdx] || '',
        flightReview: values[flightReviewIdx] || '',
        ipc: values[ipcIdx] || '',
        checkride: values[checkrideIdx] || '',
      });
    }
    console.log(`Parsed ${aircraft.length} aircraft and ${flights.length} flights`);
    return { aircraft, flights };
  } catch (error) {
    console.error('Error parsing ForeFlight logbook:', error);
    return { aircraft: [], flights: [] };
  }
}

/**
* Parse a CSV line handling quoted fields correctly
*/
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current); // Add the last field
  return result;
}

/**
 * Load airport data from CSV file
 */
export async function loadAirportData(): Promise<Record<string, AirportInfo>> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'airport-codes.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as AirportInfo[];
    
    // Create a lookup map with ident as key
    const airportMap: Record<string, AirportInfo> = {};
    for (const record of records) {
      airportMap[record.ident] = record;
    }
    
    return airportMap;
  } catch (error) {
    console.error('Error loading airport data:', error);
    return {};
  }
}

/**
 * Format airport display text
 */
export function formatAirportDisplay(identifier: string, info: AirportInfo | undefined): string {
  if (!info || !info.name) return identifier;
  
  if (info.municipality && info.iso_region) {
    // Extract state/province from iso_region (format: "US-VA")
    const state = info.iso_region.split('-')[1];
    return `${info.name} in ${info.municipality}, ${state} (${identifier})`;
  } else if (info.municipality) {
    return `${info.name} in ${info.municipality} (${identifier})`;
  } else {
    return `${info.name} (${identifier})`;
  }
}

/**
 * Format flight route description with airport names
 */
export function formatRouteDescription(
  from: string, 
  to: string, 
  airports: Record<string, AirportInfo>
): string {
  if (from === to) {
    return `during a local flight at ${formatAirportDisplay(from, airports[from])}`;
  }
  
  return `during flight from ${formatAirportDisplay(from, airports[from])} to ${formatAirportDisplay(to, airports[to])}`;
}