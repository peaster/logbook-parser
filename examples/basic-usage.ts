import { 
    parseForeflight, 
    calculateLogbookSummary, 
    detectCertifications, 
    detectMilestones,
    getCurrencyInfo,
    getRecentFlights,
    exportLogbook
  } from 'pilot-logbook-parser';
  
  async function main() {
    try {
      // Parse the ForeFlight logbook
      console.log('Parsing logbook...');
      const logbookData = await parseForeflight('data/foreflight-export.csv');
      
      // Calculate summary statistics
      console.log('Calculating summary...');
      const summary = calculateLogbookSummary(logbookData);
      
      // Display basic statistics
      console.log('\n===== LOGBOOK SUMMARY =====');
      console.log(`Total Flight Hours: ${summary.totalHours.toFixed(1)}`);
      console.log(`PIC Hours: ${summary.picHours.toFixed(1)}`);
      console.log(`Night Hours: ${summary.nightHours.toFixed(1)}`);
      console.log(`Instrument Hours: ${summary.instrumentHours.toFixed(1)}`);
      console.log(`Total Landings: ${summary.totalLandings}`);
      console.log(`Unique Aircraft: ${summary.uniqueAircraftCount}`);
      console.log(`Unique Airports: ${summary.uniqueAirports.length}`);
      console.log(`Years Flying: ${summary.yearsFlying}`);
      
      // Check currency
      console.log('\n===== CURRENCY STATUS =====');
      const currency = getCurrencyInfo(logbookData);
      console.log(`Passenger Currency: ${currency.passengerCurrency ? 'Current' : 'Not Current'}`);
      console.log(`Night Currency: ${currency.nightCurrency ? 'Current' : 'Not Current'}`);
      console.log(`Instrument Currency: ${currency.instrumentCurrency ? 'Current' : 'Not Current'}`);
      console.log(`Last Flight Review: ${currency.lastBiennial || 'None recorded'}`);
      
      // Get certifications
      console.log('\n===== CERTIFICATIONS =====');
      const certifications = detectCertifications(logbookData);
      for (const cert of certifications) {
        console.log(`${cert.date}: ${cert.title}`);
      }
      
      // Get milestones
      console.log('\n===== CAREER MILESTONES =====');
      const milestones = await detectMilestones(logbookData, summary);
      for (const milestone of milestones) {
        console.log(`${milestone.year}: ${milestone.title} - ${milestone.description}`);
      }
      
      // Get recent flights
      console.log('\n===== RECENT FLIGHTS =====');
      const recentFlights = getRecentFlights(logbookData, 3);
      for (const flight of recentFlights) {
        console.log(`${flight.date}: ${flight.from} to ${flight.to} (${flight.totalTime.toFixed(1)} hours)`);
      }
      
      // Export to JSON
      console.log('\nExporting to JSON...');
      await exportLogbook(logbookData, 'json', 'output/logbook.json');
      console.log('Export complete!');
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  main();