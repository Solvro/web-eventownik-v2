import { metrics } from "@opentelemetry/api";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { onCLS, onINP, onLCP } from "web-vitals";

import { API_URL } from "@/lib/api";

function initializeTracing() {
  const rawEndpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;
  const serviceName = process.env.NEXT_PUBLIC_OTEL_FRONTEND_SERVICE_NAME;

  if (
    rawEndpoint == null ||
    rawEndpoint === "" ||
    serviceName == null ||
    serviceName === ""
  ) {
    return;
  }

  const endpoint = rawEndpoint.replace(/\/$/, "");

  const apiHostname = new URL(API_URL).hostname;

  const exporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  });

  const spanProcessors: SpanProcessor[] = [new BatchSpanProcessor(exporter)];

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors,
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  const escapedHostname = apiHostname.replaceAll(".", String.raw`\.`);
  const apiRegex = new RegExp(escapedHostname);

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        ignoreUrls: [/localhost:3000\/_next\//, /\/api\/telemetry/],
        propagateTraceHeaderCorsUrls: [apiRegex],
      }),
      new UserInteractionInstrumentation({
        eventNames: ["click", "input", "submit"],
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [apiRegex],
      }),
    ],
    tracerProvider: provider,
  });
}

function initializeWebVitals() {
  const rawEndpoint =
    process.env.NEXT_PUBLIC_OTEL_METRICS_ENDPOINT ??
    "https://ingest.signoz.b.solvro.pl";
  const endpoint = rawEndpoint.replace(/\/$/, "");

  const resource = resourceFromAttributes({
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
}

initializeTracing();

const webVitalsEnabled = process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "false";
if (webVitalsEnabled) {
  initializeWebVitals();
}
