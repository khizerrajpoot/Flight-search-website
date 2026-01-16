export type AmadeusSearchParams = {
  originLocationCode: string
  destinationLocationCode: string
  departureDate: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD
  adults: number
  children?: number
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  currencyCode?: string
  max?: number
}

export type FlightSegment = {
  departureAirport: string
  arrivalAirport: string
  departureTime: string
  arrivalTime: string
  duration: string
  numberOfStops: number
  carrierCode: string
  flightNumber: string
}

export type TravelerPricing = {
  travelerType: 'ADULT' | 'CHILD' | 'SENIOR' | 'HELD_INFANT' | 'SEATED_INFANT' | 'YOUNG'
  price: number
  currency: string
  includedCheckedBags?: number // Number of checked bags included
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'

export type FlightOffer = {
  id: string
  price: number
  currency: string
  airline: string
  segments: FlightSegment[]
  travelerPricings?: TravelerPricing[]
  cabinClass?: CabinClass // Cabin class for the flight
  baggageAllowance?: {
    checkedBags: number // Number of checked bags included
    carryOnBags: number // Number of carry-on bags included
  }
}

export type SearchFormState = {
  from: string
  to: string
  departureDate: Date | null
  returnDate: Date | null
  adults: number
  children: number
}

export type FiltersState = {
  stops: {
    nonstop: boolean
    oneStop: boolean
    twoPlus: boolean
  }
  maxPrice: number
  airlines: string[]
  cabinClasses: CabinClass[] // Selected cabin classes
}

export type SortOption = 'best' | 'cheapest' | 'fastest'
export type GraphWindowOption = '30' | '7' | 'custom'

export type PriceTrendPoint = {
  date: string
  price: number
}

