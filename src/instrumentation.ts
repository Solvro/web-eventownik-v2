import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";

if (process.env.NEXT_RUNTIME === "nodejs") {
  const requested = process.env.OTEL_LOG_LEVEL as
    | keyof typeof DiagLogLevel
    | undefined;
  let level: DiagLogLevel = DiagLogLevel.ERROR;
  if (
    requested &&
    Object.prototype.hasOwnProperty.call(DiagLogLevel, requested)
  ) {
    level = DiagLogLevel[requested];
  }
  diag.setLogger(new DiagConsoleLogger(), level);
}

export function register() {
  const serviceNameEnv = process.env.OTEL_SERVICE_NAME;
  const serviceName =
    typeof serviceNameEnv === "string" && serviceNameEnv.trim() !== ""
      ? serviceNameEnv
      : "eventownik-web";
  const endpointEnv = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const endpoint =
    typeof endpointEnv === "string" && endpointEnv.trim() !== ""
      ? endpointEnv.replace(/\/$/, "")
      : "https://ingest.signoz.b.solvro.pl";

  registerOTel({
    serviceName,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  });
}
