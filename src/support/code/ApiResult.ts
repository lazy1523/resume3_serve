export class ApiResult {
  private timestamp: any = new Date();
  private status: number;
  private message: string;
  private data: any;

  constructor(status: number, message: string = 'request success', data?: any) {
    this.data = data;
    this.status = status;
    this.message = message;
  }

  /**
   * successful response with message
   * @param message 
   * @param data 
   */
  public static SUCCESS(data: any, message?: string) {
    return new ApiResult(200, message, data);
  }

  /**
   * error response with message
   * @param message 
   * @param data 
   */
  public static ERROR(status: number, message: string) {
    return new ApiResult(status, message);
  }

}