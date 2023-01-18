//年月クラス
class YearMonth{
	#y;
	#m;
	constructor(y, m) {
		this.update(y, m);
	}
	get year() {
		return this.#y;
	}
	get month() {
		return this.#m;
	}
	get serial() {
		return this.#y * 12 + this.#m;
	}

	//年月を更新
	update(y,m) {
		if (m == null) {
			this.update(Math.floor(y / 12) - (y % 12 == 0 ? 1 : 0), y % 12 == 0 ? 12 : y % 12);
		} else {
			this.updateY(y);
			this.updateM(m);
		}
	}
	updateY(y) {
		this.#y = y;
	}
	updateM(m) {
		this.#m = m;
	}

	toString() {
		return `${this.#y}年${`00${this.#m}`.slice(-2)}月`;
	}
}

//フォーマッタクラス
class Formatter{
	static link(href, text) {
		return `<a href="javascript:displayCarDeteal(${href})">${text}</a>`
	}
}