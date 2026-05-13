import { useContext } from "react";
import RoomImageSlider from "./RoomImageSlider";
import RoomInfo from "./Roominfo";
import deluxe1 from "../../assets/images/deluxe1.jpg";
import deluxe2 from "../../assets/images/deluxe2.jpg";
import familySuite1 from "../../assets/images/family_suite1.jpg";
import familySuite2 from "../../assets/images/family_suite2.webp";
import familySuite3 from "../../assets/images/family_suite3.jpg";
import standard1 from "../../assets/images/standard1.jpg";
import standard2 from "../../assets/images/standard2.webp";

import "./RoomDetails.css";
import { UserContext } from "../UserContextObject";
import { useNavigate } from "react-router-dom";

const RoomCard = ({ room, selectedDateRange, onBookingSuccess }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const baseURL = "http://127.0.0.1:8000";

  const getFallbackImages = () => {
    if (room.type === "delux") {
      return [{ image: deluxe1 }, { image: deluxe2 }];
    }
    if (room.type === "suite") {
      return [{ image: familySuite1 }, { image: familySuite2 }, { image: familySuite3 }];
    }
    return [{ image: standard1 }, { image: standard2 }];
  };

  const normalizedApiImages = Array.isArray(room.images)
    ? room.images
        .map((img) => {
          if (typeof img === "string") {
            return { image: img };
          }
          if (img && typeof img === "object") {
            const source = img.image || img.url || img.src || "";
            return typeof source === "string" && source.trim() !== ""
              ? { image: source }
              : null;
          }
          return null;
        })
        .filter(Boolean)
    : [];

  const resolvedImages =
    normalizedApiImages.length > 0 ? normalizedApiImages : getFallbackImages();

  const handleBooking = async (roomId, selectedDateRange) => {
    if (!user) {
      return navigate("/auth");
    }
    if (!selectedDateRange?.startDate) {
      return;
    }

    const toIsoLocalDate = (dateValue) => {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const roomUrl = `${baseURL}/rooms/${roomId}/`;
    const userUrl = `${baseURL}/users/${user.user.id}/`;
    const startDate = new Date(selectedDateRange.startDate);
    const endDate = new Date(
      selectedDateRange.endDate ?? selectedDateRange.startDate
    );
    let allSuccessful = true;

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
          body: JSON.stringify({
            room: roomUrl,
            user: userUrl,
            date: toIsoLocalDate(currentDate),
          }),
        });
        if (!response.ok) {
          allSuccessful = false;
          break;
        }
        await response.json();
      } catch (error) {
        allSuccessful = false;
        console.error("Error during booking:", error);
        break;
      }
    }

    if (allSuccessful) {
      onBookingSuccess();
    }
  };
  return (
    <div className="room-card">
      <RoomImageSlider images={resolvedImages} />
      <RoomInfo room={room} />
      {selectedDateRange ? (
        <button
          className="book-room-button"
          onClick={() => handleBooking(room.id, selectedDateRange)}
          disabled={!selectedDateRange.startDate}
        >
          Book Room
        </button>
      ) : null}
    </div>
  );
};

export default RoomCard;
