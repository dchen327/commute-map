// components/Legend.tsx
import { durationColors } from "@/app/utils/colorUtils";

const Legend = () => (
  <div className="absolute bottom-3 left-3 bg-white p-4 rounded-lg shadow-md text-sm">
    <h3 className="font-semibold text-center mb-2">Time (min)</h3>
    {durationColors.map(({ maxDuration, color }, index) => (
      <div key={index} className="flex items-center mb-1">
        <span
          className="w-4 h-4 rounded-sm mr-2"
          style={{ backgroundColor: color }}
        ></span>
        <span>
          {index === durationColors.length - 1
            ? `${durationColors[durationColors.length - 2].maxDuration}+`
            : `${
                index === 0 ? 0 : durationColors[index - 1].maxDuration
              }-${maxDuration}`}
        </span>
      </div>
    ))}
  </div>
);

export default Legend;
