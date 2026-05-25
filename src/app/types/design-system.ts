export interface DesignSystem {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  typography?: {
    h1Size?: number;
    h2Size?: number;
    h3Size?: number;
    bodySize?: number;
    h1Weight?: number;
    h2Weight?: number;
    h3Weight?: number;
    lineHeight?: number;
  };
  spacing?: {
    slideTop?: number;
    slideBottom?: number;
    slideLeft?: number;
    slideRight?: number;
    contentGap?: number;
    listItemGap?: number;
  };
  layout: {
    titleAlignment: "left" | "center" | "right";
    contentPadding: "compact" | "normal" | "spacious";
  };
  corners?: {
    radius?: number;
  };
  shadows?: {
    enabled?: boolean;
    blur?: number;
  };
  logo?: string;
}

export const DEFAULT_DESIGN_SYSTEMS: DesignSystem[] = [
  {
    id: "corporate",
    name: "コーポレート",
    colors: {
      primary: "#1e40af",
      secondary: "#64748b",
      background: "#ffffff",
      text: "#1e293b",
      accent: "#3b82f6",
    },
    fonts: {
      heading: "system-ui, sans-serif",
      body: "system-ui, sans-serif",
    },
    layout: {
      titleAlignment: "left",
      contentPadding: "normal",
    },
  },
  {
    id: "modern",
    name: "モダン",
    colors: {
      primary: "#0f172a",
      secondary: "#475569",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#06b6d4",
    },
    fonts: {
      heading: "system-ui, sans-serif",
      body: "system-ui, sans-serif",
    },
    layout: {
      titleAlignment: "center",
      contentPadding: "spacious",
    },
  },
  {
    id: "creative",
    name: "クリエイティブ",
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      background: "#faf5ff",
      text: "#581c87",
      accent: "#c026d3",
    },
    fonts: {
      heading: "system-ui, sans-serif",
      body: "system-ui, sans-serif",
    },
    layout: {
      titleAlignment: "center",
      contentPadding: "spacious",
    },
  },
  {
    id: "minimal",
    name: "ミニマル",
    colors: {
      primary: "#000000",
      secondary: "#737373",
      background: "#ffffff",
      text: "#171717",
      accent: "#404040",
    },
    fonts: {
      heading: "system-ui, sans-serif",
      body: "system-ui, sans-serif",
    },
    layout: {
      titleAlignment: "left",
      contentPadding: "compact",
    },
  },
];
