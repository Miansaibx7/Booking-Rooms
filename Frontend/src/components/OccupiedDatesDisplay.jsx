import { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContextObject";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      setGroupedDates({});
      setErrorMessage("");
      return;
    }

    const baseURL = "http://127.0.0.1:8000";
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
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error during fetching dates:", error);
        setErrorMessage("Could not load bookings.");
        return [];
      } finally {
        setIsLoading(false);
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates(); // Wait for fetchDates to resolve

      // Process dates into grouped ranges
      const processDates = (dates) => {
        // Extract only the date strings
        const dateStrings = dates.map((entry) => entry.date);

        // Ensure dates are sorted chronologically
        const sortedDates = [...dateStrings].sort();

        const ranges = {};
        let currentYear = "";
        let currentRange = null;

        sortedDates.forEach((dateStr) => {
          // Parse the date explicitly to ensure it's valid
          const date = new Date(`${dateStr}T00:00:00`); // Add `T00:00:00` to avoid parsing issues

          if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateStr);
            return; // Skip invalid dates
          }

          const yearLabel = `${date.getFullYear()}. year`;

          if (yearLabel !== currentYear) {
            // If month changes, finalize the previous range
            if (currentRange) {
              if (!ranges[currentYear]) ranges[currentYear] = [];
              ranges[currentYear].push(currentRange);
            }
            currentYear = yearLabel;
            currentRange = { startDate: dateStr, endDate: dateStr };
          } else {
            // Check if the date is consecutive
            const prevDate = new Date(`${currentRange.endDate}T00:00:00`);
            prevDate.setDate(prevDate.getDate() + 1); // Add 1 day to check continuity

            if (
              date.toISOString().split("T")[0] ===
              prevDate.toISOString().split("T")[0]
            ) {
              // Extend the current range
              currentRange.endDate = dateStr;
            } else {
              // Finalize the current range and start a new one
              if (!ranges[currentYear]) ranges[currentYear] = [];
              ranges[currentYear].push(currentRange);
              currentRange = { startDate: dateStr, endDate: dateStr };
            }
          }
        });

        // Finalize the last range
        if (currentRange) {
          if (!ranges[currentYear]) ranges[currentYear] = [];
          ranges[currentYear].push(currentRange);
        }

        return ranges;
      };

      setGroupedDates(processDates(fetchedDates));
    }

    processAndSetDates(); // Fetch and process dates
  }, [user]); // Re-run when `user` changes

  return (
    <div className="occupied-dates-container">
      {isLoading ? <p>Loading bookings...</p> : null}
      {!isLoading && errorMessage ? <p>{errorMessage}</p> : null}
      {!isLoading &&
      !errorMessage &&
      user &&
      Object.keys(groupedDates).length === 0 ? (
        <p>No bookings found.</p>
      ) : null}
      {Object.keys(groupedDates).map((month) => (
        <div key={month} className="month-section">
          <h2 className="month-title">{month}</h2>
          <div className="date-cards">
            {groupedDates[month].map((range, index) => (
              <div key={index} className="date-card">
                <p className="date-range">
                  {new Date(range.startDate).toLocaleDateString("hu")} -{" "}
                  {new Date(range.endDate).toLocaleDateString("hu")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupiedDatesDisplay;
