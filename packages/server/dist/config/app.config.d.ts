export declare const appConfig: () => {
    app: {
        name: string;
        version: string;
        port: number;
        environment: string;
        frontendUrl: string;
    };
    aws: {
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        region: string;
        s3Bucket: string;
    };
    processing: {
        maxFileSize: number;
        supportedFormats: string[];
        tileSize: number;
        maxZoomLevel: number;
        tempDirectory: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
};
