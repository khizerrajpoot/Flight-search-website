import { useState } from 'react'

type DateFieldProps = {
  label: string
  value: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  placeholder?: string
  isDark?: boolean
}

export function DateField({
  label,
  value,
  onChange,
  minDate,
  placeholder,
  isDark = true,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => value ?? new Date())

  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startDay = startOfMonth.getDay() // 0-6

  const days: (Date | null)[] = []
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
  }

  const isBeforeMin = (date: Date) => {
    if (!minDate) return false
    const d1 = new Date(date)
    const d2 = new Date(minDate)
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    return d1.getTime() < d2.getTime()
  }

  const formatDisplay = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="relative">
      <label
        className={
          isDark
            ? 'text-xs font-medium text-slate-300'
            : 'text-xs font-medium text-slate-700'
        }
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          isDark
            ? 'mt-1 inline-flex h-11 w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 text-left text-xs text-slate-100 outline-none ring-0 transition-transform duration-150 ease-out focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 hover:-translate-y-0.5'
            : 'mt-1 inline-flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs text-slate-900 outline-none ring-0 transition-transform duration-150 ease-out focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 hover:-translate-y-0.5'
        }
      >
        <span className={value ? '' : isDark ? 'text-slate-500' : 'text-slate-400'}>
          {value ? formatDisplay(value) : placeholder ?? 'Select date'}
        </span>
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>▾</span>
      </button>

      {open && (
        <div
          className={
            isDark
              ? 'datepicker-popper absolute z-50 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs shadow-xl shadow-slate-950/70 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
              : 'datepicker-popper absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-xl shadow-slate-200/70 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
          }
        >
          <div
            className={
              isDark
                ? 'mb-2 flex items-center justify-between text-slate-300'
                : 'mb-2 flex items-center justify-between text-slate-700'
            }
          >
            <button
              type="button"
              className={
                isDark
                          ? 'rounded-full p-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 active:scale-95'
                          : 'rounded-full p-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0 active:scale-95'
              }
              onClick={() =>
                setViewDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
            >
              ‹
            </button>
            <span className="font-medium">
              {viewDate.toLocaleString('default', { month: 'short' })}{' '}
              {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              className={
                isDark
                          ? 'rounded-full p-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 active:scale-95'
                          : 'rounded-full p-1 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0 active:scale-95'
              }
              onClick={() =>
                setViewDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
            >
              ›
            </button>
          </div>
          <div
            className={
              isDark
                ? 'mb-1 grid grid-cols-7 gap-1 text-[10px] text-slate-500'
                : 'mb-1 grid grid-cols-7 gap-1 text-[10px] text-slate-500'
            }
          >
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={idx} />
              }
              const disabled = isBeforeMin(day)
              const isSelected =
                value && day.toDateString() === value.toDateString()

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return
                    onChange(day)
                    setOpen(false)
                  }}
                  className={`h-7 w-7 rounded-full ${
                    disabled
                      ? isDark
                        ? 'cursor-not-allowed text-slate-700'
                        : 'cursor-not-allowed text-slate-300'
                      : isDark
                        ? 'hover:bg-sky-500/20'
                        : 'hover:bg-sky-500/10'
                  } ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950'
                      : isDark
                        ? 'text-slate-200'
                        : 'text-slate-700'
                  }`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

