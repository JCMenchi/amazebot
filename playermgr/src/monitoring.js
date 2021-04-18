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

const prometheusPort = 9464;
const prometheusEndpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;

/** 
 * Configure Metrics for Prometheus.
 * 
 * Endpoint is http://localhost:9464/metrics
 * 
 * **Meters:**
 *   - mazebot_requests_total{route="__relative URL__",method="__GET|POST|...__"}: counter of HTTP requests
 * 
 * This endpoint is not created when running in unit test context.
 * 
 * @namespace Monitoring
 */
const prometheusExporter = new PrometheusExporter(
  {
    startServer: true,
    port: prometheusPort,
    preventServerStart: process.env.NODE_ENV === 'test'
  },
  () => {
    logger.info(
      `prometheus scrape endpoint: http://localhost:${prometheusPort}${prometheusEndpoint}`,
    );
  },
);

const meter = new MeterProvider({
  exporter: prometheusExporter,
  interval: 1000,
}).getMeter('player-manager');

const requestCount = meter.createCounter("mazebot_requests_total", {
  description: "Count all incoming requests"
});

const boundInstruments = new Map();

/**
 * Count All HTTP requests received.
 * 
 * @memberof Monitoring
 */
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