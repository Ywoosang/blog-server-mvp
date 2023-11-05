export type AppConfig = {
    port: number;
    backendDomain: string;
};

export type AuthConfig = {
    secret?: string;
    expires?: string;
};

export type DatabaseConfig = {
    type?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    name?: string;
    synchronize? : boolean;
};

export type AllConfigType = {
    app: AppConfig;
    auth: AuthConfig;
    database: DatabaseConfig;
};