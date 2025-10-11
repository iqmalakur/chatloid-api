import { Collection, Db, MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { LoggerUtil } from './logger.util';

config();

const uri = process.env.MONGODB_URL;

if (!uri) {
  throw new Error('MONGODB_URL is not defined');
}

const client = new MongoClient(uri);
let database: Db | null = null;

export const initDb = async () => {
  if (database) return;

  await client.connect();
  database = client.db('chatloid_messages');
  LoggerUtil.getGlobalInstance().info('Connected to MongoDB');
};

export const getDb = async (): Promise<Db> => {
  if (!database) await initDb();
  return database!;
};

export const getMessagesCollection = async (): Promise<Collection> => {
  const db = await getDb();
  return db.collection('messages');
};

export const closeDb = async () => {
  await client.close();
  LoggerUtil.getGlobalInstance().info('MongoDB connection closed');
};
