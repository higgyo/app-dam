export type Options = {
    headers?: Record<string, string>,
    params?: Record<string, any>,
    timeout?: number;
    responseType?: XMLHttpRequestResponseType;
}

export interface IHttpClient {
    get<T = unknown>(url: string, options?: Options): Promise<T>;
    post<T = unknown>(url: string, data: any, options?: Options): Promise<T>;
    put<T = unknown>(url: string, data: any, options?: Options): Promise<T>;
    patch<T = unknown>(url: string, data: any, options?: Options): Promise<T>;
    delete<T = unknown>(url: string, options?: Options): Promise<T>;
}