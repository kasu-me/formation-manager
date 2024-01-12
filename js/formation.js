//各種要素クラス定義
//形式クラス
class Series {
	//形式名(3000系 等)
	#name;
	//ベース車両 (西武101系 等)
	#base;
	//説明
	#description
	//隠し形式
	#isHidden = false;

	//コンストラクタ(形式名,ベース車両,説明,隠すかどうか)
	constructor(name, base, description, isHidden) {
		this.#name = name;
		this.#base = base;
		this.#description = description;
		this.#isHidden = isHidden == undefined ? this.#isHidden : isHidden;
	}

	set name(name) {
		this.#name = name;
	}
	set description(description) {
		this.#description = description;
	}
	set isHidden(isHidden) {
		this.#isHidden = isHidden;
	}

	get name() {
		return Formatter.toHTML(this.#name);
	}
	get base() {
		return Formatter.toHTML(this.#base);
	}
	get description() {
		return this.#description == "" ? "　" : Formatter.toHTML(this.#description);
	}
	get isHidden() {
		return this.#isHidden;
	}

	convertToJSON() {
		return JSON.stringify({
			instanceof: "Series",
			name: this.#name,
			base: this.#base,
			description: this.#description,
			isHidden: this.#isHidden
		});
	}
}

//番号と補助記号のペア
class NumberPair {
	#number
	#symbol
	constructor(num) {
		let number = "0";
		let symbol = "";
		if (Array.isArray(num) && num.length == 2) {
			number = num[0];
			symbol = num[1];
		} else if (Array.isArray(num) && num.length == 1) {
			number = num[0];
		} else {
			number = num;
		}
		this.#number = number;
		this.#symbol = symbol;
	}
	get number() {
		return this.#number;
	}
	get symbol() {
		return this.#symbol;
	}
}

//旧車番クラス
class OldCarNumber {
	//NumberPair
	#numberPair;
	//YearMonth この番号がいつまで使われていたか
	#renumberedOn;
	constructor(numberPair, renumberedOn) {
		this.#numberPair = numberPair;
		this.#renumberedOn = renumberedOn;
	}
	get number() {
		return Formatter.toHTML(this.#numberPair.number);
	}
	get renumberedOn() {
		return this.#renumberedOn;
	}
	get carTypeSymbol() {
		return Formatter.toHTML(this.#numberPair.symbol);
	}
	get numberPair() {
		return this.#numberPair;
	}
}

//車両クラス
class Car {
	//NumberPair
	#numberPair;
	//以前の車両番号
	//要素はOldCarNumberクラス
	#oldNumbers = [];
	//除籍された年月
	#droppedOn;
	//保存されているか
	#isConserved = false;
	//製造年月
	#manufacturedOn;
	//[備考]
	#remark;

	//コンストラクタ(車両番号,製造年月,以前の車両ID,備考)
	constructor(number, manufacturedOn, oldNumbers, remark) {
		this.#numberPair = new NumberPair(number);
		this.#manufacturedOn = manufacturedOn;
		if (oldNumbers != null) {
			this.#oldNumbers = setObservedArray(oldNumbers, refresh);
			this.sortOldNumbersByYearMonth();
		} else {
			this.#oldNumbers = setObservedArray([], refresh);
		}
		this.remark = remark;
	}
	//改番
	renumber(newNumber, renumberedOn) {
		this.#oldNumbers.push(new OldCarNumber(this.#numberPair, renumberedOn));
		this.#numberPair = new NumberPair(newNumber.toString());
		this.sortOldNumbersByYearMonth();
	}
	//以前の車両番号を改番年月順にソート
	sortOldNumbersByYearMonth() {
		this.#oldNumbers.sort((f1, f2) => {
			if (f1.renumberedOn.serial < f2.renumberedOn.serial) {
				return -1
			} else if (f1.renumberedOn.serial > f2.renumberedOn.serial) {
				return 1
			} else {
				return 0
			}
		});
	}
	//除籍
	drop(ym) {
		this.#droppedOn = ym;
	}
	//保存
	conserve() {
		this.#isConserved = true;
	}
	//保存中止(解体)
	unconserve() {
		this.#isConserved = false;
	}

	get number() {
		return Formatter.toHTML(this.#numberPair.number);
	}
	get symbol() {
		return Formatter.toHTML(this.#numberPair.symbol);
	}
	get oldNumbers() {
		return this.#oldNumbers;
	}
	get droppedOn() {
		return this.#droppedOn;
	}
	get isActive() {
		return !Boolean(this.#droppedOn);
	}
	get isDropped() {
		return Boolean(this.#droppedOn) && !this.#isConserved;
	}
	get isConserved() {
		return Boolean(this.#droppedOn) && this.#isConserved;
	}
	get manufacturedOn() {
		return this.#manufacturedOn;
	}
	get remark() {
		return Formatter.toHTML(this.#remark);
	}
	set remark(remark) {
		this.#remark = remark || "";
	}

	//now時点で廃車されているかどうかを取得
	isDroppedInTime(now) {
		if (this.#droppedOn == undefined) {
			return false;
		} else {
			return this.#droppedOn.serial <= now.serial;
		}
	}
	//now時点で現役かどうかを取得
	isActiveInTime(now) {
		if (this.#droppedOn == undefined) {
			return now.serial >= this.#manufacturedOn.serial;
		} else {
			return this.#droppedOn.serial > now.serial && now.serial >= this.#manufacturedOn.serial;
		}
	}
	//now時点で保存されているかどうかを取得
	isConservedInTime(now) {
		return this.isDroppedInTime(now) && this.isConserved;
	}

	//now時点での車両番号を取得
	numberInTime(now) {
		return this.numberPairInTime(now).number;
	}
	numberPairInTime(now) {
		if (this.#oldNumbers.length == 0) {
			return this.#numberPair;
		} else {
			for (let i in this.#oldNumbers) {
				if (this.#oldNumbers[i].renumberedOn.serial > now.serial) {
					return this.#oldNumbers[i].numberPair;
				}
			}
			return this.#numberPair;
		}
	}

	//マスタ編集
	updateMasterData(number, manufacturedOn, droppedOn, oldNumbers, isConserved) {
		this.#numberPair = new NumberPair(number);
		this.#manufacturedOn = manufacturedOn;
		this.#oldNumbers = [];
		this.#droppedOn = droppedOn == null ? undefined : droppedOn;
		if (this.#droppedOn == undefined) {
			this.#isConserved = false;
		} else {
			this.#isConserved = isConserved;
		}
		for (let i in oldNumbers) {
			this.#oldNumbers.push(new OldCarNumber(new NumberPair[oldNumbers[i]], new YearMonth(oldNumbers[i].year, oldNumbers[i].month)));
		}
		this.sortOldNumbersByYearMonth();
	}

	convertToJSON() {
		let oldNumbers = [];
		for (let i in this.#oldNumbers) {
			oldNumbers.push({ "number": this.#oldNumbers[i].number, "symbol": this.#oldNumbers[i].symbol, "renumberedOn": this.#oldNumbers[i].renumberedOn.serial });
		}
		return JSON.stringify({
			instanceof: "Car",
			number: { "number": this.#numberPair.number, "symbol": this.#numberPair.symbol },
			oldNumbers: oldNumbers,
			droppedOn: this.#droppedOn == undefined ? undefined : { y: this.#droppedOn.year, m: this.#droppedOn.month },
			isConserved: this.#isConserved,
			manufacturedOn: { y: this.#manufacturedOn.year, m: this.#manufacturedOn.month },
			remark: this.#remark
		});
	}
}

//所属クラス
class Belong {
	#startsOn;
	#endsOn;
	#name;
}
class BelongsTo {
	#belongs = [];

	constructor(belong) {
		this.#belongs.push(belong);
	}

	setBelong(belong) {
		this.#belongs.push(belong);
	}

	getBelongInTime(now) {
		for (let belong of this.#belongs) {
			if (belong.startsOn.serial < now.serial && ((belong.endsOn.serial || now) >= now.serial)) {
				return belong;
			}
		}
	}
}

//編成クラス
class Formation {
	//形式ID
	#seriesId;
	//編成名(1003Fなど)
	#name;
	//[所属車両ID]
	#cars = [];
	//所属
	#belongsTo;
	//YearMonth 編成組成年月
	#formatedOn;
	//YearMonth 編成解除年月
	#terminatedOn;
	//[備考]
	#remark;

	//コンストラクタ(所属形式,編成名,[所属車両ID],所属 ,YearMonth 編成組成年月,...備考)
	constructor(seriesId, name, cars, belongsTo, formatedOn, remark) {
		this.#seriesId = seriesId;
		this.#name = name;
		this.#cars = cars;
		this.#belongsTo = belongsTo;
		this.#formatedOn = formatedOn;
		this.remark = remark;
	}

	//編成名を変更 (編成名)
	setName(name) {
		this.#name = name;
	}

	//形式を変更 (形式ID)
	setSeries(seriesId) {
		this.#seriesId = seriesId;
	}

	//編成解除(YearMonth 編成解除年月)
	release(terminatedOn) {
		//this.#belongsTo = null;
		this.#terminatedOn = terminatedOn;
	}

	//編成から車両を除外(通常は使用しない)
	removeCarByCarId(carId) {
		for (let i in this.#cars) {
			if (this.#cars[i] == carId) {
				this.#cars.splice(i, 1);
				break;
			}
		}
	}

	get seriesId() {
		return this.#seriesId;
	}
	get name() {
		return Formatter.toHTML(this.#name);
	}
	get cars() {
		return this.#cars;
	}
	get formatedOn() {
		return this.#formatedOn;
	}
	get terminatedOn() {
		return this.#terminatedOn;
	}
	get isTerminated() {
		return Boolean(this.#terminatedOn);
	}
	get belongsTo() {
		return this.#belongsTo;
	}
	get remark() {
		return Formatter.toHTML(this.#remark);
	}
	set name(name) {
		this.#name = name;
	}
	set belongsTo(belongsTo) {
		this.#belongsTo = belongsTo;
	}
	set remark(remark) {
		this.#remark = remark || "";
	}

	//マスタ編集
	updateMasterData(seriesId, name, formatedOn, terminatedOn) {
		this.#seriesId = seriesId;
		this.#name = name;
		this.#formatedOn = formatedOn;
		this.#terminatedOn = terminatedOn == null ? undefined : terminatedOn;
	}
	updateMasterCars(cars) {
		this.#cars = cars;
	}

	convertToJSON() {
		return JSON.stringify({
			instanceof: "Formation",
			seriesId: this.#seriesId,
			name: this.#name,
			cars: this.#cars,
			belongsTo: this.#belongsTo,
			formatedOn: { y: this.#formatedOn.year, m: this.#formatedOn.month },
			terminatedOn: { y: this.#terminatedOn != null ? this.#terminatedOn.year : "", m: this.#terminatedOn != null ? this.#terminatedOn.month : "" },
			remark: this.#remark
		});
	}
}

//編成テンプレートクラス
class FormationTemplate {
	//形式ID
	#seriesId;
	//テンプレートの説明
	#name = "";
	//編成番号の一般形(関数)
	#formationName;
	//編成番号の一般形(生データ)
	#rawFormationName;
	//[車両番号の一般形(関数)]
	#carNumbers = [];
	//[車両番号の一般系(生データ)]
	#rawCarNumbers = [];

	//コンストラクタ(形式ID,編成テンプレート詳細,[車両番号の一般形],ベースとなる編成番号の一般形(省略時は1号車の車番を利用))
	//一般形にはnの関数を指定
	constructor(seriesId, name, carNumbers, formationName) {
		this.seriesId = seriesId;
		this.name = name || this.#name;
		this.carNumbers = carNumbers;
		this.formationName = formationName;
	}
	set seriesId(value) {
		this.#seriesId = value;
	}
	set name(value) {
		this.#name = value;
	}
	set carNumbers(carNumbers) {
		this.#carNumbers = [];
		this.#rawCarNumbers = [];
		for (let i in carNumbers) {
			this.#carNumbers.push(FormationTemplate.convertToFunction(carNumbers[i], this));
			this.#rawCarNumbers.push(carNumbers[i]);
		}
	}
	set formationName(formationName) {
		if (formationName == "" || formationName == undefined) {
			this.#formationName = n => this.carNumbers[0](n) + "F";
			this.#rawFormationName = "";
		} else {
			this.#formationName = FormationTemplate.convertToFunction(formationName, this);
			this.#rawFormationName = formationName;
		}
	}
	get seriesId() {
		return this.#seriesId;
	}
	get name() {
		return Formatter.toHTML(this.#name);
	}
	get formationName() {
		return this.#formationName;
	}
	get rawFormationName() {
		return this.#rawFormationName;
	}
	get carNumbers() {
		return this.#carNumbers;
	}
	get rawCarNumbers() {
		return this.#rawCarNumbers;
	}
	addCarNumber(carNumber) {
		this.#carNumbers.push(FormationTemplate.convertToFunction(carNumber, this));
		this.#rawCarNumbers.push(carNumber);
	}

	addCarNumberTo(carNumber, index) {
		this.#carNumbers.splice(index, 0, FormationTemplate.convertToFunction(carNumber, this));
		this.#rawCarNumbers.splice(index, 0, carNumber);
	}
	deleteCarNumber(index) {
		this.#carNumbers.splice(index, 1);
		this.#rawCarNumbers.splice(index, 1);
	}

	convertToJSON() {
		return JSON.stringify({
			instanceof: "FormationTemplate",
			seriesId: this.#seriesId,
			name: this.#name,
			formationName: this.#formationName == undefined ? undefined : this.#rawFormationName.toString(),
			carNumbers: this.#carNumbers.map(elm => {
				return elm.toString()
			})
		});
	}

	static convertToFunction(text, tar) {
		if (!isNaN(Number(text))) { text = Number(text); }
		if (typeof (text) == "string") {
			return (Function.call(tar, `return ${text}`)());
		} else if (typeof (text) == "number") {
			return (new Function("n", `return ${text}+n`));
		} else {
			return (text);
		}
	}
}