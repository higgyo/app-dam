import { IHttpClient, Options } from "../interfaces/ihttp-client";

export class AxiosHttpClient implements IHttpClient {
    get<T = unknown>(url: string, options?: Options): Promise<T> {
        throw new Error("Method not implemented.");
    }
    post<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        throw new Error("Method not implemented.");
    }
    put<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        throw new Error("Method not implemented.");
    }
    patch<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        throw new Error("Method not implemented.");
    }
    delete<T = unknown>(url: string, options?: Options): Promise<T> {
        throw new Error("Method not implemented.");
    }
}