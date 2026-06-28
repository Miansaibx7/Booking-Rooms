import "./AllRooms.css";
import RoomCard from "./RoomDetails/RoomCard";
import { useState, useEffect } from "react";

const normalizeRoomsResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const AllRooms = () => {
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    async function fetchRoomData() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/rooms/",
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch room data.");
        }

        const data = await response.json();
        const rooms = normalizeRoomsResponse(data);
        setRoomData(rooms);
      } catch (error) {
        console.error("Error during fetch:", error);
        setRoomData([]);
      }
    }
    fetchRoomData();
  }, []);
  return (
    <div className="all-rooms-container">
      <h2>All Rooms</h2>
      <div className="rooms-list">
        {roomData.length > 0 ? (
          roomData.map((room) => <RoomCard key={room.id} room={room} />)
        ) : (
          <p>No rooms found.</p>
        )}
      </div>
    </div>
  );
};

export default AllRooms;
