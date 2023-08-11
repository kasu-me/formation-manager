class Message {
	static list = {};

	#code = "";
	#text = "";
	constructor(code, text) {
		this.#code = code;
		this.#text = text;
		Message.list[this.code] = this;
	}
	get code() {
		return this.#code;
	}
	get text() {
		return this.#text;
	}
	toString(dic) {
		dic = dic || {};
		let str = this.#text;
		for (let key in dic) {
			str = str.replace(new RegExp(`\\\${${key}}`, "g"), dic[key]);
		}
		return str;
	}
}