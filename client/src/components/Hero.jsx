export default function Hero({ search, onSearchChange, onFindEvents }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onFindEvents();
  };

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero__title">
        Plan Your Perfect Event with Evantor
      </h1>
      <form className="hero__search" onSubmit={handleSubmit} role="search" noValidate>
        <label htmlFor="hero-location" className="sr-only">
          Location
        </label>
        <input
          id="hero-location"
          type="text"
          className="hero__input"
          placeholder="Location"
          value={search.location}
          onChange={(e) => onSearchChange({ ...search, location: e.target.value })}
          aria-label="Search by location"
        />
        <label htmlFor="hero-date" className="sr-only">
          Date
        </label>
        <input
          id="hero-date"
          type="date"
          className="hero__input"
          value={search.date}
          onChange={(e) => onSearchChange({ ...search, date: e.target.value })}
          aria-label="Filter by date"
        />
        <label htmlFor="hero-category" className="sr-only">
          Category
        </label>
        <select
          id="hero-category"
          className="hero__select"
          value={search.category}
          onChange={(e) => onSearchChange({ ...search, category: e.target.value })}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          <option value="Technology">Technology</option>
          <option value="Music">Music</option>
          <option value="Business">Business</option>
          <option value="Wellness">Wellness</option>
          <option value="Food & Drink">Food & Drink</option>
          <option value="Design">Design</option>
        </select>
        <button type="submit" className="btn btn-primary hero__btn">
          Find Events
        </button>
      </form>
    </section>
  );
}
