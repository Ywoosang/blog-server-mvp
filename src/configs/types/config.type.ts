export type AppConfig = {
    port: number;
    backendDomain: string;
    workingDirectory: string;
};

export type AuthConfig = {
    secret: string;
    expires: string;
    refreshSecret: string;
    refreshExpires: string;
    confirmEmailSecret: string;
    emailExpires: string;
};

export type DatabaseConfig = {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
};

export type MailConfig = {
    service: string;
    user: string;
    password: string;
    defaultEmail: string;
};

export type AllConfigType = {
    app: AppConfig;
    auth: AuthConfig;
    database: DatabaseConfig;
    mail: MailConfig;
};
