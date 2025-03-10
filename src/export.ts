import fs from 'fs/promises';
import path from 'path';
import { LogbookData } from './types';

/**
 * Export the logbook data to a different format
 */
export async function exportLogbook(data: LogbookData, format: 'json' | 'csv', outputPath: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'public', outputPath.replace(/^\//, ''));
    
    if (format === 'json') {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } else if (format === 'csv') {
      // Export aircraft table
      let csvContent = 'AircraftID,TypeCode,Year,Make,Model,GearType,EngineType,equipType,aircraftClass,complexAircraft,taa,highPerformance,pressurized\n';
      
      for (const aircraft of data.aircraft) {
        csvContent += `${aircraft.aircraftId},${aircraft.typeCode},${aircraft.year},${aircraft.make},${aircraft.model},${aircraft.gearType},${aircraft.engineType},${aircraft.equipType},${aircraft.aircraftClass},${aircraft.complexAircraft},${aircraft.taa},${aircraft.highPerformance},${aircraft.pressurized}\n`;
      }
      
      csvContent += '\n';
      
      // Export flights table
      csvContent += 'Date,AircraftID,From,To,Route,TotalTime,PIC,SIC,Night,Solo,CrossCountry,IFR,ActualInstrument,SimulatedInstrument,Approaches,DayLandings,NightLandings,AllLandings,DualReceived,DualGiven,PilotComments\n';
      
      for (const flight of data.flights) {
        csvContent += `${flight.date},${flight.aircraftId},${flight.from},${flight.to},${flight.route},${flight.totalTime},${flight.pic},${flight.sic},${flight.night},${flight.solo},${flight.crossCountry},${flight.ifr},${flight.actualInstrument},${flight.simulatedInstrument},${flight.approaches.join('|')},${flight.dayLandings},${flight.nightLandings},${flight.allLandings},${flight.dualReceived},${flight.dualGiven},${flight.pilotComments.replace(/,/g, ';')}\n`;
      }
      
      await fs.writeFile(filePath, csvContent, 'utf-8');
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting logbook:', error);
    return false;
  }
}