import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";
import "./download-box-paint.css";
import "./exclusive-third-strike.css";
import "./cyan-paint-system.css";
import "./arcade-scene-hold.css";
import "./afterparty-runner.css";
import "./arcade-repair.css";
import "./posthero-cohesion.css";
import "./game-visual-system.css";
import "./global-typography-system.css";
import "./visuals-archive-collage.css";
import "./selector-profile-zine.css";
import "./exclusive-dubplate-promo.css";
import "./booking-frequency-terminal.css";
import "./site-journey-flow.css";
import "./falling-items-render-fix.css";
import "./mobile-site-repair.css";
import "./regression-visual-integration.css";
import "./task2-visuals-archive-collage.css";
import "./task3-selector-profile-zine.css";
import "./task4-dubplate-card-promo.css";
import "./task5-booking-terminal.css";
import "./task6-site-journey.css";
import "./task7-final-consistency-polish.css";
import "./final-regression-fix-pass.css";
import "./strict-visual-repair.css";
import "./visual-recovery-site.css";
import "./level1-final-transition-calibration.css";
import "./canonical-record-renderer.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const installRecordPaintBridge = () => {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;

  const paintRecord = (recordWrapper: Element) => {
    if (!(recordWrapper instanceof HTMLElement)) return;
    const asset = recordWrapper.querySelector(":scope > .urban-prop-asset.record");
    if (!(asset instanceof HTMLElement)) return;

    recordWrapper.style.setProperty("overflow", "visible", "important");

    const rules: Record<string, string> = {
      display: "block",
      position: "absolute",
      inset: "auto",
      left: "50%",
      top: "50%",
      right: "auto",
      bottom: "auto",
      width: "30px",
      height: "30px",
      minWidth: "30px",
      minHeight: "30px",
      maxWidth: "30px",
      maxHeight: "30px",
      margin: "0",
      padding: "0",
      overflow: "visible",
      opacity: "1",
      visibility: "visible",
      backgroundImage: "url('/embedded-assets/selectah-dubplate-5d-production-v2.png')",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      transform: "translate(-50%, -50%)",
      transformOrigin: "center",
      clip: "auto",
      clipPath: "none",
      border: "0",
      borderRadius: "0",
      zIndex: "5",
      pointerEvents: "none",
      filter: "drop-shadow(0 0 1px #00e7ff) drop-shadow(0 0 2px #ff007a)",
    };

    for (const [property, value] of Object.entries(rules)) {
      asset.style.setProperty(property.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`), value, "important");
    }
  };

  const scan = (root: ParentNode = document) => {
    root.querySelectorAll?.(".falling-object.record").forEach(paintRecord);
  };

  scan();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(".falling-object.record")) paintRecord(node);
        scan(node);
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

installRecordPaintBridge();
