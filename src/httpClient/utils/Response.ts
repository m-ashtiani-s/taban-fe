export class Response<T = any> {
	data: T;
	status: number;

	constructor(data: T, status: number) {
		this.data = data;
		this.status = status;
	}
}