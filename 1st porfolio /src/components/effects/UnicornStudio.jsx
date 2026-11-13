import { useEffect } from "react";

const SDK_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js";

let sdkPromise = null;
const loadSdk = () => {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.UnicornStudio?.init) return resolve(window.UnicornStudio);
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve(window.UnicornStudio);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return sdkPromise;
};

/** Full-bleed Unicorn Studio scene. Renders nothing visible if the scene can't load. */
export default function UnicornStudio({ projectId, className = "" }) {
  useEffect(() => {
    let cancelled = false;
    loadSdk()
      .then((us) => {
        if (!cancelled) us?.init?.();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      window.UnicornStudio?.destroy?.();
    };
  }, [projectId]);

  return (
    <div
      data-us-project={projectId}
      data-us-production="true"
      data-us-dpi="1.5"
      data-us-lazyload="false"
      className={`absolute inset-0 ${className}`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
