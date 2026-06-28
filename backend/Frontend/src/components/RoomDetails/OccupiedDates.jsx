const OccupiedDates = ({ dates }) => {
  return (
    <div className="occupied-dates">
      <h4>Occupied Dates</h4>
      {dates.length > 0 ? (
        <ul>
          {dates.map((date, index) => (
            <li key={index}>
              {date.date} - {date.occupierInfo.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming reservations.</p>
      )}
    </div>
  );
};

export default OccupiedDates;
