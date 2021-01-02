"use strict";

/** 
 * Configure Tracing
 * 
 */

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('tracing');

// initialize tracing
const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

const provider = new NodeTracerProvider({ logLevel: LogLevel.ERROR });

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new JaegerExporter({
      serviceName: "player-manager",
      // If you are running your tracing backend on another host,
      // you can point to it using the `url` parameter of the
      // exporter config.
      logger: logger
    })
  )
);

provider.register();
logger.info("tracing initialized");
