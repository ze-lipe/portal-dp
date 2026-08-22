import type { Pool, PoolClient } from "pg";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface TenantTransactionContext {
  companyId: string;
  actorId: string;
  correlationId: string;
}

export async function withTenantTransaction<T>(
  pool: Pool,
  context: TenantTransactionContext,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  for (const [name, value] of Object.entries(context)) {
    if (!uuidPattern.test(value))
      throw new Error(`${name} must be an opaque UUID`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // O contexto fica restrito à transação. Assim, quando o pool reutiliza esta
    // conexão, ela não conserva a empresa ou o ator da requisição anterior.
    await client.query(
      `SELECT
         set_config('app.company_id', $1, true),
         set_config('app.actor_id', $2, true),
         set_config('app.correlation_id', $3, true)`,
      [context.companyId, context.actorId, context.correlationId],
    );
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
