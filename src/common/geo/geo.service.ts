import { Injectable, Logger } from '@nestjs/common';
const NodeGeocoder = require('node-geocoder');

@Injectable()
export class GeoService {
  private geocoder: any;
  private readonly logger = new Logger(GeoService.name);

  constructor() {
    const options = {
      provider: 'google',
      apiKey: process.env.GOOGLE_MAP_KEY,
      formatter: null,
    };
    this.geocoder = NodeGeocoder(options);
  }

  async getCoordinates(address: string): Promise<{ latitude: number; longitude: number }> {
    try {
      if (!address || !process.env.GOOGLE_MAP_KEY) return { latitude: 0, longitude: 0 };
      const res = await this.geocoder.geocode(address);
      if (res && res.length > 0) {
        return {
          latitude: res[0].latitude || 0,
          longitude: res[0].longitude || 0,
        };
      }
    } catch (error) {
      this.logger.error(`Error geocoding address ${address}: ${error.message}`);
    }
    return { latitude: 0, longitude: 0 };
  }
}
