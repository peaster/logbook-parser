// Types for Aircraft data
export type Aircraft = {
    aircraftId: string;
    typeCode: string;
    year: string;
    make: string;
    model: string;
    gearType: string;
    engineType: string;
    equipType: string;
    aircraftClass: string;
    complexAircraft: string;
    taa: string;
    highPerformance: string;
    pressurized: string;
  };
  
  // Types for Flight data
  export type FlightEntry = {
    date: string;
    aircraftId: string;
    from: string;
    to: string;
    route: string;
    timeOut: string;
    timeOff: string;
    timeOn: string;
    timeIn: string;
    totalTime: number;
    pic: number;
    sic: number;
    night: number;
    solo: number;
    crossCountry: number;
    ifr: number;
    actualInstrument: number;
    simulatedInstrument: number;
    approaches: string[];
    dayLandings: number;
    nightLandings: number;
    allLandings: number;
    dualReceived: number;
    dualGiven: number;
    pilotComments: string;
    instructorComments: string;
    flightReview: string;
    ipc: string;
    checkride: string;
  };
  
  // Combined logbook data
  export type LogbookData = {
    aircraft: Aircraft[];
    flights: FlightEntry[];
  };
  
  // Summary statistics
  export type LogbookSummary = {
    totalHours: number;
    picHours: number;
    sicHours: number;
    crossCountryHours: number;
    nightHours: number;
    instrumentHours: number; // actual + simulated
    actualInstrumentHours: number;
    simulatedInstrumentHours: number;
    totalLandings: number;
    dayLandings: number;
    nightLandings: number;
    uniqueAircraftCount: number;
    uniqueAirports: string[];
    firstFlightDate: string;
    lastFlightDate: string;
    yearsFlying: number;
    aircraftStats: {
      [aircraftId: string]: {
        make: string;
        model: string;
        type: string;
        hours: number;
        flights: number;
      };
    };
    typeStats: {
      [typeCode: string]: {
        hours: number;
        flights: number;
      };
    };
  };
  
  // Certification/Rating type
  export type Certification = {
    title: string;
    date: string;
    description?: string;
  };
  
  // Milestone type
  export type Milestone = {
    year: string;
    title: string;
    description: string;
  };
  
  // Currency information
  export type CurrencyInfo = {
    passengerCurrency: boolean;
    nightCurrency: boolean;
    instrumentCurrency: boolean;
    lastBiennial: string;
    lastIPC: string;
  };
  
  // Interface for airport information from CSV
  export interface AirportInfo {
    ident: string;
    type: string;
    name: string;
    elevation_ft: string;
    continent: string;
    iso_country: string;
    iso_region: string;
    municipality: string;
    icao_code: string;
    iata_code: string;
    gps_code: string;
    local_code: string;
    coordinates: string;
  }