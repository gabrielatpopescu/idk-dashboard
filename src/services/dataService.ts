// src/services/dataService.ts
import { CalitateAerService, CopernicusService, DataService } from './apiService';

// Re-export everything from apiService
export * from './apiService';

// Create service instances
export const calitateAerService = new CalitateAerService();
export const copernicusService = new CopernicusService();
export const dataService = new DataService();