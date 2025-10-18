"use client";

import { metrics } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { onCLS, onINP, onLCP } from "web-vitals";

let isInitialized = false;

export function initializeWebVitals() {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  const rawEndpoint =
    process.env.NEXT_PUBLIC_OTEL_METRICS_ENDPOINT ??
    "https://ingest.signoz.b.solvro.pl";
  const endpoint = rawEndpoint.replace(/\/$/, "");

  const resource = new Resource({
    [ATTR_SERVICE_NAME]:
      process.env.NEXT_PUBLIC_OTEL_FRONTEND_SERVICE_NAME ??
      "eventownik-web-frontend",
  });

  const reader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
    exportIntervalMillis: 15_000,
  });

  const meterProvider = new MeterProvider({ resource, readers: [reader] });
  metrics.setGlobalMeterProvider(meterProvider);
  const meter = metrics.getMeter("web-vitals");

  const lcp = meter.createHistogram("web_vitals_lcp", { unit: "ms" });
  const inp = meter.createHistogram("web_vitals_inp", { unit: "ms" });
  const cls = meter.createUpDownCounter("web_vitals_cls", { unit: "1" });

  interface WebVitalMetric {
    name: "LCP" | "INP" | "CLS";
    value: number;
    rating: string;
  }

  const record = (metric: WebVitalMetric) => {
    const attributes = {
      page: window.location.pathname,
      rating: metric.rating,
    } as const;
    switch (metric.name) {
      case "LCP": {
        lcp.record(metric.value, attributes);
        break;
      }
      case "INP": {
        inp.record(metric.value, attributes);
        break;
      }
      case "CLS": {
        cls.add(metric.value, attributes);
        break;
      }
      default: {
        break;
      }
    }
  };

  onLCP(record);
  onINP(record);
  onCLS(record);

  isInitialized = true;
}
