//以下、シリアライズ関連

//デシリアライザクラス
class Deserializer {
	static fromJSON(json) {
		return Deserializer.fromObject(JSON.parse(json));
	}
	static fromObject(obj) {
		switch (obj.instanceof) {
			case "Series":
				let series = new Series(obj.name, obj.base, obj.description, obj.isHidden);
				return series;
			case "Car":
				let oldNumbers = [];
				for (let i in obj.oldNumbers) {
					oldNumbers.push(new OldCarNumber(obj.oldNumbers[i].number, new YearMonth(obj.oldNumbers[i].renumberedOn)))
				}
				let car = new Car(obj.number, new YearMonth(obj.manufacturedOn.y, obj.manufacturedOn.m), oldNumbers, obj.remark);
				if (Boolean(obj.droppedOn)) {
					car.drop(new YearMonth(obj.droppedOn.y, obj.droppedOn.m));
				}
				if (obj.isConserved) {
					car.conserve();
				}
				return car;
			case "Formation":
				let formation = new Formation(obj.seriesId, obj.name, obj.cars, obj.belongsTo, new YearMonth(obj.formatedOn.y, obj.formatedOn.m), obj.remark);
				if (obj.terminatedOn.y != "" && obj.terminatedOn.m != "") {
					formation.release(new YearMonth(obj.terminatedOn.y, obj.terminatedOn.m));
				}
				return formation;
			case "FormationTemplate":
				let formationTemplate = new FormationTemplate(obj.seriesId, obj.name, obj.carNumbers, obj.formationName);
				return formationTemplate;
		}
	}
}

//各種一覧JSON出力
function generateJSON() {
	//形式
	let seriesList = AllSerieses.seriesesList;
	let seriesJSON = "";
	for (let seriesId in seriesList) {
		seriesJSON += seriesId != 0 ? "," : "";
		seriesJSON += seriesList[seriesId].convertToJSON();
	}
	//車両
	let carList = AllCars.carsList;
	let carJSON = "";
	for (let carId = 0; carId < carList.length; carId++) {
		carJSON += carId != 0 ? "," : "";
		if (carList[carId] == undefined) {
			carJSON += "null";
			continue;
		}
		carJSON += carList[carId].convertToJSON();
	}
	//編成
	let formationList = AllFormations.formationsList;
	let formationJSON = "";
	for (let formationId = 0; formationId < formationList.length; formationId++) {
		formationJSON += formationId != 0 ? "," : "";
		if (formationList[formationId] == undefined) {
			formationJSON += "null";
			continue;
		}
		formationJSON += formationList[formationId].convertToJSON();
	}
	//編成テンプレート
	let formationTemplateList = AllFormationTemplates.getFormationTemplateList();
	let formationTemplateJSON = "";
	for (let formationTemplateId in formationTemplateList) {
		formationTemplateJSON += formationTemplateId != 0 ? "," : "";
		formationTemplateJSON += formationTemplateList[formationTemplateId].convertToJSON();
	}
	return `{"settings":${JSON.stringify(settings)},"minYearMonth":{"y":${minYearMonth.year},"m":${minYearMonth.month}},"maxYearMonth":{"y":${maxYearMonth.year},"m":${maxYearMonth.month}},"serieses":[${seriesJSON}],"cars":[${carJSON}],"formations":[${formationJSON}],"formationTemplates":[${formationTemplateJSON}]}`;
}

//無限ループ対策
let loadJSONLoopCount = 0;
//各種一覧JSONから読み込み
function loadListsFromJSON(json) {
	loadJSONLoopCount++;

	//現在データのバックアップ
	let currentData = generateJSON();

	try {
		//リセット
		resetAllLists();

		//JSON→Object
		let obj = JSON.parse(json);

		//設定の読み込み
		if (obj.settings != null) {
			for (let settingOption in settings) {
				settings[settingOption] = obj.settings[settingOption];
			}
			loadSetting();
		}

		//編成表の読み込み
		for (let seriesId in obj.serieses) {
			AllSerieses.addSeries(Deserializer.fromObject(obj.serieses[seriesId]));
		}
		for (let carId in obj.cars) {
			if (obj.cars[carId] == null) {
				AllCars.carsList.length++;
				continue;
			}
			AllCars.addCar(Deserializer.fromObject(obj.cars[carId]));
		}
		for (let formationId in obj.formations) {
			if (obj.formations[formationId] == null) {
				AllFormations.formationsList.length++;
				continue;
			}
			AllFormations.addFormation(Deserializer.fromObject(obj.formations[formationId]));
		}
		for (let formationTemplateId in obj.formationTemplates) {
			AllFormationTemplates.addFormationTemplate(Deserializer.fromObject(obj.formationTemplates[formationTemplateId]));
		}

		//年月の読み込み
		minYearMonth = new YearMonth(obj.minYearMonth.y, obj.minYearMonth.m);
		maxYearMonth = new YearMonth(obj.maxYearMonth.y, obj.maxYearMonth.m);

		setInputMaxAndMin();
		Dialog.offAll();
		refresh();
		loadJSONLoopCount = 0;
		return true;
	} catch (error) {
		console.log(error)
		if (loadJSONLoopCount < 2) {
			loadListsFromJSON(currentData);
			setTimeout(() => { Dialog.list.alertDialog.functions.display(Message.list["MA008"]); }, 10);
		} else {
			setTimeout(() => { Dialog.list.alertDialog.functions.display(Message.list["MA009"]); }, 20);
			loadJSONLoopCount = 0;
		}
		return false;
	}
}

//ファイル保存
function saveFile(name, text) {
	let blob = new Blob([text], { type: "text/plan" });
	let link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = name;
	link.click();
}