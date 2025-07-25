// 各種一覧クラス

//全形式一覧クラス
class AllSerieses {
	static #serieses = [];

	static get seriesesList() {
		return AllSerieses.#serieses;
	}
	static addSeries(series) {
		AllSerieses.#serieses.push(setObservedInstance(series, refresh));
		return AllSerieses.#serieses.length - 1;
	}

	static reset() {
		AllSerieses.#serieses = setObservedArray([], refresh);
	}
}

//全車両一覧クラス
class AllCars {
	static #cars = [];

	//車両改番(改番する車両ID,改番後の番号,YearMonth 改番年月)
	static renumberCar(carId, newNumber, renumberedOn) {
		if (renumberedOn == undefined) {
			renumberedOn = now;
		}
		AllCars.#cars[carId].renumber(newNumber, renumberedOn);
	}
	//車両廃車(廃車する車両ID,YearMonth 廃車年月)
	static dropCar(carId, droppedOn) {
		if (droppedOn == undefined) {
			droppedOn = now;
		}
		AllCars.#cars[carId].drop(droppedOn);
	}
	//now時点で現役な車両
	static activeCarsListInTime(now) {
		let carsList = {};
		for (let i in AllCars.#cars) {
			if (AllCars.#cars[i].isActiveInTime(now)) {
				carsList[i] = AllCars.#cars[i]
			}
		}
		return carsList;
	}
	static activeCarIdsListInTime(now) {
		let carsList = [];
		for (let i in AllCars.#cars) {
			if (AllCars.#cars[i].isActiveInTime(now)) {
				carsList.push(Number(i));
			}
		}
		return carsList;
	}

	//車両番号で検索
	static searchCarNumber(number) {
		let carsList = {};
		for (let i in AllCars.#cars) {
			if (AllCars.#cars[i].number == number) {
				carsList[i] = AllCars.#cars[i]
			}
		}
		return carsList;
	}

	static get carsList() {
		return AllCars.#cars;
	}
	static get droppedCars() {
		let cars = {}
		for (let i in AllCars.#cars) {
			if (AllCars.#cars[i].isDropped) {
				cars[i] = AllCars.#cars[i];
			}
		}
		return cars;
	}
	static addCar(car) {
		if (car instanceof Car) {
			AllCars.#cars.push(setObservedInstance(car, refresh));
			return AllCars.#cars.length - 1;
		} else {
			console.error("Carクラスのオブジェクトを追加してください");
		}
	}
	static getNewestNumberByRegExp(regExp) {
		if (!(regExp instanceof RegExp)) {
			regExp = new RegExp(regExp);
		}
		const numberList = [];
		AllCars.#cars.forEach(car => {
			const regExpRes = regExp.exec(car.number);
			if (regExpRes != null) {
				numberList.push(Number(regExpRes[1]));
			}
		});
		return Math.max(...numberList);
	}

	//指定車両を空にする
	static makeBrank(carId) {
		delete AllCars.#cars[carId];
	}
	static reset() {
		AllCars.#cars = setObservedArray([], refresh);
	}
}

//全編成一覧クラス
class AllFormations {
	static #formations = [];

	//編成追加
	static addFormation(formation) {
		if (formation instanceof Formation) {
			AllFormations.#formations.push(setObservedInstance(formation, refresh));
			return AllFormations.#formations.length - 1;
		} else {
			console.error("Formationクラスのオブジェクトを追加してください");
		}
	}

	//テンプレートから編成追加(AllCars 全車両リスト,テンプレート, 番号, 所属, 組成年月(省略時は現在年月))
	static addFormationFromTemplate(allCars, formationTemplate, number, belongsTo, ym) {
		if (belongsTo == "") { belongsTo = null; }
		if (ym == null) { ym = now; }
		let baseCarNums = formationTemplate.carNumbers;
		let carIds = [];
		for (let i in baseCarNums) {
			carIds.push(allCars.addCar(new Car(baseCarNums[i](number).toString(), ym)));
		}
		return { "carIds": carIds, "formationId": AllFormations.addFormation(new Formation(formationTemplate.seriesId, formationTemplate.formationName(number).toString(), carIds, belongsTo, ym)) };
	}

	//編成解除
	static releaseFormation(formationId, terminatedOn) {
		if (terminatedOn == null) {
			terminatedOn = now;
		}
		AllFormations.#formations[formationId].release(terminatedOn);
		refresh();
	}

	static get formationsList() {
		return AllFormations.#formations;
	}

	//形式IDから特定形式の全編成を取得
	static getBySeriesId(seriesId) {
		let list = {};
		for (let formationId in AllFormations.#formations) {
			if (AllFormations.#formations[formationId].seriesId == seriesId) {
				list[formationId] = AllFormations.#formations[formationId];
			}
		}
		return list;
	}
	//形式IDと現在年月から、現在組成されている(組成年月<=現在年月<解除年月である)特定形式の全編成を取得
	static getBySeriesIdAndYearMonth(seriesId, ym) {
		let list = {};
		for (let formationId in AllFormations.#formations) {
			//形式が合致する場合処理
			if (AllFormations.#formations[formationId].seriesId == seriesId) {
				if (AllFormations.isStillEnrolled(formationId, ym)) {
					list[formationId] = AllFormations.#formations[formationId];
				}
			}
		}
		return list;
	}
	//現在年月から、現在組成されている(組成年月<=現在年月<解除年月である)全編成を取得
	static getFormationsByYearMonth(ym) {
		let list = {};
		for (let formationId in AllFormations.#formations) {
			if (AllFormations.isStillEnrolled(formationId, ym)) {
				list[formationId] = AllFormations.#formations[formationId];
			}
		}
		return list;
	}

	//編成を編成番号順に並び替えたリストを返す
	static sortFormationByFormationNumber() {
		return Array.from(AllFormations.#formations).sort((f1, f2) => {
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
	static searchByCarId(targetCarId, ym) {
		for (let formationId in AllFormations.#formations) {
			if (AllFormations.isStillEnrolled(formationId, ym)) {
				for (let i in AllFormations.#formations[formationId].cars) {
					if (AllFormations.#formations[formationId].cars[i] == targetCarId) {
						return formationId;
					}
				}
			}
		}
		return -1;
	}

	//車両IDからその車両が所属したことのある全ての編成を探し編成IDの配列で返す(見つからなかった場合空の配列を返す)
	static searchAllByCarId(targetCarId) {
		let formations = [];
		for (let formationId in AllFormations.#formations) {
			for (let i in AllFormations.#formations[formationId].cars) {
				if (AllFormations.#formations[formationId].cars[i] == targetCarId) {
					formations.push(formationId);
					break;
				}
			}
		}
		return formations;
	}

	//年月ym現在で現役の編成かどうか
	static isStillEnrolled(formationId, ym) {
		// 組成年月
		let formatedOn = AllFormations.#formations[formationId].formatedOn.serial;
		// 解除年月
		let terminatedOn = AllFormations.#formations[formationId].terminatedOn == null ? ym.serial + 1 : AllFormations.#formations[formationId].terminatedOn.serial;
		return formatedOn <= ym.serial && ym.serial < terminatedOn;
	}

	//指定編成を空にする
	static makeBrank(formationId) {
		delete AllFormations.#formations[formationId];
	}

	static reset() {
		AllFormations.#formations = setObservedArray([], refresh);
	}
}

//全編成テンプレート一覧クラス
class AllFormationTemplates {
	static #formationTemplates = [];

	static addFormationTemplate(formationTemplate) {
		if (formationTemplate instanceof FormationTemplate) {
			AllFormationTemplates.#formationTemplates.push(setObservedInstance(formationTemplate, refresh));
			return AllFormationTemplates.#formationTemplates.length - 1;
		} else {
			console.error("FormationTemplateクラスのオブジェクトを追加してください");
		}
	}
	static getFormationTemplate(id) {
		return AllFormationTemplates.#formationTemplates[id];
	}
	static getFormationTemplateList() {
		return AllFormationTemplates.#formationTemplates;
	}

	static reset() {
		AllFormationTemplates.#formationTemplates = setObservedArray([], refresh);
	}
}
//各種一覧クラス定義ここまで


//全クラスリセット
function resetAllLists() {
	AllSerieses.reset();
	AllCars.reset();
	AllFormations.reset();
	AllFormationTemplates.reset();
}