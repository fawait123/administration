import { AxiosError } from "axios";

export class ResponseMessage {
    static message(error: Error): string {
        if (error instanceof AxiosError) {
            return error.message
        }

        return error.message
    }
}
