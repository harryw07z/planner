import { cn, getPriorityColorClass } from "@/lib/utils";
import { Feature, PriorityLevel } from "@/lib/types";
import { useState } from "react";

interface FeatureCardProps {
  feature: Feature;
  isBacklog?: boolean;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, feature: Feature) => void;
}

const FeatureCard = ({
  feature,
  isBacklog = false,
  isDraggable = true,
  onDragStart,
}: FeatureCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, feature);
    }
    setIsDragging(true);
    // Set data
    e.dataTransfer.setData("application/json", JSON.stringify(feature));
    // Create a ghost image
    const ghostElement = document.createElement("div");
    ghostElement.classList.add("feature-card-ghost");
    ghostElement.textContent = feature.name;
    document.body.appendChild(ghostElement);
    ghostElement.style.position = "absolute";
    ghostElement.style.top = "-1000px";
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Remove any ghost elements
    const ghost = document.querySelector(".feature-card-ghost");
    if (ghost) {
      ghost.remove();
    }
  };

  // Different styles for backlog vs calendar features
  const cardClasses = cn(
    "feature-card border rounded shadow-sm transition-opacity",
    isBacklog
      ? "bg-white border-neutral-200 p-3 mb-3"
      : `${getPriorityColorClass(feature.priority)} border-${
          feature.priority === "high"
            ? "primary"
            : feature.priority === "medium"
            ? "secondary"
            : "neutral-300"
        } p-1 mb-1 text-xs`,
    isDragging && "opacity-50",
    isDraggable && "cursor-grab active:cursor-grabbing"
  );

  return (
    <div
      className={cardClasses}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h4 className={cn("font-medium", isBacklog ? "text-sm mb-1" : "")}>
        {feature.name}
      </h4>
      {isBacklog && (
        <div className="flex items-center">
          <span
            className={cn(
              "inline-block px-2 py-0.5 rounded text-xs",
              getPriorityColorClass(feature.priority)
            )}
          >
            {feature.priority === "high"
              ? "High"
              : feature.priority === "medium"
              ? "Medium"
              : "Low"}
          </span>
          <span className="text-xs text-neutral-500 ml-auto">
            {feature.duration} days
          </span>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
