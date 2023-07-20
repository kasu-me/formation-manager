//各種要素クラス定義
//形式クラス
class Series {
	//形式名(3000系 等)
	#name;
	//ベース車両 (西武101系 等)
	#base;
	//説明
	#description

	//コンストラクタ(形式名,ベース車両,説明)
	constructor(name, base, description) {
		this.#name = name;
		this.#base = base;
		this.#description = description;
	}

	get name() {
		return this.#name;
	}
	get base() {
		return this.#base;
	}
	get description() {
		return this.#description;
	}

	convertToJSON() {
		return JSON.stringify({
			instanceof: "Series",
			name: this.#name,
			base: this.#base,
			description: this.#description
		});
	}
}

//旧車番クラス
class OldCarNumber {
	#number;
	//YearMonth この番号がいつまで使われていたか
	#renumberedOn;
	constructor(number, renumberedOn) {
		this.#number = number;
		this.#renumberedOn = renumberedOn;
	}
	get number() {
		return this.#number;
	}
	get renumberedOn() {
		return this.#renumberedOn;
	}
}

//車両クラス
class Car {
	//車両番号
	#number;
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
	#remarks = [];

	//コンストラクタ(車両番号,製造年月,...以前の車両ID)
	constructor(number, manufacturedOn, oldNumbers, ...remarks) {
		this.#number = number.toString();
		this.#manufacturedOn = manufacturedOn;
		if (oldNumbers != null) {
			this.#oldNumbers = oldNumbers;
			this.sortOldNumbersByYearMonth();
		}
		for (let i in remarks) {
			this.#remarks.push(remarks[i]);
		}
	}
	//備考追加
	addRemark(remark) {
		this.#remarks.push(remark);
	}
	//改番
	renumber(newNumber, renumberedOn) {
		this.#oldNumbers.push(new OldCarNumber(this.#number, renumberedOn));
		this.#number = newNumber.toString();
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
		this.drop();
	}
	//保存中止(解体)
	unconserve() {
		this.#isConserved = false;
		this.drop();
	}

	get number() {
		return this.#number;
	}
	get oldNumbers() {
		return this.#oldNumbers;
	}
	get droppedOn() {
		return this.#droppedOn;
	}
	get isActive() {
		return !Boolean(this.#droppedOn) && !this.#isConserved;
	}
	get isDropped() {
		return Boolean(this.#droppedOn) && !this.#isConserved;
	}
	get isConserved() {
		return !Boolean(this.#droppedOn) && this.#isConserved;
	}
	get manufacturedOn() {
		return this.#manufacturedOn;
	}
	get remarks() {
		return this.#remarks;
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

	//now時点での車両番号を取得
	numberInTime(now) {
		if (this.#oldNumbers.length == 0) {
			return this.#number;
		} else {
			for (let i in this.#oldNumbers) {
				if (this.#oldNumbers[i].renumberedOn.serial > now.serial) {
					return this.#oldNumbers[i].number;
				}
			}
			return this.#number;
		}
	}

	convertToJSON() {
		let oldNumbers = [];
		for (let i in this.#oldNumbers) {
			oldNumbers.push({ "number": this.#oldNumbers[i].number, "renumberedOn": this.#oldNumbers[i].renumberedOn.serial });
		}
		return JSON.stringify({
			instanceof: "Car",
			number: this.#number,
			oldNumbers: oldNumbers,
			droppedOn: this.#droppedOn == undefined ? undefined : { y: this.#droppedOn.year, m: this.#droppedOn.month },
			isConserved: this.#isConserved,
			manufacturedOn: { y: this.#manufacturedOn.year, m: this.#manufacturedOn.month },
			remarks: this.#remarks
		});
	}
}

//所属クラス
class Belongs {

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
	#remarks = [];

	//コンストラクタ(所属形式,編成名,[所属車両ID],所属 ,YearMonth 編成組成年月,...備考)
	constructor(seriesId, name, cars, belongsTo, formatedOn, ...remarks) {
		this.#seriesId = seriesId;
		this.#name = name;
		this.#cars = cars;
		this.#belongsTo = belongsTo;
		this.#formatedOn = formatedOn;
		for (let i in remarks) {
			this.#remarks.push(remarks[i]);
		}
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
		return this.#name;
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
	get remarks() {
		return this.#remarks;
	}
	set name(name) {
		this.#name = name;
	}
	set belongsTo(belongsTo) {
		this.#belongsTo = belongsTo;
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
			remarks: this.#remarks
		});
	}
}

//編成テンプレートクラス
class FormationTemplate {
	//形式ID
	#seriesId;
	//名前
	#name = "";
	//編成番号の一般形
	#formationName;
	//[車両番号の一般形]
	#carNumbers = [];

	//コンストラクタ(形式ID,編成テンプレート詳細,[車両番号の一般形],ベースとなる編成番号の一般形(省略時は1号車の車番を利用))
	//一般形にはnの関数を指定
	constructor(seriesId, name, carNumbers, formationName) {
		this.seriesId = seriesId;
		this.name = name || this.#name;
		this.carNumbers = carNumbers;
		if (formationName != null) {
			this.formationName = formationName;
		}
	}
	set seriesId(value) {
		this.#seriesId = value;
	}
	set name(value) {
		this.#name = value;
	}
	set carNumbers(carNumbers) {
		this.#carNumbers = [];
		for (let i in carNumbers) {
			this.#carNumbers.push(FormationTemplate.convertToFunction(carNumbers[i], this));
		}
	}
	set formationName(formationName) {
		if (formationName == "") {
			this.#formationName = "";
		} else {
			this.#formationName = FormationTemplate.convertToFunction(formationName, this);
		}
	}
	get seriesId() {
		return this.#seriesId;
	}
	get name() {
		return this.#name;
	}
	get formationName() {
		if (this.#formationName != undefined && this.#formationName != "") {
			return this.#formationName;
		} else {
			return n => this.carNumbers[0](n) + "F";
		}
	}
	get carNumbers() {
		return this.#carNumbers;
	}
	addCarNumber(carNumber) {
		this.#carNumbers.push(FormationTemplate.convertToFunction(carNumber, this));
	}

	convertToJSON() {
		return JSON.stringify({
			instanceof: "FormationTemplate",
			seriesId: this.#seriesId,
			name: this.#name,
			formationName: this.#formationName,
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