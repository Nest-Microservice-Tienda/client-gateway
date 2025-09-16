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
    DATABASE_URL: z.string().min(1, "DATABASE_URL cannot be empty"),
    PRODUCT_MICROSERVICE_PORT: z.coerce.number().min(1, "PRODUCT_MICROSERVICE_PORT cannot be empty"),
    PRODUCT_MICROSERVICE_HOST: z.string().min(1, "PRODUCT_MICROSERVICE_HOST cannot be empty"),
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
  databaseUrl: result.data.DATABASE_URL,
  productMicroservicePort: result.data.PRODUCT_MICROSERVICE_PORT,
  productMicroserviceHost: result.data.PRODUCT_MICROSERVICE_HOST,
};