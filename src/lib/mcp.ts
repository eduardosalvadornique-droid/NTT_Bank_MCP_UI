let appInstancePromise: Promise<any | null> | null = null;

type UnknownToolResult = {
  structuredContent?: { count?: unknown };
  structured_content?: { count?: unknown };
};

async function getMcpApp() {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) return null;

  if (!appInstancePromise) {
    appInstancePromise = (async () => {
      try {
        const { App } = await import("@modelcontextprotocol/ext-apps");
        const app = new App({ name: "Card Dashboard", version: "1.0.0" });
        await app.connect();
        return app;
      } catch {
        return null;
      }
    })();
  }

  return appInstancePromise;
}

function parseCount(res: unknown) {
  const rawCount =
    (res as UnknownToolResult)?.structuredContent?.count ??
    (res as UnknownToolResult)?.structured_content?.count;
  const parsed = Number.parseInt(String(rawCount), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export async function getDashboardCountFromMcp() {
  try {
    const app = await getMcpApp();
    if (app) {
      const res = await app.callServerTool({
        name: "get_dashboard_count",
        arguments: {},
      });
      const parsed = parseCount(res);
      if (parsed !== null) return parsed;
    }
  } catch {
    // Fall through to runtime bridge fallback.
  }

  try {
    if (typeof window !== "undefined" && typeof window.openai?.callTool === "function") {
      const res = await window.openai.callTool("get_dashboard_count", {});
      return parseCount(res);
    }
  } catch {
    return null;
  }

  return null;
}
