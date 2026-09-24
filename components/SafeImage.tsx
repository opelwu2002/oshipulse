"use client";

import React from "react";
import SmartAvatar, { SmartAvatarProps } from "./SmartAvatar";

export interface SafeImageProps extends SmartAvatarProps {
  fallbackText?: string;
  unoptimized?: boolean;
}

/**
 * SafeImage 保持向下相容包裝，底層整合 SmartAvatar 高可用性智慧圖片架構
 */
export default function SafeImage({
  src,
  alt = "OshiPulse 應援視覺",
  className = "",
  fallbackText,
  fill = false,
  priority = false,
  ...props
}: SafeImageProps) {
  return (
    <SmartAvatar
      src={src}
      alt={alt}
      className={className}
      fallbackInitial={fallbackText ? fallbackText.trim()[0] : undefined}
      fill={fill}
      priority={priority}
      {...props}
    />
  );
}
export { SmartAvatar };

