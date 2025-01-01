import React from "react";

const LocalLoading = (props) => {
  const { className } = props;
  return (
    <div
      className={`${className} loading absolute z-[10] flex h-full w-full items-center justify-center bg-[var(--loading-color)] transition-opacity duration-[2000ms]`}
    >
      <div className="loader">
        <svg class="circular" viewBox="25 25 50 50">
          <circle
            class="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke-width="2"
            stroke-miterlimit="10"
          />
        </svg>
      </div>
    </div>
  );
};

export default LocalLoading;