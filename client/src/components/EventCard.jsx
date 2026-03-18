export default function EventCard({ event, onGetTickets }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const isFree = event.price === 0;

  return (
    <article className="event-card">
      <img
        src={event.image}
        alt=""
        className="event-card__image"
        loading="lazy"
        width="400"
        height="240"
      />
      <div className="event-card__body">
        <span className="event-card__category">{event.category}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <div className="event-card__meta">
          <span>📅 {formattedDate}</span>
          <span>🕐 {event.time}</span><br/>
          <span>📍 {event.location}</span>
        </div>
        <div className="event-card__footer">
          <span
            className={`event-card__price ${isFree ? 'event-card__price--free' : ''}`}
          >
            {isFree ? 'Free' : `LKR ${event.price.toLocaleString()}`}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onGetTickets(event)}
            aria-label={`Get tickets for ${event.title}`}
          >
            Get Tickets
          </button>
        </div>
      </div>
    </article>
  );
}
