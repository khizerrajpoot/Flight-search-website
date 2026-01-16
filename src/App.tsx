import { useMemo, useState, useEffect } from 'react'
import './App.css'
import { searchAmadeusFlights } from './api/amadeusClient'
import {
  type FiltersState,
  type FlightOffer,
  type PriceTrendPoint,
  type SearchFormState,
  type SortOption,
} from './types/flights'
import { DateField } from './components/DateField'
import { PriceGraph } from './components/PriceGraph'
import { FlightDetails } from './components/FlightDetails'
import { Footer } from './components/Footer'

function App() {
  const [form, setForm] = useState<SearchFormState>({
    from: '',
    to: '',
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
  })

  const [allFlights, setAllFlights] = useState<FlightOffer[]>([])
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [filters, setFilters] = useState<FiltersState>({
    stops: {
      nonstop: true,
      oneStop: true,
      twoPlus: true,
    },
    maxPrice: 2000,
    airlines: [],
    cabinClasses: [],
  })
  
  const priceSliderMax = useMemo(() => {
    if (allFlights.length > 0) {
      const maxFlightPrice = Math.max(...allFlights.map(f => f.price))
      return Math.max(2000, Math.ceil(Math.max(filters.maxPrice, maxFlightPrice) / 1000) * 1000)
    }
    return Math.max(2000, Math.ceil(filters.maxPrice / 1000) * 1000)
  }, [allFlights, filters.maxPrice])
  const [loading, setLoading] = useState(false)
  const [activeFlight, setActiveFlight] = useState<FlightOffer | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'api' | 'user' | null>(null)
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
        setErrorType(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])
  const [sortBy, setSortBy] = useState<SortOption>('cheapest')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const isDark = theme === 'dark'

  const getCountryCodeFromAirport = (airportCode: string): string | null => {
    const airportToCountry: Record<string, string> = {
      LHE: 'PK',
      ISB: 'PK',
      KHI: 'PK',
      LYP: 'PK',
      FRA: 'DE',
      MUC: 'DE',
      BER: 'DE',
      DUS: 'DE',
      JFK: 'US',
      LAX: 'US',
      ORD: 'US',
      DFW: 'US',
      MIA: 'US',
      LHR: 'GB',
      LGW: 'GB',
      MAN: 'GB',
      CDG: 'FR',
      ORY: 'FR',
      DXB: 'AE',
      AUH: 'AE',
      RUH: 'SA',
      JED: 'SA',
      IST: 'TR',
      DEL: 'IN',
      BOM: 'IN',
      PEK: 'CN',
      PVG: 'CN',
      NRT: 'JP',
      HND: 'JP',
      SYD: 'AU',
      MEL: 'AU',
      YYZ: 'CA',
      YVR: 'CA',
      MAD: 'ES',
      BCN: 'ES',
      FCO: 'IT',
      MXP: 'IT',
      AMS: 'NL',
      SIN: 'SG',
      BKK: 'TH',
      KUL: 'MY',
      CGK: 'ID',
      ICN: 'KR',
      DOH: 'QA',
      CAI: 'EG',
    }
    return airportToCountry[airportCode.toUpperCase()] || null
  }

  const getFlagUrl = (countryCode: string | null): string | null => {
    if (!countryCode) return null
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`
  }

  const getOutboundStops = (offer: FlightOffer): number => {
    if (!offer.segments.length) return 0
    const destCode = form.to.toUpperCase()

    const destIndex = offer.segments.findIndex(
      (seg) => destCode && seg.arrivalAirport === destCode,
    )
    const segmentsForStops =
      destIndex === -1 ? offer.segments : offer.segments.slice(0, destIndex + 1)
    return Math.max(0, segmentsForStops.length - 1)
  }

  const applyFilters = (base: FlightOffer[], nextFilters: FiltersState): FlightOffer[] => {
    if (!base.length) return []

    return base.filter((offer) => {
      if (offer.price > nextFilters.maxPrice) return false

      const stops = getOutboundStops(offer)
      const hasAnyStopFilter =
        nextFilters.stops.nonstop || nextFilters.stops.oneStop || nextFilters.stops.twoPlus
      if (hasAnyStopFilter) {
        const matchesNonstop = nextFilters.stops.nonstop && stops === 0
        const matchesOneStop = nextFilters.stops.oneStop && stops === 1
        const matchesTwoPlus = nextFilters.stops.twoPlus && stops >= 2
        if (!matchesNonstop && !matchesOneStop && !matchesTwoPlus) return false
      }

      if (
        nextFilters.airlines.length > 0 &&
        !nextFilters.airlines.includes(offer.airline)
      ) {
        return false
      }

      if (
        nextFilters.cabinClasses.length > 0 &&
        (!offer.cabinClass || !nextFilters.cabinClasses.includes(offer.cabinClass))
      ) {
        return false
      }

      return true
    })
  }

  const parseIsoDurationMinutes = (iso: string | undefined): number => {
    if (!iso || !iso.startsWith('PT')) return 0
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return 0
    const hours = match[1] ? Number(match[1]) : 0
    const minutes = match[2] ? Number(match[2]) : 0
    return hours * 60 + minutes
  }

  const getOutboundDurationMinutes = (offer: FlightOffer): number => {
    if (!offer.segments.length) return 0
    const destCode = form.to.toUpperCase()
    const destIndex = offer.segments.findIndex(
      (seg) => destCode && seg.arrivalAirport === destCode,
    )
    const segmentsForDuration =
      destIndex === -1 ? offer.segments : offer.segments.slice(0, destIndex + 1)

    return segmentsForDuration.reduce(
      (sum, seg) => sum + parseIsoDurationMinutes(seg.duration),
      0,
    )
  }

  const handleChange = (field: keyof SearchFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }))
  }

  const updateFilters = (updater: (prev: FiltersState) => FiltersState) => {
    setFilters((prev) => {
      const next = updater(prev)
      setFlights(applyFilters(allFlights, next))
      return next
    })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrorType(null)

    if (form.from && form.from.length !== 3) {
      setError('Origin airport code must be exactly 3 letters (e.g., LHE, FRA)')
      setErrorType('user')
      return
    }
    
    if (form.to && form.to.length !== 3) {
      setError('Destination airport code must be exactly 3 letters (e.g., LHE, FRA)')
      setErrorType('user')
      return
    }

    if (!form.from || !form.to || !form.departureDate) {
      setError('Please enter origin, destination and departure date.')
      setErrorType('user')
      return
    }
    
    if (form.returnDate && form.departureDate && form.returnDate < form.departureDate) {
      setError('Return date must be after departure date.')
      setErrorType('user')
      return
    }

    const totalPassengers = form.adults + form.children
    if (totalPassengers > 9) {
      setError(
        `Maximum 9 passengers allowed (currently ${totalPassengers}). Please reduce the number of adults or children.`,
      )
      setErrorType('user')
      return
    }

    try {
      setLoading(true)
      setActiveFlight(null)
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const results = await searchAmadeusFlights({
        originLocationCode: form.from.toUpperCase(),
        destinationLocationCode: form.to.toUpperCase(),
        departureDate: formatDateForAPI(form.departureDate),
        returnDate: form.returnDate ? formatDateForAPI(form.returnDate) : undefined,
        adults: form.adults,
        children: form.children > 0 ? form.children : undefined,
        currencyCode: 'USD',
        max: 20,
      })
      
      if (results.length === 0) {
        setError(
          `No flights found for ${form.adults} adult${form.adults !== 1 ? 's' : ''} and ${form.children} child${form.children !== 1 ? 'ren' : ''}. Try adjusting your search criteria or reducing the number of passengers.`,
        )
        setErrorType('api')
      }
      
      console.log(`[App] Received ${results.length} flights from API`)
      const priceRange = results.length > 0 ? {
        min: Math.min(...results.map(r => r.price)),
        max: Math.max(...results.map(r => r.price)),
        avg: results.reduce((sum, r) => sum + r.price, 0) / results.length
      } : null
      console.log(`[App] Price range:`, priceRange)
      console.log(`[App] Current maxPrice filter: $${filters.maxPrice}`)
      
      setAllFlights(results)
      
      let adjustedFilters = { ...filters }
      if (results.length > 0 && priceRange && priceRange.max > filters.maxPrice) {
        const newMaxPrice = Math.ceil(priceRange.max / 100) * 100
        adjustedFilters.maxPrice = newMaxPrice
        setFilters((prev) => ({ ...prev, maxPrice: newMaxPrice }))
        console.log(`[App] Auto-adjusted maxPrice filter to $${newMaxPrice} to show all results`)
      }
      
      const filtered = applyFilters(results, adjustedFilters)
      console.log(`[App] After filtering: ${filtered.length} flights`)
      setFlights(filtered)
      
      if (filtered.length === 0 && results.length > 0) {
        setError(
          `Found ${results.length} flights, but all were filtered out by your filters. Try adjusting stops or airline filters.`,
        )
        setErrorType('user')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while searching flights.'
      setError(message)
      setErrorType('api')
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const priceTrendData: PriceTrendPoint[] = useMemo(() => {
    if (!flights.length || !form.departureDate) return []

    const startDate = form.departureDate
    const endDate = form.returnDate || form.departureDate

    const pricesByDate = new Map<string, number[]>()
    
    flights.forEach((offer) => {
      const firstSeg = offer.segments[0]
      if (!firstSeg?.departureTime) return
      const dateKey = firstSeg.departureTime.slice(0, 10)
      
      const existing = pricesByDate.get(dateKey) || []
      existing.push(offer.price)
      pricesByDate.set(dateKey, existing)
    })

    const allDates: string[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      allDates.push(`${year}-${month}-${day}`)
      current.setDate(current.getDate() + 1)
    }

    const points: PriceTrendPoint[] = allDates.map((date) => {
      const prices = pricesByDate.get(date) || []
      return {
        date,
        price: prices.length > 0 ? Math.min(...prices) : 0,
      }
    })

    return points
  }, [flights, form.departureDate, form.returnDate])

  const airlineOptions = useMemo(() => {
    const codes = new Set<string>()
    allFlights.forEach((offer) => {
      if (offer.airline) codes.add(offer.airline)
    })
    return Array.from(codes).sort()
  }, [allFlights])

  const sortedFlights = useMemo(() => {
    if (flights.length === 0) return []
    const arr = [...flights]

    if (sortBy === 'cheapest') {
      arr.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'fastest') {
      arr.sort(
        (a, b) => getOutboundDurationMinutes(a) - getOutboundDurationMinutes(b),
      )
    } else {
      arr.sort((a, b) => {
        const scoreA = a.price + getOutboundDurationMinutes(a) * 0.5
        const scoreB = b.price + getOutboundDurationMinutes(b) * 0.5
        return scoreA - scoreB
      })
    }

    return arr
  }, [flights, sortBy])

  const openFlightDetails = (offer: FlightOffer) => {
    setDetailLoading(true)
    setActiveFlight(offer)
    setTimeout(() => {
      setDetailLoading(false)
    }, 700)
  }

  const closeFlightDetails = () => {
    setActiveFlight(null)
    setDetailLoading(false)
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-slate-950 text-slate-50'
          : 'min-h-screen bg-linear-to-b from-indigo-50 via-sky-50 to-fuchsia-50 text-slate-900'
      }
    >
      {error && errorType && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur transition-all duration-300 ease-out max-w-md ${
            errorType === 'api'
              ? isDark
                ? 'border-red-500/50 bg-red-900/90 text-red-100'
                : 'border-red-400 bg-red-50 text-red-800'
              : isDark
                ? 'border-yellow-500/50 bg-yellow-900/90 text-yellow-100'
                : 'border-yellow-400 bg-yellow-50 text-yellow-800'
          }`}
        >
          <span className="text-sm font-medium flex-1">{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setErrorType(null)
            }}
            className={
              errorType === 'api'
                ? isDark
                  ? 'text-red-200 hover:text-red-100 transition-colors'
                  : 'text-red-600 hover:text-red-700 transition-colors'
                : isDark
                  ? 'text-yellow-200 hover:text-yellow-100 transition-colors'
                  : 'text-yellow-600 hover:text-yellow-700 transition-colors'
            }
            aria-label="Close error"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Plane.png"
              alt="Flight Explorer logo"
              className="h-10 w-10 rounded-2xl bg-linear-to-br from-sky-400 via-indigo-500 to-fuchsia-500 p-[2px] shadow-md shadow-indigo-300/60"
            />
            <div className="flex flex-col">
              <h1
                className={
                  isDark
                    ? 'text-2xl font-semibold tracking-tight sm:text-3xl'
                    : 'text-2xl font-semibold tracking-tight text-indigo-500 sm:text-3xl'
                }
              >
                Flight Explorer
              </h1>
              <p
                className={
                  isDark
                    ? 'mt-1 text-sm text-slate-400'
                    : 'mt-1 text-sm text-slate-500'
                }
              >
                Search, compare and track flights with an experience inspired by Google Flights.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={
                isDark
                  ? 'inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-200 transition-transform duration-150 ease-out hover:-translate-y-0.5'
                  : 'inline-flex items-center rounded-full border border-indigo-100 bg-indigo-500/10 px-3 py-1 text-indigo-600 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md'
              }
            >
              React + TypeScript
            </span>
            <span
              className={
                isDark
                  ? 'hidden sm:inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-200 transition-transform duration-150 ease-out hover:-translate-y-0.5'
                  : 'hidden sm:inline-flex items-center rounded-full border border-indigo-100 bg-indigo-500/10 px-3 py-1 text-indigo-600 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md'
              }
            >
              Tailwind CSS
            </span>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className={
                isDark
                  ? 'inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 shadow-sm shadow-slate-900/60 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:border-sky-500 hover:text-sky-200 hover:shadow-md hover:shadow-sky-500/40 active:translate-y-0 active:scale-95'
                  : 'inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-600 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-300/60 active:translate-y-0 active:scale-95'
              }
            >
              <span
                aria-hidden="true"
                className={isDark ? 'text-xs' : 'text-xs'}
              >
                {isDark ? '🌙' : '☀️'}
              </span>
              <span>{isDark ? 'Dark' : 'Light'} mode</span>
            </button>
          </div>
        </header>

        <section
          className={
            isDark
              ? 'relative z-20 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-slate-950/50 backdrop-blur'
              : 'relative z-20 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-2xl shadow-indigo-200/60 backdrop-blur-xl'
          }
        >
          <h2
            className={
              isDark
                ? 'mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400'
                : 'mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-500'
            }
          >
            Search flights
          </h2>
          <form
            className="grid gap-3 md:grid-cols-[1.2fr,1.2fr,1.1fr,1fr,auto] md:items-end"
            onSubmit={handleSearch}
          >
            <div className="flex flex-col gap-1">
              <label
                className={
                  isDark
                    ? 'text-xs font-medium text-slate-300'
                    : 'text-xs font-medium text-slate-600'
                }
              >
                From
              </label>
              <input
                className={
                  isDark
                    ? 'h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                    : 'h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                }
                placeholder="From (e.g. LHE, ISB, KHI)"
                value={form.from}
                onChange={(e) => handleChange('from', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className={
                  isDark
                    ? 'text-xs font-medium text-slate-300'
                    : 'text-xs font-medium text-slate-600'
                }
              >
                To
              </label>
              <input
                className={
                  isDark
                    ? 'h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                    : 'h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                }
                placeholder="To (e.g. FRA, MUC, BER)"
                value={form.to}
                onChange={(e) => handleChange('to', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DateField
                label="Departure"
                value={form.departureDate}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, departureDate: date }))
                }
                minDate={new Date()}
                placeholder="Select departure date"
                isDark={isDark}
              />
              <DateField
                label="Return"
                value={form.returnDate}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, returnDate: date }))
                }
                minDate={form.departureDate ?? new Date()}
                placeholder="Select return date"
                isDark={isDark}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className={
                  isDark
                    ? 'text-xs font-medium text-slate-300'
                    : 'text-xs font-medium text-slate-600'
                }
              >
                Passengers
              </label>
              <div className="flex gap-2">
                <div
                  className={
                    isDark
                      ? 'flex flex-1 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1.5'
                      : 'flex flex-1 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2 py-1.5'
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        adults: Math.max(1, prev.adults - 1),
                      }))
                    }
                    disabled={form.adults <= 1}
                    className={
                      isDark
                        ? 'flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-800 disabled:opacity-30'
                        : 'flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-30'
                    }
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span
                      className={
                        isDark
                          ? 'text-xs font-medium text-slate-200'
                          : 'text-xs font-medium text-slate-700'
                      }
                    >
                      {form.adults}
                    </span>
                    <span
                      className={
                        isDark
                          ? 'ml-1 text-[10px] text-slate-400'
                          : 'ml-1 text-[10px] text-slate-500'
                      }
                    >
                      Adult{form.adults !== 1 ? 's' : ''} (18+)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const maxAdults = 9 - prev.children
                        return {
                          ...prev,
                          adults: Math.min(maxAdults, prev.adults + 1),
                        }
                      })
                    }
                    disabled={form.adults >= 9 - form.children}
                    className={
                      isDark
                        ? 'flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-800 disabled:opacity-30'
                        : 'flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-30'
                    }
                  >
                    +
                  </button>
                </div>
                <div
                  className={
                    isDark
                      ? 'flex flex-1 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1.5'
                      : 'flex flex-1 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2 py-1.5'
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        children: Math.max(0, prev.children - 1),
                      }))
                    }
                    disabled={form.children <= 0}
                    className={
                      isDark
                        ? 'flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-800 disabled:opacity-30'
                        : 'flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-30'
                    }
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span
                      className={
                        isDark
                          ? 'text-xs font-medium text-slate-200'
                          : 'text-xs font-medium text-slate-700'
                      }
                    >
                      {form.children}
                    </span>
                    <span
                      className={
                        isDark
                          ? 'ml-1 text-[10px] text-slate-400'
                          : 'ml-1 text-[10px] text-slate-500'
                      }
                    >
                      Child{form.children !== 1 ? 'ren' : ''} (0-17)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const maxChildren = 9 - prev.adults
                        return {
                          ...prev,
                          children: Math.min(maxChildren, prev.children + 1),
                        }
                      })
                    }
                    disabled={form.children >= 9 - form.adults}
                    className={
                      isDark
                        ? 'flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-800 disabled:opacity-30'
                        : 'flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-30'
                    }
                  >
                    +
                  </button>
                </div>
              </div>
      </div>
            <button
              type="submit"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-slate-950 shadow-md shadow-sky-500/40 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/60 active:translate-y-0 active:scale-95 md:mt-0"
            >
              {loading ? 'Searching…' : 'Search flights'}
            </button>
          </form>

          <p className={isDark ? 'mt-1 text-[11px] text-slate-500' : 'mt-1 text-[11px] text-slate-500'}>
            Use 3-letter airport codes (IATA), for example <span className="font-mono">LHE</span>,{' '}
            <span className="font-mono">ISB</span>, <span className="font-mono">KHI</span>,{' '}
            <span className="font-mono">FRA</span>, <span className="font-mono">MUC</span>.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSortBy('cheapest')}
              className={`rounded-full border px-3 py-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                sortBy === 'cheapest'
                  ? isDark
                    ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                    : 'border-sky-500 bg-sky-500/10 text-sky-700'
                  : isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-sky-500 hover:text-sky-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-500 hover:text-sky-700'
              }`}
            >
              Price
            </button>
            <button
              type="button"
              onClick={() => setSortBy('fastest')}
              className={`rounded-full border px-3 py-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                sortBy === 'fastest'
                  ? isDark
                    ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                    : 'border-sky-500 bg-sky-500/10 text-sky-700'
                  : isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-sky-500 hover:text-sky-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-500 hover:text-sky-700'
              }`}
            >
              By flight time
        </button>
          </div>
        </section>

        {activeFlight ? (
          <FlightDetails
            flight={activeFlight}
            originCode={form.from.toUpperCase()}
            destinationCode={form.to.toUpperCase()}
            isDark={isDark}
            loading={detailLoading}
            durationMinutes={getOutboundDurationMinutes(activeFlight)}
            onBack={closeFlightDetails}
          />
        ) : (
          <main className="flex flex-1 flex-col gap-4 md:flex-row">
            <aside className="md:w-64">
              <div
                className={
                  isDark
                    ? 'rounded-3xl border border-slate-800 bg-slate-900/60 p-4 text-sm shadow-lg shadow-slate-950/40'
                    : 'rounded-3xl border border-white/60 bg-white/70 p-4 text-sm shadow-lg shadow-indigo-200/60 backdrop-blur-xl'
                }
              >
              <h2
                className={
                  isDark
                    ? 'mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'
                    : 'mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500'
                }
              >
                Filters
              </h2>

              <div className="space-y-4">
                <div>
                  <p
                    className={
                      isDark
                        ? 'mb-2 text-xs font-medium text-slate-300'
                        : 'mb-2 text-xs font-medium text-slate-700'
                    }
                  >
                    Stops
                  </p>
                  <div
                    className={
                      isDark
                        ? 'space-y-1 text-xs text-slate-300'
                        : 'space-y-1 text-xs text-slate-700'
                    }
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-sky-500"
                        checked={filters.stops.nonstop}
                        onChange={(e) =>
                          updateFilters((prev) => ({
                            ...prev,
                            stops: { ...prev.stops, nonstop: e.target.checked },
                          }))
                        }
                      />
                      Nonstop
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-sky-500"
                        checked={filters.stops.oneStop}
                        onChange={(e) =>
                          updateFilters((prev) => ({
                            ...prev,
                            stops: { ...prev.stops, oneStop: e.target.checked },
                          }))
                        }
                      />
                      1 stop
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-sky-500"
                        checked={filters.stops.twoPlus}
                        onChange={(e) =>
                          updateFilters((prev) => ({
                            ...prev,
                            stops: { ...prev.stops, twoPlus: e.target.checked },
                          }))
                        }
                      />
                      2+ stops
                    </label>
                  </div>
                </div>

                <div>
                  <p
                    className={
                      isDark
                        ? 'mb-2 text-xs font-medium text-slate-300'
                        : 'mb-2 text-xs font-medium text-slate-700'
                    }
                  >
                    Price (max)
                  </p>
                  <input
                    type="range"
                    min={100}
                    max={priceSliderMax}
                    step={100}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      updateFilters((prev) => ({
                        ...prev,
                        maxPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                    <span>$100</span>
                    <span>${filters.maxPrice.toFixed(0)} max</span>
                    <span>${priceSliderMax.toFixed(0)}</span>
                  </div>
                </div>

                <div>
                  <p
                    className={
                      isDark
                        ? 'mb-2 text-xs font-medium text-slate-300'
                        : 'mb-2 text-xs font-medium text-slate-700'
                    }
                  >
                    Cabin Class
                  </p>
                  <div
                    className={
                      isDark
                        ? 'space-y-1 text-xs text-slate-300'
                        : 'space-y-1 text-xs text-slate-700'
                    }
                  >
                    {(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'] as const).map((cabin) => {
                      const checked = filters.cabinClasses.includes(cabin)
                      return (
                        <label key={cabin} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-sky-500"
                            checked={checked}
                            onChange={(e) =>
                              updateFilters((prev) => {
                                const has = prev.cabinClasses.includes(cabin)
                                let nextCabinClasses = prev.cabinClasses
                                if (e.target.checked && !has) {
                                  nextCabinClasses = [...prev.cabinClasses, cabin]
                                } else if (!e.target.checked && has) {
                                  nextCabinClasses = prev.cabinClasses.filter((c) => c !== cabin)
                                }
                                return { ...prev, cabinClasses: nextCabinClasses }
                              })
                            }
                          />
                          {cabin.replace('_', ' ')}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p
                    className={
                      isDark
                        ? 'mb-2 text-xs font-medium text-slate-300'
                        : 'mb-2 text-xs font-medium text-slate-700'
                    }
                  >
                    Airlines
                  </p>
                  {airlineOptions.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      Run a search to see available airlines.
                    </p>
                  ) : (
                    <div
                      className={
                        isDark
                          ? 'space-y-1 text-xs text-slate-300'
                          : 'space-y-1 text-xs text-slate-700'
                      }
                    >
                      {airlineOptions.map((code) => {
                        const checked = filters.airlines.includes(code)
                        return (
                          <label key={code} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="accent-sky-500"
                              checked={checked}
                              onChange={(e) =>
                                updateFilters((prev) => {
                                  const has = prev.airlines.includes(code)
                                  let nextAirlines = prev.airlines
                                  if (e.target.checked && !has) {
                                    nextAirlines = [...prev.airlines, code]
                                  } else if (!e.target.checked && has) {
                                    nextAirlines = prev.airlines.filter((a) => a !== code)
                                  }
                                  return { ...prev, airlines: nextAirlines }
                                })
                              }
                            />
                            {code}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-4">
            <PriceGraph
              data={priceTrendData}
              isDark={isDark}
            />

            <div
              className={
                isDark
                  ? 'rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40'
                  : 'rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-indigo-200/60 backdrop-blur-xl'
              }
            >
              <div className="mb-3 flex items-center justify-between text-xs">
                <p>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    Showing{' '}
                  </span>
                  <span
                    className={
                      isDark
                        ? 'font-semibold text-slate-200'
                        : 'font-semibold text-indigo-500'
                    }
                  >
                    {sortedFlights.length}
                  </span>{' '}
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    flights
                  </span>
                </p>
                <select
                  className={
                    isDark
                      ? 'h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200'
                      : 'h-9 rounded-full border border-indigo-200 bg-indigo-500/10 px-4 text-xs font-semibold text-indigo-600 shadow-sm'
                  }
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="cheapest">Sort: Price</option>
                  <option value="fastest">Sort: By flight time</option>
                </select>
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                {sortedFlights.length === 0 && !loading && (
                  <div
                    className={
                      isDark
                        ? 'rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500'
                        : 'rounded-xl border border-dashed border-indigo-100 bg-white/80 p-6 text-center text-xs text-slate-500'
                    }
                  >
                    Start by entering a route and dates above. Flight options from the API will
                    appear here with price, duration, and stop details.
                  </div>
                )}

                {loading && (
                  <div
                    className={
                      isDark
                        ? 'flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-xs text-slate-400'
                        : 'flex flex-col items-center justify-center gap-3 rounded-xl border border-indigo-100 bg-white/80 p-6 text-xs text-slate-500'
                    }
                  >
                    <video
                      src="/Plane.mp4"
                      className="h-20 w-20 rounded-full object-cover shadow-md shadow-indigo-500/40"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    <span>Searching flights…</span>
                  </div>
                )}

                {!loading && sortedFlights.length > 0 && (
                  <ul className="space-y-3 text-xs">
                    {sortedFlights.map((offer) => {
                      const first = offer.segments[0]
                      const last = offer.segments[offer.segments.length - 1]
                      const originCode = form.from.toUpperCase()
                      const destCode = form.to.toUpperCase()
                      const stops = getOutboundStops(offer)
                      const durationMinutes = getOutboundDurationMinutes(offer)
                      const originCountryCode = getCountryCodeFromAirport(originCode)
                      const destCountryCode = getCountryCodeFromAirport(destCode)
                      const originFlagUrl = getFlagUrl(originCountryCode)
                      const destFlagUrl = getFlagUrl(destCountryCode)

                      const durationLabel = (() => {
                        if (!durationMinutes || durationMinutes <= 0) return '-'
                        const hours = Math.floor(durationMinutes / 60)
                        const mins = durationMinutes % 60
                        if (hours && mins) return `${hours}h ${mins}m`
                        if (hours) return `${hours}h`
                        return `${mins}m`
                      })()

                      return (
                        <li
                          key={offer.id}
                          onClick={() => openFlightDetails(offer)}
                          className={
                            isDark
                              ? 'flex cursor-pointer flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 transition hover:border-sky-500 hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between'
                              : 'flex cursor-pointer flex-col gap-2 rounded-xl border border-indigo-100 bg-white p-4 transition hover:border-indigo-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between shadow-sm shadow-indigo-100/60'
                          }
                        >
                          <div>
                            <p
                              className={
                                isDark
                                  ? 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-200'
                                  : 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-700'
                              }
                            >
                              {originFlagUrl && (
                                <img
                                  src={originFlagUrl}
                                  alt={originCountryCode || ''}
                                  className="h-3.5 w-5 rounded-sm object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              {originCode} →{' '}
                              {destFlagUrl && (
                                <img
                                  src={destFlagUrl}
                                  alt={destCountryCode || ''}
                                  className="ml-1 h-3.5 w-5 rounded-sm object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              {destCode}{' '}
                              <span
                                className={
                                  isDark
                                    ? 'ml-2 rounded-full border border-slate-600 bg-slate-800 px-2 py-[2px] text-[10px] uppercase tracking-wide'
                                    : 'ml-2 rounded-full border border-transparent bg-linear-to-r from-sky-500 via-indigo-100 to-fuchsia-500 px-2 py-[2px] text-[10px] uppercase tracking-wide text-slate-900 shadow-sm'
                                }
                              >
                                {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                              </span>
                            </p>
                            <p
                              className={
                                isDark
                                  ? 'mt-1 text-[11px] text-slate-400'
                                  : 'mt-1 text-[11px] text-slate-500'
                              }
                            >
                              {first?.departureTime} — {last?.arrivalTime}
                            </p>
                            <p
                              className={
                                isDark
                                  ? 'mt-1 text-[11px] text-slate-500'
                                  : 'mt-1 text-[11px] text-slate-500'
                              }
                            >
                              {offer.airline} · {offer.segments.length} segment(s) · Total time{' '}
                              {durationLabel}
                              {offer.cabinClass && (
                                <> · {offer.cabinClass.replace('_', ' ')}</>
                              )}
                              {offer.baggageAllowance && offer.baggageAllowance.checkedBags > 0 && (
                                <> · {offer.baggageAllowance.checkedBags} checked bag{offer.baggageAllowance.checkedBags > 1 ? 's' : ''}</>
                              )}
        </p>
      </div>
                          <div className="text-right">
                            <p
                              className={
                                isDark
                                  ? 'text-sm font-semibold text-slate-50'
                                  : 'text-sm font-semibold text-indigo-600'
                              }
                            >
                              {offer.currency} {offer.price.toFixed(0)}
                            </p>
                            {offer.travelerPricings && offer.travelerPricings.length > 0 ? (
                              <div className="mt-1 space-y-0.5 text-[10px]">
                                {(() => {
                                  const adults = offer.travelerPricings.filter(
                                    (tp) => tp.travelerType === 'ADULT',
                                  )
                                  const children = offer.travelerPricings.filter(
                                    (tp) => tp.travelerType === 'CHILD',
                                  )
                                  return (
                                    <>
                                      {adults.length > 0 && (
                                        <p
                                          className={
                                            isDark
                                              ? 'text-slate-400'
                                              : 'text-slate-500'
                                          }
                                        >
                                          Adult{adults.length > 1 ? 's' : ''}:{' '}
                                          {adults[0].currency} {adults[0].price.toFixed(0)}
                                          {adults.length > 1 && ` × ${adults.length}`}
                                        </p>
                                      )}
                                      {children.length > 0 && (
                                        <p
                                          className={
                                            isDark
                                              ? 'text-slate-400'
                                              : 'text-slate-500'
                                          }
                                        >
                                          Child{children.length > 1 ? 'ren' : ''}:{' '}
                                          {children[0].currency} {children[0].price.toFixed(0)}
                                          {children.length > 1 && ` × ${children.length}`}
                                        </p>
                                      )}
                                    </>
                                  )
                                })()}
                              </div>
                            ) : (
                              <p
                                className={
                                  isDark
                                    ? 'mt-1 text-[11px] text-slate-500'
                                    : 'mt-1 text-[11px] text-slate-400'
                                }
                              >
                                total
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </main>
        )}
        
        <Footer isDark={isDark} />
      </div>
    </div>
  )
}

export default App
