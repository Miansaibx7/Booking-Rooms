const RoomInfo = ({ room }) => {
  return (
    <div className="room-info">
      <h2>{room.name}</h2>
      <p>
        <strong>Type:</strong> {room.type}
      </p>
      <p>
        <strong>Price per Night:</strong> {room.currency} {room.pricePerNight}
      </p>
      <p>
        <strong>Max Occupancy:</strong> {room.maxOccupancy} guests
      </p>
      <p className="description">{room.description}</p>
    </div>
  );
};

export default RoomInfo;
