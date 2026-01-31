import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { API_URL } from "@/lib/api";

let isInitialized = false;

export function initializeTracing() {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

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

  isInitialized = true;
}
