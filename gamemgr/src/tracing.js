"use strict";

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('tracing');

// initialize tracing
const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

/** 
 * Configure Tracing to use jaeger service.
 * 
 * This service name is: game-manager
 * 
 * If you are running your tracing backend on another host,
 * you can point to it using the JAEGER_AGENT_HOST environment variable
 * the jaeger agent is expected to use port 9411.
 * 
 */
const tracerProvider = new NodeTracerProvider({ logLevel: LogLevel.ERROR });

tracerProvider.addSpanProcessor(
  new SimpleSpanProcessor(
    new JaegerExporter({
      serviceName: "game-manager",
      logger: logger
    })
  )
);

tracerProvider.register();
logger.info("Tracing initialized");