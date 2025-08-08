export declare const databaseConfig: () => {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: boolean;
        logging: boolean;
        ssl: boolean;
        maxConnections: number;
        acquireTimeout: number;
        timeout: number;
    };
};
