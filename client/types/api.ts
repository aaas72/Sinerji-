export interface ApiResponse<T = any> {
    status: string;
    message?: string;
    data: T;
    token?: string; // Optional, for auth responses
}

export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
