import { SearchIcon, XIcon } from './icons.jsx'

export function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  return (
    <div className="search">
      <SearchIcon size={18} className="search__icon" />
      <input
        type="search"
        className="search__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value ? (
        <button
          type="button"
          className="search__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <XIcon size={14} />
        </button>
      ) : null}
    </div>
  )
}