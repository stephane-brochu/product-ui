"use client";
import {
  createContext,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
const PortalContainerContext = createContext<HTMLElement | null | undefined>(
  undefined,
);
/** Portals inherit the same theme as this root, including nested product themes. */
export function ThemeBoundary({
  theme = "ledger",
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { theme?: string }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <PortalContainerContext.Provider value={container}>
      <div {...props} data-ui-theme={theme}>
        {children}
        <div ref={setContainer} data-ui-portal-host="" />
      </div>
    </PortalContainerContext.Provider>
  );
}
export function usePortalContainer() {
  return useContext(PortalContainerContext);
}
