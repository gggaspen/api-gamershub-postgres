import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Verificar conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
  } else {
    console.log('Conexión a PostgreSQL establecida correctamente');
    release();
  }
});

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    throw error;
  }
}

// Función para realizar transacciones
export async function transaction<T>(callback: (client: any) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export default pool;