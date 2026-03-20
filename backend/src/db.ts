import { MongoClient, Db } from 'mongodb';

let singleton: Db;

export default async (): Promise<Db> => {
    if (singleton) return singleton;

    const uri = `${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`;

    const client = new MongoClient(uri, {
        auth: {
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PASS,
        },
        authSource: process.env.MONGO_DATABASE,
    });

    await client.connect();
    singleton = client.db(process.env.MONGO_DATABASE);

    return singleton;
}