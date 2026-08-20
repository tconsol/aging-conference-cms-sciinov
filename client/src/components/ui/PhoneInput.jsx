import { useState } from 'react';
import { getCountryISO } from '../../utils/countries';

export default function PhoneInput({
  register,
  name = 'phone',
  countryValue,
  label = 'Phone',
  required = false,
  error,
  placeholder = 'Phone number',
}) {
  const [focused, setFocused] = useState(false);
  const iso = getCountryISO(countryValue);

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className="flex rounded-xl overflow-hidden border bg-slate-50 transition-all"
        style={{
          borderColor: focused ? 'var(--brand)' : '#e2e8f0',
          boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)' : 'none',
        }}
      >
        <span className="flex items-center justify-center px-3 border-r border-slate-200 shrink-0 bg-slate-50 select-none w-12">
          {iso ? (
            <img
              src={`https://flagcdn.com/w20/${iso}.png`}
              srcSet={`https://flagcdn.com/w40/${iso}.png 2x`}
              alt={countryValue}
              width={20}
              height={15}
              className="rounded-sm object-cover"
            />
          ) : (
            <span className="text-slate-400 text-base">🌐</span>
          )}
        </span>
        <input
          type="tel"
          {...register(name)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
