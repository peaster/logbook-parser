import { 
    LogbookData, 
    LogbookSummary, 
    Certification, 
    Milestone, 
    FlightEntry, 
    Aircraft 
  } from './types';
  import { loadAirportData, formatRouteDescription } from './parser';
  
  /**
  * Calculate summary statistics from the logbook data
  */
  export function calculateLogbookSummary(data: LogbookData): LogbookSummary {
    const { aircraft, flights } = data;
    // Create a map of aircraft ID to aircraft details for quick lookup
    const aircraftMap = new Map<string, Aircraft>();
    for (const plane of aircraft) {
      aircraftMap.set(plane.aircraftId, plane);
    }
    // Sort flights by date
    const sortedFlights = [...flights].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstFlightDate = sortedFlights.length > 0 ? sortedFlights[0].date : '';
    const lastFlightDate = sortedFlights.length > 0 ? sortedFlights[sortedFlights.length - 1].date : '';
    // Calculate years flying
    const yearsFlying = firstFlightDate && lastFlightDate ?
      Math.max(1, Math.ceil((new Date(lastFlightDate).getTime() - new Date(firstFlightDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365))) : 0;
    // Initialize aircraft stats
    const aircraftStats: LogbookSummary['aircraftStats'] = {};
    const typeStats: LogbookSummary['typeStats'] = {};
    // Track unique airports
    const uniqueAirports = new Set<string>();
    // Calculate totals
    let totalHours = 0;
    let picHours = 0;
    let sicHours = 0;
    let crossCountryHours = 0;
    let nightHours = 0;
    let actualInstrumentHours = 0;
    let simulatedInstrumentHours = 0;
    let totalLandings = 0;
    let dayLandings = 0;
    let nightLandings = 0;
    for (const flight of flights) {
      totalHours += flight.totalTime;
      picHours += flight.pic;
      sicHours += flight.sic;
      crossCountryHours += flight.crossCountry;
      nightHours += flight.night;
      actualInstrumentHours += flight.actualInstrument;
      simulatedInstrumentHours += flight.simulatedInstrument;
      totalLandings += flight.allLandings;
      dayLandings += flight.dayLandings;
      nightLandings += flight.nightLandings;
      // Track unique airports
      if (flight.from) uniqueAirports.add(flight.from);
      if (flight.to) uniqueAirports.add(flight.to);
      // Get aircraft details
      const aircraftDetail = aircraftMap.get(flight.aircraftId);
      // Aggregate aircraft stats
      if (!aircraftStats[flight.aircraftId]) {
        aircraftStats[flight.aircraftId] = {
          make: aircraftDetail?.make || 'Unknown',
          model: aircraftDetail?.model || flight.aircraftId,
          type: aircraftDetail?.typeCode || 'Unknown',
          hours: 0,
          flights: 0
        };
      }
      aircraftStats[flight.aircraftId].hours += flight.totalTime;
      aircraftStats[flight.aircraftId].flights += 1;
      // Aggregate type stats
      const typeCode = aircraftDetail?.typeCode || 'Unknown';
      if (!typeStats[typeCode]) {
        typeStats[typeCode] = {
          hours: 0,
          flights: 0
        };
      }
      typeStats[typeCode].hours += flight.totalTime;
      typeStats[typeCode].flights += 1;
    }
    return {
      totalHours,
      picHours,
      sicHours,
      crossCountryHours,
      nightHours,
      instrumentHours: actualInstrumentHours + simulatedInstrumentHours,
      actualInstrumentHours,
      simulatedInstrumentHours,
      totalLandings,
      dayLandings,
      nightLandings,
      uniqueAircraftCount: Object.keys(aircraftStats).length,
      uniqueAirports: Array.from(uniqueAirports),
      firstFlightDate,
      lastFlightDate,
      yearsFlying,
      aircraftStats,
      typeStats
    };
  }
  
  /**
   * Detect certifications and ratings from logbook data
   */
  export function detectCertifications(data: LogbookData): Certification[] {
    const { flights } = data;
    const certifications: Certification[] = [];
    
    // Sort flights by date
    const sortedFlights = [...flights].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Look for checkrides and add them as certifications
    for (const flight of sortedFlights) {
      if (flight.checkride) {
        // Extract the certification type from the checkride field
        const title = flight.pilotComments.includes('Private') ? 'Private Pilot Certificate' :
                     flight.pilotComments.includes('Instrument') ? 'Instrument Rating' :
                     flight.pilotComments.includes('Commercial') ? 'Commercial Pilot Certificate' :
                     flight.pilotComments.includes('CFI') ? 'Certified Flight Instructor' :
                     flight.pilotComments.includes('CFII') ? 'CFI Instrument' :
                     flight.pilotComments.includes('MEI') ? 'Multi-Engine Instructor' :
                     flight.pilotComments.includes('ATP') ? 'Airline Transport Pilot' :
                     flight.pilotComments;
        
        certifications.push({
          title,
          date: flight.date,
          description: `Checkride: ${flight.pilotComments}`
        });
      }
    }
    
    return certifications;
  }
  
  /**
   * Detect significant milestones from logbook data
   */
  export async function detectMilestones(data: LogbookData, summary: LogbookSummary): Promise<Milestone[]> {
    const { flights } = data;
    const milestones: Milestone[] = [];
    
    // Load airport data
    const airports = await loadAirportData();
    
    // Sort flights by date
    const sortedFlights = [...flights].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // First flight
    if (sortedFlights.length > 0) {
      const firstFlight = sortedFlights[0];
      const year = new Date(firstFlight.date).getFullYear().toString();
      const aircraft = `${summary.aircraftStats[firstFlight.aircraftId]?.make || ''} ${summary.aircraftStats[firstFlight.aircraftId]?.model || firstFlight.aircraftId}`.trim();
      
      const routeDescription = formatRouteDescription(firstFlight.from, firstFlight.to, airports);
      
      milestones.push({
        year,
        title: 'First Flight',
        description: `First logged flight ${routeDescription} in a ${aircraft}`
      });
    }
    
    // First solo
    const firstSolo = sortedFlights.find(f => f.solo > 0);
    if (firstSolo) {
      const year = new Date(firstSolo.date).getFullYear().toString();
      const aircraft = `${summary.aircraftStats[firstSolo.aircraftId]?.make || ''} ${summary.aircraftStats[firstSolo.aircraftId]?.model || firstSolo.aircraftId}`.trim();
      
      const routeDescription = formatRouteDescription(firstSolo.from, firstSolo.to, airports);
      
      milestones.push({
        year,
        title: 'First Solo Flight',
        description: `First solo flight ${routeDescription} in a ${aircraft}`
      });
    }
    
    // Hour milestones
    const hourMilestones = [10, 25, 50, 100, 200, 300, 400, 500, 1000, 1500, 2000];
    let cumulativeHours = 0;
    
    for (const flight of sortedFlights) {
      const prevHours = cumulativeHours;
      cumulativeHours += flight.totalTime;
      
      for (const milestone of hourMilestones) {
        if (prevHours < milestone && cumulativeHours >= milestone) {
          const year = new Date(flight.date).getFullYear().toString();
          const routeDescription = formatRouteDescription(flight.from, flight.to, airports);
          
          milestones.push({
            year,
            title: `${milestone} Flight Hours`,
            description: `Reached ${milestone} total flight hours ${routeDescription}`
          });
        }
      }
    }
    
    return milestones;
  }
  
  /**
   * Get recent flights from the logbook data
   */
  export function getRecentFlights(data: LogbookData, count: number = 5): FlightEntry[] {
    const { flights } = data;
    
    // Sort flights by date in descending order (most recent first)
    const sortedFlights = [...flights].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Return the specified number of most recent flights
    return sortedFlights.slice(0, count);
  }
  
  /**
   * Get currency information based on logbook data
   */
  export function getCurrencyInfo(data: LogbookData): {
    passengerCurrency: boolean;
    nightCurrency: boolean;
    instrumentCurrency: boolean;
    lastBiennial: string;
    lastIPC: string;
  } {
    const { flights } = data;
    const today = new Date();
    
    // Sort flights by date in descending order (most recent first)
    const sortedFlights = [...flights].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Check passenger currency (3 takeoffs and landings in last 90 days)
    let recentLandings = 0;
    let passengerCurrency = false;
    
    // Check night currency (3 takeoffs and landings to a full stop at night in last 90 days)
    let recentNightLandings = 0;
    let nightCurrency = false;
    
    // Check instrument currency (6 approaches, holding, and intercepting/tracking in last 6 months)
    let recentApproaches = 0;
    let recentHolding = false;
    let instrumentCurrency = false;
    
    // Find last flight review and IPC
    let lastBiennial = '';
    let lastIPC = '';
    
    // Check 90-day currency
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    // Check 6-month currency
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    // Find last flight review and IPC
    for (const flight of sortedFlights) {
      const flightDate = new Date(flight.date);
      
      // Check for flight review
      if (!lastBiennial && flight.flightReview) {
        lastBiennial = flight.date;
      }
      
      // Check for IPC
      if (!lastIPC && flight.ipc) {
        lastIPC = flight.date;
      }
      
      // Check 90-day currency
      if (flightDate >= ninetyDaysAgo) {
        recentLandings += flight.allLandings;
        recentNightLandings += flight.nightLandings;
      }
      
      // Check 6-month instrument currency
      if (flightDate >= sixMonthsAgo) {
        recentApproaches += flight.approaches.length;
        // Check for holding patterns (simplified)
        if (flight.pilotComments.toLowerCase().includes('hold') || 
            flight.instructorComments.toLowerCase().includes('hold')) {
          recentHolding = true;
        }
      }
      
      // If we've found everything we need, break the loop
      if (lastBiennial && lastIPC && recentLandings >= 3 && recentNightLandings >= 3 && 
          recentApproaches >= 6 && recentHolding) {
        break;
      }
    }
    
    // Determine currency status
    passengerCurrency = recentLandings >= 3;
    nightCurrency = recentNightLandings >= 3;
    instrumentCurrency = recentApproaches >= 6 && recentHolding;
    
    return {
      passengerCurrency,
      nightCurrency,
      instrumentCurrency,
      lastBiennial,
      lastIPC
    };
  }