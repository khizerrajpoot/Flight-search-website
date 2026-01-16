import type { FlightOffer } from '../types/flights'

type FlightDetailsProps = {
  flight: FlightOffer
  originCode: string
  destinationCode: string
  isDark: boolean
  loading: boolean
  durationMinutes: number
  onBack: () => void
}

export function FlightDetails({
  flight,
  originCode,
  destinationCode,
  isDark,
  loading,
  durationMinutes,
  onBack,
}: FlightDetailsProps) {
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

  const formatDuration = (mins: number): string => {
    if (!mins || mins <= 0) return '-'
    const hours = Math.floor(mins / 60)
    const rest = mins % 60
    if (hours && rest) return `${hours}h ${rest}m`
    if (hours) return `${hours}h`
    return `${rest}m`
  }

  const originCountryCode = getCountryCodeFromAirport(originCode)
  const destCountryCode = getCountryCodeFromAirport(destinationCode)
  const originFlagUrl = getFlagUrl(originCountryCode)
  const destFlagUrl = getFlagUrl(destCountryCode)

  return (
    <section
      className={
        isDark
          ? 'flex-1 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur'
          : 'flex-1 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-indigo-200/60 backdrop-blur-xl'
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p
            className={
              isDark
                ? 'text-xs uppercase tracking-[0.2em] text-slate-400'
                : 'text-xs uppercase tracking-[0.25em] text-indigo-500'
            }
          >
            Flight details
          </p>
          <h2
            className={
              isDark
                ? 'mt-1 flex items-center gap-2 text-lg font-semibold text-slate-100 sm:text-2xl'
                : 'mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-2xl'
            }
          >
            {originFlagUrl && (
              <img
                src={originFlagUrl}
                alt={originCountryCode || ''}
                className="h-5 w-7 rounded-sm object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            {originCode} →
            {destFlagUrl && (
              <img
                src={destFlagUrl}
                alt={destCountryCode || ''}
                className="ml-1 h-5 w-7 rounded-sm object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            {destinationCode}
          </h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className={
            isDark
              ? 'rounded-full border border-slate-600 bg-transparent px-3 py-1 text-xs text-slate-200 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:border-sky-500 hover:text-sky-200 active:translate-y-0 active:scale-95'
              : 'rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md active:translate-y-0 active:scale-95'
          }
        >
          ← Back to results
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
          <video
            src="/Plane.mp4"
            className={
              isDark
                ? 'h-24 w-24 rounded-full object-cover shadow-lg shadow-indigo-500/50'
                : 'h-24 w-24 rounded-full object-cover shadow-lg shadow-indigo-300/70'
            }
            autoPlay
            loop
            muted
            playsInline
          />
          <p
            className={
              isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500'
            }
          >
            Loading flight details…
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs sm:text-sm">
          <div
            className={
              isDark
                ? 'rounded-2xl border border-slate-800 bg-slate-950/60 p-4'
                : 'rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm shadow-indigo-100/60'
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p
                  className={
                    isDark
                      ? 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-200'
                      : 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-800'
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
                  {originCode} →
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
                  {destinationCode}
                </p>
                <p
                  className={
                    isDark
                      ? 'mt-1 text-[11px] text-slate-400'
                      : 'mt-1 text-[11px] text-slate-500'
                  }
                >
                  {flight.segments[0]?.departureTime} —{' '}
                  {flight.segments[flight.segments.length - 1]?.arrivalTime}
                </p>
                <p
                  className={
                    isDark
                      ? 'mt-1 text-[11px] text-slate-500'
                      : 'mt-1 text-[11px] text-slate-500'
                  }
                >
                  Total flight time: {formatDuration(durationMinutes)}
                </p>
                {(flight.cabinClass || flight.baggageAllowance) && (
                  <p
                    className={
                      isDark
                        ? 'mt-1 text-[11px] text-slate-500'
                        : 'mt-1 text-[11px] text-slate-500'
                    }
                  >
                    {flight.cabinClass && (
                      <span className="mr-2">
                        Cabin: {flight.cabinClass.replace('_', ' ')}
                      </span>
                    )}
                    {flight.baggageAllowance && flight.baggageAllowance.checkedBags > 0 && (
                      <span>
                        Baggage: {flight.baggageAllowance.checkedBags} checked bag{flight.baggageAllowance.checkedBags > 1 ? 's' : ''}, {flight.baggageAllowance.carryOnBags} carry-on
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={
                    isDark
                      ? 'text-sm font-semibold text-indigo-400 sm:text-lg'
                      : 'text-sm font-semibold text-indigo-500 sm:text-lg'
                  }
                >
                  {flight.currency} {flight.price.toFixed(0)}
                </p>
                {flight.travelerPricings && flight.travelerPricings.length > 0 ? (
                  <div className="mt-1 space-y-0.5 text-[10px]">
                    {(() => {
                      const adults = flight.travelerPricings.filter(
                        (tp) => tp.travelerType === 'ADULT',
                      )
                      const children = flight.travelerPricings.filter(
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
                              Adult{adults.length > 1 ? 's' : ''}: {adults[0].currency}{' '}
                              {adults[0].price.toFixed(0)}
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
                              Child{children.length > 1 ? 'ren' : ''}: {children[0].currency}{' '}
                              {children[0].price.toFixed(0)}
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
            </div>
          </div>

          <div className="space-y-3">
            {flight.segments.map((seg, idx) => (
              <div
                key={`${seg.carrierCode}-${seg.flightNumber}-${idx}`}
                className={
                  isDark
                    ? 'rounded-2xl border border-slate-800 bg-slate-950/60 p-4'
                    : 'rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm shadow-indigo-100/60'
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      className={
                        isDark
                          ? 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-200'
                          : 'flex items-center gap-1.5 text-[11px] font-semibold text-slate-800'
                      }
                    >
                      {(() => {
                        const depCountryCode = getCountryCodeFromAirport(seg.departureAirport)
                        const arrCountryCode = getCountryCodeFromAirport(seg.arrivalAirport)
                        const depFlagUrl = getFlagUrl(depCountryCode)
                        const arrFlagUrl = getFlagUrl(arrCountryCode)
                        return (
                          <>
                            {depFlagUrl && (
                              <img
                                src={depFlagUrl}
                                alt={depCountryCode || ''}
                                className="h-3.5 w-5 rounded-sm object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            {seg.departureAirport} →
                            {arrFlagUrl && (
                              <img
                                src={arrFlagUrl}
                                alt={arrCountryCode || ''}
                                className="ml-1 h-3.5 w-5 rounded-sm object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            {seg.arrivalAirport}
                          </>
                        )
                      })()}
                    </p>
                    <p
                      className={
                        isDark
                          ? 'mt-1 text-[11px] text-slate-400'
                          : 'mt-1 text-[11px] text-slate-500'
                      }
                    >
                      {seg.departureTime} — {seg.arrivalTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        isDark
                          ? 'text-[11px] text-slate-400'
                          : 'text-[11px] text-slate-500'
                      }
                    >
                      {seg.carrierCode} · {seg.flightNumber}
                    </p>
                    <p
                      className={
                        isDark
                          ? 'text-[11px] text-slate-500'
                          : 'text-[11px] text-slate-400'
                      }
                    >
                      Duration: {seg.duration.replace('PT', '').toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

