class Color {
	r = 0;
	g = 0;
	b = 0;
	constructor(r, g, b) {
		if (g == undefined) {
			let colorCode = r;
			if (colorCode.substr(0, 1) == "#") {
				colorCode = colorCode.substr(1);
			}
			this.r = parseInt(colorCode.substr(0, 2), 16);
			this.g = parseInt(colorCode.substr(2, 2), 16);
			this.b = parseInt(colorCode.substr(4, 2), 16);
		} else {
			this.r = r;
			this.g = g;
			this.b = b;
		}
	}
	get h() {
		if (this.r == this.g && this.r == this.b) {
			return 0;
		} else {
			let max = Math.max(this.r, this.g, this.b);
			let min = Math.min(this.r, this.g, this.b);
			let h;
			switch (max) {
				case this.r:
					h = 60 * ((this.g - this.b) / (max - min));
					break;
				case this.g:
					h = 60 * ((this.b - this.r) / (max - min)) + 120;
					break;
				case this.b:
					h = 60 * ((this.r - this.g) / (max - min)) + 240;
					break;
			}
			return Math.floor(h < 0 ? h + 360 : h);
		}
	}
	get s() {
		let max = Math.max(this.r, this.g, this.b);
		let min = Math.min(this.r, this.g, this.b);
		let cnt = (max + min) / 2;
		if (cnt <= 127) {
			return Math.floor(((max - min) / (max + min)) * 100);
		} else {
			return Math.floor(((max - min) / (510 - max - min)) * 100);
		}
	}
	get l() {
		return Math.floor(((Math.max(this.r, this.g, this.b) + Math.min(this.r, this.g, this.b)) / 2) * (100 / 255));
	}
	convertRGB(target) {
		let ratio = (this.r + this.g + this.b) / (255 * 3);
		return new Color(Math.floor(target.r * ratio), Math.floor(target.g * ratio), Math.floor(target.b * ratio));
	}
	convertHSL(target) {
		let ratioBaseColor = target[0];
		let outputColorSample = target[1];
		let ratio = {
			s: outputColorSample.s / ratioBaseColor.s,
			l: outputColorSample.l / ratioBaseColor.l
		}
		let format0toMax = (n, max) => { return Math.max(Math.min(Math.floor(n), max), 0) };
		return `hsl(${this.h}deg ${format0toMax(this.s * ratio.s, 100)}% ${format0toMax(this.l * ratio.l, 100)}%)`;
	}
	toString() {
		return `rgb(${this.r},${this.g},${this.b})`;
	}
	toStringHex() {
		return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`;
	}

	static convertColorRGB(baseColor, ...inputColors) {
		return inputColors.map((inputColor) => { return inputColor.convertRGB(baseColor, 1) })
	}

	static convertColorHSL(baseColor, ratioBaseColor, outputColorSample) {
		return baseColor.convertHSL([ratioBaseColor, outputColorSample], 2);
	}
}
