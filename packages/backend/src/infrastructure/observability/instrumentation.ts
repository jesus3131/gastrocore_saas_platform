import { NodeSDK, tracing } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'

const sdk = new NodeSDK({
  traceExporter: new tracing.ConsoleSpanExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new PrismaInstrumentation(),
  ],
})

sdk.start()
