
import axios, { AxiosRequestConfig } from "axios";
import { IHttpClient, Options } from "../interfaces/ihttp-client";

export class AxiosHttpClient implements IHttpClient {
    private readonly client = axios.create();

    private mergeOptions(options?: Options): AxiosRequestConfig {
        const config: AxiosRequestConfig = {};

        if (options?.headers) config.headers = options.headers;
        if (options?.params) config.params = options.params;
        if (options?.timeout) config.timeout = options.timeout;
        if (options?.responseType) config.responseType = options.responseType;

        return config;
    }

    async get<T = unknown>(url: string, options?: Options): Promise<T> {
        const config = this.mergeOptions(options);
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        const config = this.mergeOptions(options);
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        const config = this.mergeOptions(options);
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T = unknown>(url: string, data: any, options?: Options): Promise<T> {
        const config = this.mergeOptions(options);
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T = unknown>(url: string, options?: Options): Promise<T> {
        const config = this.mergeOptions(options);
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}
