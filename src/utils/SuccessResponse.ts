class SuccessResponse {

    statusCode: number;
    message: string;
    data: any;

    constructor(statusCode: number, message: string, data: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    static defaultSuccess() {
        return new SuccessResponse(200, "Success", "Success");
    }
}

export default SuccessResponse;
