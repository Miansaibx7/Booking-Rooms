import { useState } from "react";

const RoomImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeImages = Array.isArray(images) ? images : [];
  const hasImages = safeImages.length > 0;

  const safeIndex = hasImages ? currentIndex % safeImages.length : 0;
  const activeImage = hasImages ? safeImages[safeIndex] : null;
  const rawImageSrc =
    activeImage && typeof activeImage.image === "string"
      ? activeImage.image.trim()
      : "";
  const activeImageSrc = rawImageSrc.startsWith("/media/")
    ? `http://127.0.0.1:8000${rawImageSrc}`
    : rawImageSrc;

  const handlePrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? safeImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === safeImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="image-slider">
      <button onClick={handlePrev} disabled={!hasImages}>
        &#10094;
      </button>
      {hasImages ? (
        <img src={activeImageSrc} alt="Room" className="slider-image" />
      ) : (
        <div className="slider-image no-image">No image available</div>
      )}
      <button onClick={handleNext} disabled={!hasImages}>
        &#10095;
      </button>
    </div>
  );
};

export default RoomImageSlider;
