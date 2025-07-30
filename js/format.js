//フォーマッタクラス
class Formatter {
	static link(href, carNum) {
		let res = Formatter.separateSymbol(carNum, new RegExp(settings.carSymPattern));
		return `<a href="javascript:Dialog.list.carDetealDialog.functions.display(${href})">${res.carTypeSymbol}${res.pureCarNumber}</a>`
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

	static separateSymbol(text, pattern) {
		let result = { carTypeSymbol: "", pureCarNumber: text };
		let carTypeSymbolMatchResult = text.match(pattern);
		if (carTypeSymbolMatchResult != undefined) {
			let rawCarTypeSymbol = carTypeSymbolMatchResult[0];
			let rawCarTypeSymbolIndex = carTypeSymbolMatchResult.index + rawCarTypeSymbol.length;
			result.carTypeSymbol = rawCarTypeSymbol ? `<span class="carnum-symbol">${rawCarTypeSymbol}</span>` : "";
			result.pureCarNumber = text.slice(rawCarTypeSymbolIndex);
		}
		return result;
	}

	static replaceKeyWord(text, key, word) {
		return text.replace(new RegExp(key, "g"), word);
	}
	static replaceKeyWords(text, keywordPairs) {
		for (let keyword of keywordPairs) {
			text = Formatter.replaceKeyWord(text, keyword[0], keyword[1])
		}
		return text;
	}
}