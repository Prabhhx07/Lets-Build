import { createContext } from "react";

// Scale factor applied to the macOS screen (1 = real size). react-draggable needs it to drag correctly.
export const ScreenScale = createContext(1);
