export interface AppConfig {
    port?: number;
    backendDomain?: string;
    frontendDomain?: string;
    workingDirectory?: string;
}

export interface AuthConfig {
    secret?: string;
    expires?: string;
    refreshSecret?: string;
    refreshExpires?: string;
    confirmEmailSecret?: string;
    emailExpires?: string;
}

export interface DatabaseConfig {
    type?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    name?: string;
    synchronize?: boolean;
}

export interface MailConfig {
    service?: string;
    user?: string;
    password?: string;
    defaultEmail?: string;
}

export interface GoogleConfig {
    clientId?: string;
    clientSecret?: string;
}

export interface AllConfigType {
    app: AppConfig;
    auth: AuthConfig;
    database: DatabaseConfig;
    mail: MailConfig;
    google: GoogleConfig;
}
