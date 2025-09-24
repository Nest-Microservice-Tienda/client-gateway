import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string()
    .min(1, "PORT cannot be empty")
    .refine(val => !isNaN(Number(val)), "PORT must be a valid number")
    .transform(val => {
      const num = Number(val);
      if (num < 1 || num > 65535) {
        throw new Error("PORT must be between 1 and 65535");
      }
      return num;
    }),
  NATS_SERVERS: z.string()
    .min(1, "NATS_SERVERS cannot be empty")
    .transform(val => {
      // Dividir por coma y limpiar espacios en blanco
      return val.split(',').map(url => url.trim());
    })
    .pipe(
      // Validar que sea un array de URLs válidas
      z.array(z.string().url()).min(1, "At least one NATS server URL must be provided")
    ),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Environment validation errors:');
  result.error.issues.forEach(issue => {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
    if (issue.code === 'custom') {
      const key = typeof issue.path[0] === 'string' ? issue.path[0] : '';
      console.error(`    Received: "${process.env[key]}"`);
    }
  });
  process.exit(1);
}

export const env = {
  port: result.data.PORT,
  natsServers: result.data.NATS_SERVERS,
};