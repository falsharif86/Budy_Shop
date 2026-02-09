import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const uri = MONGODB_URI || 'mongodb://localhost:27017';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis.__mongoClientPromise) {
	client = new MongoClient(uri);
	globalThis.__mongoClientPromise = client.connect();
}
clientPromise = globalThis.__mongoClientPromise;

declare global {
	// eslint-disable-next-line no-var
	var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getHostDb() {
	const client = await clientPromise;
	return client.db('budy_host');
}

export async function getTenantsDb() {
	const client = await clientPromise;
	return client.db('budy_tenants');
}
