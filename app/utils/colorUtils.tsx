// Define color ranges and their corresponding durations
export const durationColors = [
  { maxDuration: 5, color: "#8F00CC" }, // 0-5 minutes
  { maxDuration: 10, color: "#0000FF" }, // 5-10 minutes
  { maxDuration: 15, color: "#00C3FF" }, // 10-15 minutes
  { maxDuration: 20, color: "#00FFB7" }, // 15-20 minutes
  { maxDuration: 25, color: "#00FF00" }, // 20-25 minutes
  { maxDuration: 30, color: "#FFFF00" }, // 25-30 minutes
  { maxDuration: 35, color: "#FFA500" }, // 30-35 minutes
  { maxDuration: Infinity, color: "#FF0000" }, // 35+ minutes
];

// Function to get color based on duration
export const getColorForDuration = (duration: number) => {
  const colorEntry = durationColors.find(
    ({ maxDuration }) => duration <= maxDuration
  );
  return colorEntry ? colorEntry.color : "#FF0000"; // Default to red if no match found
};
