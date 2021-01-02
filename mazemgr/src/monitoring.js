"use strict";

/** 
 * Configure Metrics for Prometheus.
 * 
 * Default endpoint is http://localhost:9464/metrics
 * 
 */

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('metrics');

// initialize metrics exporter
const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const prometheusPort = 9465;
const prometheusEndpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;

const exporter = new PrometheusExporter(
  {
    startServer: true,
    port: prometheusPort,
    logger: logger,
    preventServerStart: process.env.npm_lifecycle_event === 'test' || process.env.npm_lifecycle_event === 'coverage'
  },
  () => {
    logger.info(
      `prometheus scrape endpoint: http://localhost:${prometheusPort}${prometheusEndpoint}`,
    );
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 1000,
  logger: logger
}).getMeter('maze-manager');

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests",
  logger: logger
});

const boundInstruments = new Map();

function countAllRequests() {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labels = { route: req.path, method: req.method };
      const boundCounter = requestCount.bind(labels);
      boundInstruments.set(req.method + req.path, boundCounter);
    }

    boundInstruments.get(req.method + req.path).add(1);
    next();
  };
}

module.exports = { countAllRequests };