class ErrorResponse {

    statusCode: number;
    message: string;
    data: any;

    constructor(statusCode: number, message: string, data: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    static defaultSuccess() {
        return new ErrorResponse(500, "Error", "Error");
    }
}

export default ErrorResponse;
