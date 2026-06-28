import { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContextObject";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(UserContext);

  const baseURL = "http://127.0.0.1:8000";

  useEffect(() => {
    if (!user) {
      setGroupedDates({});
      setErrorMessage("");
      return;
    }

    async function fetchDates() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        const data = await response.json();
        
        // Log to console so you can see exactly what Django is sending
        console.log("Raw API Data:", data); 
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching dates:", error);
        setErrorMessage("Could not load your bookings. Please try again.");
        return [];
      } finally {
        setIsLoading(false);
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates();

      const processDates = (dates) => {
        const rangesByYear = {};
        const entriesByRoom = {};

        // 1. Group entries safely checking all possible backend field names
        dates.forEach((entry) => {
          // Check multiple possible date fields
          const dateStr = entry.date || entry.start_date || entry.booking_date || entry.day;
          if (!dateStr) return; // Skip if absolutely no date is found
          
          // Check multiple possible room ID fields
          const roomId = entry.room?.id || entry.room_id || entry.room || "unknown_room";

          if (!entriesByRoom[roomId]) {
            entriesByRoom[roomId] = [];
          }
          entriesByRoom[roomId].push({ ...entry, _normalizedDate: dateStr });
        });

        // 2. Build continuous date ranges
        Object.values(entriesByRoom).forEach((roomEntries) => {
          const sortedEntries = [...roomEntries].sort((a, b) =>
            a._normalizedDate.localeCompare(b._normalizedDate)
          );

          let currentRange = null;

          sortedEntries.forEach((entry) => {
            const dateStr = entry._normalizedDate;
            const date = new Date(`${dateStr}T00:00:00`);

            if (isNaN(date.getTime())) return;

            const yearLabel = `${date.getFullYear()}`;

            if (!currentRange) {
              currentRange = {
                startDate: dateStr,
                endDate: dateStr,
                originalData: entry,
                yearLabel,
              };
            } else {
              const prevDate = new Date(`${currentRange.endDate}T00:00:00`);
              prevDate.setDate(prevDate.getDate() + 1);

              const isConsecutive =
                date.toISOString().split("T")[0] === prevDate.toISOString().split("T")[0];
              const isSameYear = yearLabel === currentRange.yearLabel;

              if (isConsecutive && isSameYear) {
                currentRange.endDate = dateStr;
              } else {
                if (!rangesByYear[currentRange.yearLabel]) {
                  rangesByYear[currentRange.yearLabel] = [];
                }
                rangesByYear[currentRange.yearLabel].push(currentRange);

                currentRange = {
                  startDate: dateStr,
                  endDate: dateStr,
                  originalData: entry,
                  yearLabel,
                };
              }
            }
          });

          if (currentRange) {
            if (!rangesByYear[currentRange.yearLabel]) {
              rangesByYear[currentRange.yearLabel] = [];
            }
            rangesByYear[currentRange.yearLabel].push(currentRange);
          }
        });

        return rangesByYear;
      };

      setGroupedDates(processDates(fetchedDates));
    }

    processAndSetDates();
  }, [user]);

  // Deep check for username (handles nested Django user objects)
  const displayUserName = 
    user?.username || 
    user?.first_name || 
    user?.name || 
    user?.user?.username || 
    user?.user?.first_name || 
    "Guest";

  return (
    <div className="bookings-dashboard">
      {user && (
        <div className="bookings-header">
          <div className="header-content">
            <h1 className="header-title">Welcome back, {displayUserName}!</h1>
            <p className="header-subtitle">Here is a summary of your upcoming reservations.</p>
          </div>
        </div>
      )}

      <div className="bookings-content">
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Retrieving your bookings...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="error-state">
            <p>{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && user && Object.keys(groupedDates).length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h2>No active bookings</h2>
            <p>You don't have any room reservations at the moment.</p>
          </div>
        )}

        {Object.keys(groupedDates)
          .sort((a, b) => b - a)
          .map((year) => (
            <div key={year} className="booking-year-section">
              <div className="year-divider">
                <span className="year-badge">{year}</span>
                <div className="year-line"></div>
              </div>

              <div className="booking-cards-grid">
                {groupedDates[year].map((range, index) => {
                  const entry = range.originalData;
                  
                  // Extract image checking all possible backend names
                  const originalImage = entry.room?.image || entry.room_image || entry.image;
                  const imageUrl = originalImage
                    ? originalImage.startsWith("http")
                      ? originalImage
                      : `${baseURL}${originalImage}`
                    : null;

                  // Extract room name checking all possible backend names
                  const roomName = 
                    entry.room?.name || 
                    entry.room_name || 
                    (typeof entry.room === 'string' ? entry.room : `Room ID: ${entry.room?.id || entry.room_id || "Unknown"}`);

                  return (
                    <div key={index} className="premium-booking-card">
                      {imageUrl && (
                        <div className="card-image-container">
                          <img
                            src={imageUrl}
                            alt={roomName}
                            className="card-image"
                          />
                        </div>
                      )}
                      
                      <div className="card-body">
                        <div className="card-header">
                          <h3 className="room-name">{roomName}</h3>
                          <span className="status-badge">Confirmed</span>
                        </div>

                        <div className="booking-dates">
                          <div className="date-box">
                            <span className="date-label">Check-in</span>
                            <span className="date-value">
                              {new Date(range.startDate).toLocaleDateString("hu")}
                            </span>
                          </div>
                          <div className="date-arrow">➔</div>
                          <div className="date-box">
                            <span className="date-label">Check-out</span>
                            <span className="date-value">
                              {new Date(range.endDate).toLocaleDateString("hu")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OccupiedDatesDisplay;