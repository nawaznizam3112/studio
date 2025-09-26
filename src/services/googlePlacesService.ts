'use server';

import { Client, Place, TextSearchRequest } from '@googlemaps/google-maps-services-js';
import type { PlaceSearchResult } from '@/types/clinic';

const client = new Client({});

export async function searchGooglePlaces(query: string): Promise<PlaceSearchResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("SERVER_ERROR: Google Maps API Key is missing. Please configure it in your .env file.");
    throw new Error("The Google Places search feature is not configured. Please contact the administrator.");
  }

  const request: TextSearchRequest = {
    params: {
      query: query,
      key: apiKey,
      // Request specific fields to control costs
      fields: ['place_id', 'name', 'formatted_address', 'formatted_phone_number', 'address_components'],
    },
    timeout: 2000, // Optional timeout
  };

  try {
    const response = await client.textSearch(request);
    
    if (response.data.status === 'OK' && response.data.results) {
        return response.data.results.map((place: Place): PlaceSearchResult => {
            const cityComponent = place.address_components?.find(comp => comp.types.includes('locality'));
            return {
                place_id: place.place_id!,
                name: place.name,
                formatted_address: place.formatted_address,
                formatted_phone_number: place.formatted_phone_number,
                city: cityComponent?.long_name
            };
        });
    } else if (response.data.status !== 'OK') {
        console.warn(`Google Places API returned status: ${response.data.status}. Message: ${response.data.error_message}`);
        // For statuses like ZERO_RESULTS, we just return an empty array.
        // For others, we might want to throw an error.
        if (response.data.status !== 'ZERO_RESULTS') {
          throw new Error(`Google Places API Error: ${response.data.error_message || response.data.status}`);
        }
    }

    return [];
  } catch (error: any) {
    console.error("Error during Google Places textSearch:", error.response?.data?.error_message || error.message);
    throw new Error(`Failed to search places: ${error.response?.data?.error_message || 'An unknown server error occurred'}`);
  }
}
