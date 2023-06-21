// 各種一覧クラス

//全形式一覧クラス
class AllSerieses {
	#serieses = [];

	get seriesesList() {
		return this.#serieses;
	}
	addSeries(series) {
		this.#serieses.push(series);
		return this.#serieses.length - 1;
	}
}

//全車両一覧クラス
class AllCars {
	#cars = [];

	//車両改番(改番する車両ID,改番後の番号,YearMonth 改番年月)
	renumberCar(carId, newNumber, renumberedOn) {
		if (renumberedOn == undefined) {
			renumberedOn = now;
		}
		this.#cars[carId].renumber(newNumber, renumberedOn);
	}
	//車両廃車(廃車する車両ID,YearMonth 廃車年月)
	dropCar(carId, droppedOn) {
		if (droppedOn == undefined) {
			droppedOn = now;
		}
		this.#cars[carId].drop(droppedOn);
	}
	//now時点で現役な車両
	activeCarsListInTime(now) {
		let carsList = {};
		for (let i in this.#cars) {
			if (this.#cars[i].isActiveInTime(now)) {
				carsList[i] = this.#cars[i]
			}
		}
		return carsList;
	}
	activeCarIdsListInTime(now) {
		let carsList = [];
		for (let i in this.#cars) {
			if (this.#cars[i].isActiveInTime(now)) {
				carsList.push(Number(i));
			}
		}
		return carsList;
	}

	//車両番号で検索
	searchCarNumber(number) {
		let carsList = {};
		for (let i in this.#cars) {
			if (this.#cars[i].number == number) {
				carsList[i] = this.#cars[i]
			}
		}
		return carsList;
	}

	get carsList() {
		return this.#cars;
	}
	get droppedCars() {
		let cars = {}
		for (let i in this.#cars) {
			if (this.#cars[i].isDropped) {
				cars[i] = this.#cars[i];
			}
		}
		return cars;
	}
	addCar(car) {
		if (car instanceof Car) {
			this.#cars.push(car);
			return this.#cars.length - 1;
		} else {
			console.error("Carクラスのオブジェクトを追加してください");
		}
	}
}

//全編成一覧クラス
class AllFormations {
	#formations = [];

	//編成追加
	addFormation(formation) {
		if (formation instanceof Formation) {
			this.#formations.push(formation);
			return this.#formations.length - 1;
		} else {
			console.error("Formationクラスのオブジェクトを追加してください");
		}
	}

	//テンプレートから編成追加(AllCars 全車両リスト,テンプレート, 番号, 所属, 組成年月(省略時は現在年月))
	addFormationFromTemplate(allCars, formationTemplate, number, belongsTo, ym) {
		if (belongsTo == "") { belongsTo = null; }
		if (ym == null) { ym = now; }
		let baseCarNums = formationTemplate.carNumbers;
		let carIds = [];
		for (let i in baseCarNums) {
			carIds.push(allCars.addCar(new Car(baseCarNums[i](number).toString(), ym)));
		}
		return { "carIds": carIds, "formationId": this.addFormation(new Formation(formationTemplate.seriesId, formationTemplate.formationName(number).toString(), carIds, belongsTo, ym)) };
	}

	//編成解除
	releaseFormation(formationId, terminatedOn) {
		if (terminatedOn == null) {
			terminatedOn = now;
		}
		this.#formations[formationId].release(terminatedOn);
	}

	get formationsList() {
		return this.#formations;
	}

	//形式IDから特定形式の全編成を取得
	getBySeriesId(seriesId) {
		let list = {};
		for (let formationId in this.#formations) {
			if (this.#formations[formationId].seriesId == seriesId) {
				list[formationId] = this.#formations[formationId];
			}
		}
		return list;
	}
	//形式IDと現在年月から、現在組成されている(組成年月<=現在年月<解除年月である)特定形式の全編成を取得
	getBySeriesIdAndYearMonth(seriesId, ym) {
		let list = {};
		for (let formationId in this.#formations) {
			//形式が合致する場合処理
			if (this.#formations[formationId].seriesId == seriesId) {
				if (this.isStillEnrolled(formationId, ym)) {
					list[formationId] = this.#formations[formationId];
				}
			}
		}
		return list;
	}
	//現在年月から、現在組成されている(組成年月<=現在年月<解除年月である)全編成を取得
	getFormationsByYearMonth(ym) {
		let list = {};
		for (let formationId in this.#formations) {
			if (this.isStillEnrolled(formationId, ym)) {
				list[formationId] = this.#formations[formationId];
			}
		}
		return list;
	}

	//編成を編成番号順に並び替えたリストを返す
	sortFormationByFormationNumber() {
		return Array.from(this.#formations).sort((f1, f2) => {
			if (f1.name < f2.name) {
				return -1
			} else if (f1.name > f2.name) {
				return 1
			} else {
				return 0
			}
		});
	}

	//車両IDから現時点での所属編成を探し編成IDで返す(見つからなかった場合-1を返す)
	searchByCarId(targetCarId, ym) {
		for (let formationId in this.#formations) {
			if (this.isStillEnrolled(formationId, ym)) {
				for (let i in this.#formations[formationId].cars) {
					if (this.#formations[formationId].cars[i] == targetCarId) {
						return formationId;
					}
				}
			}
		}
		return -1;
	}

	//年月ym現在で現役の編成かどうか
	isStillEnrolled(formationId, ym) {
		// 組成年月
		let formatedOn = this.#formations[formationId].formatedOn.serial;
		// 解除年月
		let terminatedOn = this.#formations[formationId].terminatedOn == null ? ym.serial + 1 : this.#formations[formationId].terminatedOn.serial;
		return formatedOn <= ym.serial && ym.serial < terminatedOn;
	}
}

//全編成テンプレート一覧クラス
class AllFormationTemplates {
	#formationTemplates = [];

	addFormationTemplate(formationTemplate) {
		if (formationTemplate instanceof FormationTemplate) {
			this.#formationTemplates.push(formationTemplate);
			return this.#formationTemplates.length - 1;
		} else {
			console.error("FormationTemplateクラスのオブジェクトを追加してください");
		}
	}
	getFormationTemplate(id) {
		return this.#formationTemplates[id];
	}
	getFormationTemplateList() {
		return this.#formationTemplates;
	}
}
//各種一覧クラス定義ここまで