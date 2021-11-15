"use strict";

/** 
 * Configure Tracing
 * 
 */

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('tracing');

// initialize tracing
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const provider = new NodeTracerProvider();
provider.register();

// register and load instrumentation and old plugins - old plugins will be loaded automatically as previously
// but instrumentations needs to be added
registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation({
        requestHook: (span, request) => {
          span.setAttribute('custom request hook attribute', 'request');
        },
    }),
  ],
});

const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new JaegerExporter({
      serviceName: 'player-manager',
    })
  )
);

logger.info('tracing initialized');
