interface AdBannerProps {
  size: "large" | "medium" | "small" | "skyscraper";
  position: "header" | "footer" | "sidebar" | "content";
  className?: string;
}

const AdBanner = ({ size, position, className = "" }: AdBannerProps) => {
  const getSizeDimensions = () => {
    switch (size) {
      case "large":
        return "728x90"; // Leaderboard
      case "medium":
        return "300x250"; // Medium Rectangle
      case "small":
        return "320x50"; // Mobile Banner
      case "skyscraper":
        return "160x600"; // Wide Skyscraper
      default:
        return "300x250";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "large":
        return "h-[90px] max-w-[728px]";
      case "medium":
        return "h-[250px] max-w-[300px]";
      case "small":
        return "h-[50px] max-w-[320px]";
      case "skyscraper":
        return "h-[600px] max-w-[160px]";
      default:
        return "h-[250px] max-w-[300px]";
    }
  };

  return (
    <div className={`bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center ${getSizeClasses()} ${className}`}>
      <div className="text-center p-4">
        <div className="text-xs text-muted-foreground mb-1">Advertisement</div>
        <div className="text-sm text-muted-foreground font-mono">
          [{getSizeDimensions()}] - {position}
        </div>
        <div className="text-xs text-muted-foreground/70 mt-1">
          AdSense Slot
        </div>
      </div>
    </div>
  );
};

export default AdBanner;