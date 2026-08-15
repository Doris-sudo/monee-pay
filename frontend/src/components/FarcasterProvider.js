"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FarcasterContext = createContext({
  isFrame: false,
  context: null,
  isLoaded: false,
  sdk: null,
});

export function FarcasterProvider({ children }) {
  const [isFrame, setIsFrame] = useState(false);
  const [context, setContext] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sdkInstance, setSdkInstance] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initFarcasterSDK() {
      try {
        const frameSDK = (await import("@farcaster/frame-sdk")).default;
        if (!isMounted) return;

        setSdkInstance(frameSDK);

        // Fetch frame context if available
        const ctx = await frameSDK.context;
        if (ctx) {
          setContext(ctx);
          setIsFrame(true);
        }

        // Notify Warpcast / Farcaster parent host that frame content is ready
        await frameSDK.actions.ready({});
        if (isMounted) setIsLoaded(true);
      } catch (err) {
        console.warn("Farcaster SDK initialization skipped (standalone web mode):", err);
        if (isMounted) setIsLoaded(true);
      }
    }

    initFarcasterSDK();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FarcasterContext.Provider
      value={{
        isFrame,
        context,
        isLoaded,
        sdk: sdkInstance,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  return useContext(FarcasterContext);
}
