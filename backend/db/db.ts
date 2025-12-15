import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const shippingDB = new SQLDatabase("shipping", {
  migrations: "./migrations",
});
