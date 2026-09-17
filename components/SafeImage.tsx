"use client";

import React, { useState } from "react";

export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23334155"/><text x="50%" y="50%" fill="%2394a3b8" font-size="14" text-anchor="middle" dominant-baseline="central">OshiPulse</text></svg>';

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
};

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fill?: boolean;
  unoptimized?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function SafeImage({
  src,
  alt = "OshiPulse Image",
  className = "",
  fallbackSrc = FALLBACK_IMAGE,
  fill = false,
  unoptimized,
  priority,
  sizes,
  onError,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      (e.currentTarget as HTMLImageElement).src = fallbackSrc;
    }
    if (onError) {
      onError(e);
    }
  };

  const fillClasses = fill ? "absolute inset-0 w-full h-full object-cover" : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading={priority ? "eager" : "lazy"}
      className={`${fillClasses} ${className}`}
      {...props}
    />
  );
}
