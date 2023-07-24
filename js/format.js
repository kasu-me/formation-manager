//フォーマッタクラス
class Formatter {
	static link(href, text) {
		return `<a href="javascript:Dialog.list.carDetealDialog.functions.display(${href})">${text}</a>`
	}

	static toHTML(text) {
		if (typeof text != "string") {
			return text;
		}
		let patterns = [
			{ before: "<", after: "&lt;" },
			{ before: ">", after: "&gt;" },
		];
		patterns.forEach((pattern) => {
			text = text.replace(new RegExp(pattern.before, "g"), pattern.after);
		})
		return text;
	}
}