import { useEffect, useState } from "react";
import type { AppInfoData, HealthData } from "@wira-app/shared";
import { getAppInfo, getHealth } from "../services/api/client";

export function OverviewPage() {
  const [appInfo, setAppInfo] = useState<AppInfoData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [infoPayload, healthPayload] = await Promise.all([
          getAppInfo(),
          getHealth(),
        ]);
        setAppInfo(infoPayload);
        setHealth(healthPayload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      }
    };

    void load();
  }, []);

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
      <h1>WIRA Platform</h1>
      <p>Frontend sudah terhubung dengan backend API v1.</p>

      {error ? <p style={{ color: "#b91c1c" }}>Error: {error}</p> : null}

      <section>
        <h2>App Info</h2>
        <pre>{JSON.stringify(appInfo, null, 2)}</pre>
      </section>

      <section>
        <h2>Health</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>
    </main>
  );
}
