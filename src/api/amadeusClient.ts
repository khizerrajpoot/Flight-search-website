import type { AmadeusSearchParams, FlightOffer, TravelerPricing, CabinClass } from '../types/flights'

const AMADEUS_CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID as string | undefined
const AMADEUS_CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET as string | undefined

const AMADEUS_AUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token'
const AMADEUS_FLIGHT_OFFERS_URL =
  'https://test.api.amadeus.com/v2/shopping/flight-offers'

async function getAccessToken(): Promise<string> {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    throw new Error(
      'Missing VITE_AMADEUS_CLIENT_ID or VITE_AMADEUS_CLIENT_SECRET. Please set them in your .env file.',
    )
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AMADEUS_CLIENT_ID,
    client_secret: AMADEUS_CLIENT_SECRET,
  })

  const response = await fetch(AMADEUS_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Amadeus auth error: ${response.status} ${response.statusText} – ${text}`)
  }

  const json = (await response.json()) as { access_token: string }
  return json.access_token
}

export async function searchAmadeusFlights(
  params: AmadeusSearchParams,
): Promise<FlightOffer[]> {
  const token = await getAccessToken()

  const url = new URL(AMADEUS_FLIGHT_OFFERS_URL)
  url.searchParams.set('originLocationCode', params.originLocationCode)
  url.searchParams.set('destinationLocationCode', params.destinationLocationCode)
  url.searchParams.set('departureDate', params.departureDate)
  if (params.returnDate) url.searchParams.set('returnDate', params.returnDate)
  url.searchParams.set('adults', String(params.adults))
  if (params.children && params.children > 0) {
    url.searchParams.set('children', String(params.children))
  }
  if (params.travelClass) url.searchParams.set('travelClass', params.travelClass)
  if (params.currencyCode) url.searchParams.set('currencyCode', params.currencyCode)
  if (params.max) url.searchParams.set('max', String(params.max))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    let errorMessage = `Amadeus flight search error: ${response.status} ${response.statusText}`
    
    try {
      const errorData = JSON.parse(text)
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const friendlyMessages = errorData.errors.map((err: any) => {
          if (err.code === 477) {
            if (err.source?.pointer === 'originLocationCode' || err.source?.pointer === 'destinationLocationCode') {
              return `Invalid airport code. Please use a 3-letter IATA code (e.g., ${err.source.example || 'LHE'})`
            }
            if (err.source?.pointer === 'departureDate' || err.source?.pointer === 'returnDate') {
              return 'Invalid date format. Please select a valid date.'
            }
            return err.detail || err.title || 'Invalid format'
          }
          if (err.code === 492) {
            return 'Invalid date. Please select a valid departure date.'
          }
          if (err.code === 493) {
            return 'Return date must be after departure date.'
          }
          return err.detail || err.title || 'An error occurred'
        })
        errorMessage = friendlyMessages.join('. ')
      } else if (errorData.error_description) {
        errorMessage = errorData.error_description
      }
    } catch {
      errorMessage = text.length > 200 ? `${errorMessage} – ${text.substring(0, 200)}...` : `${errorMessage} – ${text}`
    }
    
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as {
    data?: any[]
    dictionaries?: any
    errors?: any[]
  }

  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    console.warn('[Amadeus] API returned errors:', data.errors)
  }

  if (!data.data || !Array.isArray(data.data)) {
    console.log('[Amadeus] No flight data in response. Total passengers:', params.adults + (params.children || 0))
    return []
  }

  console.log(`[Amadeus] Found ${data.data.length} flight offers for ${params.adults} adult(s) and ${params.children || 0} child(ren)`)

  const offers: FlightOffer[] = data.data.map((offer: any) => {
    const segments: FlightOffer['segments'] = []

    for (const itinerary of offer.itineraries ?? []) {
      for (const segment of itinerary.segments ?? []) {
        segments.push({
          departureAirport: segment.departure?.iataCode ?? '',
          arrivalAirport: segment.arrival?.iataCode ?? '',
          departureTime: segment.departure?.at ?? '',
          arrivalTime: segment.arrival?.at ?? '',
          duration: segment.duration ?? '',
          numberOfStops: (segment.numberOfStops ?? 0) as number,
          carrierCode: segment.carrierCode ?? '',
          flightNumber: segment.number ?? '',
        })
      }
    }

    const travelerPricings: FlightOffer['travelerPricings'] = offer.travelerPricings
      ? offer.travelerPricings.map((tp: any) => ({
          travelerType: (tp.travelerType || 'ADULT') as TravelerPricing['travelerType'],
          price: Number(tp.price?.total ?? 0),
          currency: tp.price?.currency ?? offer.price?.currency ?? 'USD',
          includedCheckedBags: tp.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? 
                              tp.fareDetailsBySegment?.[0]?.includedCheckedBags ?? undefined,
        }))
      : undefined

    let cabinClass: CabinClass | undefined = undefined
    
    if (offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin) {
      const cabin = offer.travelerPricings[0].fareDetailsBySegment[0].cabin
      if (['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(cabin)) {
        cabinClass = cabin as CabinClass
      }
    }
    
    if (!cabinClass && offer.class) {
      const classValue = Array.isArray(offer.class) ? offer.class[0] : offer.class
      if (['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(classValue)) {
        cabinClass = classValue as CabinClass
      }
    }
    
    if (!cabinClass && offer.itineraries?.[0]?.segments?.[0]) {
      const segment = offer.itineraries[0].segments[0] as any
      if (segment.cabin && ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(segment.cabin)) {
        cabinClass = segment.cabin as CabinClass
      }
    }

    const firstTravelerPricing = offer.travelerPricings?.[0]
    let checkedBags = 0
    if (firstTravelerPricing?.fareDetailsBySegment?.[0]?.includedCheckedBags) {
      const bags = firstTravelerPricing.fareDetailsBySegment[0].includedCheckedBags
      checkedBags = typeof bags === 'number' ? bags : bags?.quantity ?? 0
    }
    
    const baggageAllowance: FlightOffer['baggageAllowance'] = checkedBags > 0 || firstTravelerPricing
      ? {
          checkedBags,
          carryOnBags: 1,
        }
      : undefined

    return {
      id: offer.id,
      price: Number(offer.price?.grandTotal ?? 0),
      currency: offer.price?.currency ?? 'USD',
      airline: segments[0]?.carrierCode ?? 'Unknown airline',
      segments,
      travelerPricings,
      cabinClass: cabinClass as CabinClass | undefined,
      baggageAllowance,
    }
  })

  return offers
}

