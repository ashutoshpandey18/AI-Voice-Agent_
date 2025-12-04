import axios from 'axios';
import { WeatherInfo, WeatherRecommendation } from '../types';

/**
 * Weather Service
 * Integrates with OpenWeatherMap Forecast API for real weather data
 * Provides intelligent seating recommendations based on weather conditions
 */
class WeatherService {
  private _apiKey?: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';

  /**
   * Lazy getter for API key - reads from env on first access
   * This ensures dotenv.config() has run before we check the env variable
   */
  private get apiKey(): string {
    if (this._apiKey === undefined) {
      this._apiKey = process.env.OPENWEATHER_API_KEY || '';

      if (!this._apiKey) {
        console.warn('⚠️ OPENWEATHER_API_KEY not set. Weather features will be limited.');
      }
    }
    return this._apiKey;
  }

  /**
   * Fetch weather forecast for a specific date and location
   * @param location - City name (e.g., "New York", "London")
   * @param date - Target date for the booking
   * @returns WeatherInfo object with current/forecast data
   */
  async getWeatherForDate(location: string, date: Date): Promise<WeatherInfo> {
    try {
      const now = new Date();
      const targetDate = new Date(date);
      const daysDifference = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // If booking is for today or within forecast range (5 days)
      if (daysDifference >= 0 && daysDifference <= 5) {
        return await this.getForecastWeather(location, targetDate);
      } else {
        // For dates beyond forecast range, use current weather as approximation
        return await this.getCurrentWeather(location);
      }
    } catch (error: any) {
      console.error('Weather API error:', error.message);
      // Return fallback weather data
      return this.getFallbackWeather();
    }
  }

  /**
   * Get current weather for a location
   */
  private async getCurrentWeather(location: string): Promise<WeatherInfo> {
    const url = `${this.baseUrl}/weather`;
    const response = await axios.get(url, {
      params: {
        q: location,
        appid: this.apiKey,
        units: 'metric'
      }
    });

    const data = response.data;
    return {
      condition: data.weather[0].main,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  }

  /**
   * Get forecast weather for a specific future date
   */
  private async getForecastWeather(location: string, targetDate: Date): Promise<WeatherInfo> {
    const url = `${this.baseUrl}/forecast`;
    const response = await axios.get(url, {
      params: {
        q: location,
        appid: this.apiKey,
        units: 'metric'
      }
    });

    // Find the forecast closest to the target date
    const forecasts = response.data.list;
    const targetTime = targetDate.getTime();

    let closestForecast = forecasts[0];
    let minDiff = Math.abs(new Date(forecasts[0].dt * 1000).getTime() - targetTime);

    for (const forecast of forecasts) {
      const forecastTime = new Date(forecast.dt * 1000).getTime();
      const diff = Math.abs(forecastTime - targetTime);

      if (diff < minDiff) {
        minDiff = diff;
        closestForecast = forecast;
      }
    }

    return {
      condition: closestForecast.weather[0].main,
      temperature: Math.round(closestForecast.main.temp),
      description: closestForecast.weather[0].description,
      humidity: closestForecast.main.humidity,
      windSpeed: closestForecast.wind.speed
    };
  }

  /**
   * Fallback weather data when API is unavailable
   */
  private getFallbackWeather(): WeatherInfo {
    return {
      condition: 'Clear',
      temperature: 22,
      description: 'clear sky',
      humidity: 50,
      windSpeed: 3.5
    };
  }

  /**
   * Get intelligent seating recommendation based on weather
   * RULES:
   * - Rain/Storm/Snow → Indoor
   * - Cloudy/Cold (<20°C) → Indoor
   * - Sunny/Warm (>25°C) → Outdoor
   */
  getSeatingRecommendation(weather: WeatherInfo): WeatherRecommendation {
    const { condition, temperature, description } = weather;
    const conditionLower = condition.toLowerCase();

    // Rule 1: Bad weather conditions → Indoor
    if (
      conditionLower.includes('rain') ||
      conditionLower.includes('storm') ||
      conditionLower.includes('thunder') ||
      conditionLower.includes('snow') ||
      conditionLower.includes('drizzle')
    ) {
      return {
        weather,
        recommendation: 'indoor',
        reason: `Due to ${description}, we recommend indoor seating for your comfort.`
      };
    }

    // Rule 2: Cold weather → Indoor
    if (temperature < 20) {
      return {
        weather,
        recommendation: 'indoor',
        reason: `With a temperature of ${temperature}°C, indoor seating will be more comfortable.`
      };
    }

    // Rule 3: Warm/Sunny weather → Outdoor
    if (temperature >= 25 && (conditionLower.includes('clear') || conditionLower.includes('sun'))) {
      return {
        weather,
        recommendation: 'outdoor',
        reason: `Beautiful ${description} with ${temperature}°C - perfect for outdoor dining!`
      };
    }

    // Rule 4: Moderate weather → Outdoor (default for pleasant conditions)
    if (temperature >= 20 && temperature < 25) {
      return {
        weather,
        recommendation: 'outdoor',
        reason: `Pleasant ${description} at ${temperature}°C - outdoor seating recommended.`
      };
    }

    // Default: Indoor for safety
    return {
      weather,
      recommendation: 'indoor',
      reason: `Indoor seating recommended for your comfort.`
    };
  }

  /**
   * Complete weather check and recommendation in one call
   */
  async getWeatherRecommendation(location: string, date: Date): Promise<WeatherRecommendation> {
    const weather = await this.getWeatherForDate(location, date);
    return this.getSeatingRecommendation(weather);
  }
}

export const weatherService = new WeatherService();
