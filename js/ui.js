//各種設定
const settings = {
	isAutoSaveEnabled: true,
	autoSaveInterval: 1,
	themeColors: {},
	seriesOrder: [],
	isDisplayGridMode: false,
	sortMode: "",
	fileName: ""
};
const carSymPattern = new RegExp("^([A-Za-z]+)");
const carNumPattern = new RegExp("([0-9]+)$");

//JSONを保存ウインドウ表示
function showJSONOutputDialog() {
	saveFile(settings.fileName ? settings.fileName : "formation.json", generateJSON())
}

//JSON読み込み
function showJSONLoadDialog() {
	document.getElementById("jsonReader").click();
}
let tmpJSON = "";
function readJson(evt) {
	let files = evt.target.files;
	let reader = new FileReader();
	reader.readAsText(files[0]);
	reader.onload = function (e) {
		tmpJSON = e.target.result;
		Dialog.list.confirmDialog.functions.display(Message.list["MC001"], () => { continueReadJSON(files[0].name) }, () => { document.getElementById("jsonReader").value = ""; tmpJSON = ""; });
	}
}
function continueReadJSON(fileName) {
	loadListsFromJSON(tmpJSON);
	settings.fileName = fileName;
	tmpJSON = "";
}

//現存編成の編成表を表に出力
function list() {
	//ソート
	let seriesList = AllSerieses.seriesesList;
	let carIdListNow = [];
	let carNumberListNow = [];
	let tables = [];
	let html = "";

	//編成に組み込まれている車両
	let proccessedCarIds = [];


	//形式ごとに処理
	for (let seriesId in seriesList) {
		//テーブルを生成
		tables.push(new Table(`${seriesList[seriesId].name}<button class="lsf-icon" icon="pen" onclick="Dialog.list.createSeriesDialog.functions.display(${seriesId})">編集</button>`));
		let currentTable = tables.at(-1);
		currentTable.setSubtitle(seriesList[seriesId].description);
		currentTable.setAttributes({ "class": `formation-table row-hover-hilight horizontal-stripes${seriesList[seriesId].isHidden ? " hidden" : ""}` });
		//現時点で組成されている編成を取得
		let formationList = AllFormations.getBySeriesIdAndYearMonth(seriesId, now);

		//ソート
		let natSorter = natsort();
		let sortFunc;
		if (settings.sortMode == "car-count") {
			sortFunc = (f1, f2) => {
				let f1l = formationList[f1].cars.length;
				let f2l = formationList[f2].cars.length;
				return f1l > f2l ? 1 : f1l < f2l ? -1 : natSorter(formationList[f1].name, formationList[f2].name);
			};
		} else if (settings.sortMode == "formated-on") {
			sortFunc = (f1, f2) => {
				let f1l = formationList[f1].formatedOn.serial;
				let f2l = formationList[f2].formatedOn.serial;
				return f1l > f2l ? 1 : f1l < f2l ? -1 : natSorter(formationList[f1].name, formationList[f2].name);
			};
		} else if (settings.sortMode == "manufactured-on") {
			sortFunc = (f1, f2) => {
				let c1 = Math.min(...formationList[f1].cars.map(carId => AllCars.carsList[carId].manufacturedOn.serial));
				let c2 = Math.min(...formationList[f2].cars.map(carId => AllCars.carsList[carId].manufacturedOn.serial));
				return c1 > c2 ? 1 : c1 < c2 ? -1 : natSorter(formationList[f1].name, formationList[f2].name);
			};
		} else {
			sortFunc = (f1, f2) => {
				return natSorter(formationList[f1].name, formationList[f2].name);
			};
		}
		let formationIds = Object.keys(formationList).sort(sortFunc);


		//編成ごとに処理
		for (let formationId of formationIds) {
			//行を追加
			currentTable.addRow();
			//編成番号セルを追加
			currentTable.addCell(`${formationList[formationId].name}<button onclick="Dialog.list.formationDetealDialog.functions.display(${formationId})" class="lsf-icon" icon="search">編成詳細</button>`, { "class": `formation-name` });
			//車両ごとに処理
			let carsOnFormation = formationList[formationId].cars;
			for (let i in carsOnFormation) {
				addCarCell(currentTable, carsOnFormation[i], carIdListNow, carNumberListNow, true);
				proccessedCarIds.push(carsOnFormation[i]);
			}
			//所属地セルを追加
			//currentTable.addCell(formationList[formationId].belongsTo==null?"運用離脱":formationList[formationId].belongsTo,{"class":"belongs"});
			//車齢セルを追加
			currentTable.addCell(`${(new YearMonth(Math.min(...formationList[formationId].cars.map(carId => Number(AllCars.carsList[carId].manufacturedOn.serial))))).toStringWithLink()}`);
			//組成年月セルを追加
			currentTable.addCell(`${formationList[formationId].formatedOn.toStringWithLink()}～${formationList[formationId].isTerminated ? formationList[formationId].terminatedOn.toStringWithLink() : ""}`);
			//備考セルを追加
			currentTable.addCell(formationList[formationId].remark == "" ? "-" : formationList[formationId].remark);
		}
		currentTable.addBlankCellToRowIn(3);
		html += currentTable.generateTable();
	}

	//編成に組み込まれていない車両を処理
	tables.push(new Table("編成に所属していない車両"));
	let notFormatedCarsTable = tables.at(-1);
	notFormatedCarsTable.setAttributes({ "class": "not-formated-car-table vertical-stripes" });
	tables.push(new Table("保存されている車両"));
	let conservedCarsTable = tables.at(-1);
	conservedCarsTable.setAttributes({ "class": "not-formated-car-table vertical-stripes", id: "conserved-car-table" });
	for (let carId in AllCars.carsList) {
		//編成に組み込まれている車両および未製造の車両および廃車は除外する
		if (proccessedCarIds.includes(Number(carId)) || AllCars.carsList[carId].manufacturedOn.serial > now.serial) {
			continue;
		} else {
			if (AllCars.carsList[carId].isConservedInTime(now)) {
				//保存されている車両
				if (conservedCarsTable.cellCountOfLastRow % 10 == 0) {
					conservedCarsTable.addRow();
				}
				addCarCell(conservedCarsTable, carId, carIdListNow, [], false, true);
			} else if (!AllCars.carsList[carId].isDroppedInTime(now)) {
				//現役で、編成に組み込まれていない車両
				if (notFormatedCarsTable.cellCountOfLastRow % 10 == 0) {
					notFormatedCarsTable.addRow();
				}
				addCarCell(notFormatedCarsTable, carId, carIdListNow, carNumberListNow, false);
			}
		}
	}
	if (notFormatedCarsTable.rows.length != 0) {
		html += notFormatedCarsTable.generateTable();
	}
	if (conservedCarsTable.rows.length != 0) {
		html += conservedCarsTable.generateTable();
	}

	//車両番号の重複をチェック
	let duplicationNumbers = carNumberListNow.map(carnum => carnum.match(carNumPattern)[0]).filter((x, i, self) => {
		function isEqual(y) {
			return y == x;
		}
		return self.findIndex(isEqual) === i && i !== self.findLastIndex(isEqual);
	});

	document.getElementById("formation-table-container").innerHTML = html;

	//重複ハイライト
	if (duplicationNumbers.length > 0) {
		let tds = document.querySelectorAll("#formation-table-container td.car");
		for (let j in duplicationNumbers) {
			for (let td of tds) {
				if (td.innerText.split("\n")[1] == duplicationNumbers[j]) {
					td.classList.add("duplicated-carnumber");
				}
			}
		}

		//車両番号の重複があった場合、車両そのものの重複がないかもチェック
		let duplicationCars = carIdListNow.filter(function (x, i, self) {
			return self.indexOf(x) === i && i !== self.lastIndexOf(x);
		});
		if (duplicationCars.length > 0) {
			duplicationCars.forEach((carId) => {
				document.querySelectorAll(`.car-id-${carId}`).forEach((td) => {
					td.classList.add("duplicated-car")
				})
			});
		}
		let warningMessage = document.createElement("div");
		warningMessage.classList.add("warning");
		warningMessage.classList.add("message");
		warningMessage.innerHTML = `${Message.list["MS001"]}${(duplicationCars.length > 0) ? Message.list["MA011"] : Message.list["MA010"]}`;
		document.getElementById("formation-table-container").prepend(warningMessage);
	}
}

//車両セルの追加
//Table, 車両ID, 処理中の車両リスト, 今編成内の車両を処理しているか
function addCarCell(table, carId, carIdListNow, carNumberListNow, isInFormation, isConvercedCar) {
	if (AllCars.carsList[carId].isDroppedInTime(now) && !Boolean(isConvercedCar)) {
		if (isInFormation) { table.addCell("") }
	} else {
		let carNumber = AllCars.carsList[carId].numberInTime(now);
		table.addCell(Formatter.link(carId, carNumber), { "class": "car" + ` car-id-${carId}` + (AllCars.carsList[carId].isDroppedInTime(now) ? " dropped" : "") });
		carIdListNow.push(carId);
		carNumberListNow.push(carNumber)
	}
}

//編成に所属していない車両のリストアップ
function listUpNotFormatedCarIds() {
	let carIdsList = [];
	let enrolledFormations = AllFormations.getFormationsByYearMonth(now);
	for (let i in enrolledFormations) {
		for (let j in enrolledFormations[i].cars) {
			carIdsList.push(enrolledFormations[i].cars[j]);
		}
	}
	return AllCars.activeCarIdsListInTime(now).filter((x) => {
		return carIdsList.indexOf(x) == -1 && AllCars.carsList[x].isActiveInTime(now);
	});
}

let isRefreshable = true;

//表示を最新の状態にリフレッシュ
function refresh() {
	if (!isRefreshable) { return }

	//自動セーブ
	autoSave();

	//リストを表示
	list();

	//年月を反映
	document.getElementById("now-range").value = now.serial;
	document.getElementById("now-y").value = now.year;
	document.getElementById("now-m").value = now.month;

	//ダイアログ内の表示を更新
	if (Dialog.list.carDetealDialog.isActive) {
		Dialog.list.carDetealDialog.functions.display(Number(document.getElementById("cardt-car-id").innerHTML));
	}
	if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
		Dialog.list.createFormationFromFloatingCarsDialog.functions.display();
	}
}


//以下、ダイアログ関連

//セレクトボックスに形式名を投入
function setSeriesesToSelectBox(seriesSelectBox) {
	seriesSelectBox.innerHTML = "";
	for (let i in AllSerieses.seriesesList) {
		if (AllSerieses.seriesesList[i].isHidden) { continue; }
		let option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = AllSerieses.seriesesList[i].name;
		seriesSelectBox.appendChild(option);
	}
}
//セレクトボックスに車両名を投入
function setCarsToSelectBox(carSelectBox, exceptedCarIds) {
	carSelectBox.innerHTML = "";
	for (let i in AllCars.carsList) {
		let option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = `${AllCars.carsList[i].number} (ID:${i})`;
		if (exceptedCarIds.includes(Number(i))) {
			option.setAttribute("disabled", "disabled");
		}
		carSelectBox.appendChild(option);
	}
}

//車両を廃車
function dropCar(carId_) {
	//引数がない場合、ダイアログからの処理
	if (carId_ == undefined) {
		//親ダイアログが表示されている状態以外での実行を禁止
		if (Dialog.list.carDetealDialog.isActive) {
			let carId = Number(document.getElementById("cardt-car-id").innerHTML);
			if (AllCars.carsList[carId].isDropped) {
				Dialog.list.alertDialog.functions.display("この車両は既に廃車されています。");
				return;
			}
			Dialog.list.confirmDialog.functions.display(Message.list["MC004"].toString({ "carNumber": AllCars.carsList[carId].numberInTime(now), "now": now.toString() }), function () {
				//廃車
				dropCar(carId);
				//廃車車両を除いた車両で編成
				Dialog.list.carDetealDialog.off();
				Dialog.list.carDetealDialog.functions.display(carId);
			});
		}
		//引数がある場合、廃車処理
	} else {
		//廃車
		AllCars.dropCar(carId_, now);
		let formationId = AllFormations.searchByCarId(carId_, now);
		//編成に所属していた場合、編成を解除
		if (formationId != -1) {
			let cars = AllFormations.formationsList[formationId].cars;
			let seriesId = AllFormations.formationsList[formationId].seriesId;
			let name = AllFormations.formationsList[formationId].name;
			let belongsTo = AllFormations.formationsList[formationId].belongsTo;
			let isTerminated = AllFormations.formationsList[formationId].isTerminated;
			let terminatedOn = AllFormations.formationsList[formationId].terminatedOn;
			//編成解除
			AllFormations.releaseFormation(formationId, now);
			//廃車した車両を除いて編成再組成
			let newFormationCars = [];
			for (let i in cars) {
				if (cars[i] != carId_) {
					newFormationCars.push(cars[i]);
				}
			}
			//新しい編成の車両数が0両だった場合、編成の作成を行わない
			if (newFormationCars != 0) {
				let newFormationId = AllFormations.addFormation(new Formation(seriesId, name, newFormationCars, belongsTo, now));
				//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
				if (isTerminated) {
					AllFormations.releaseFormation(newFormationId, terminatedOn);
				}
				//廃車した車両が未来に組成されている編成のメンバとして在籍している場合、除外する
				for (let i in AllFormations.formationsList) {
					if (AllFormations.formationsList[i].formatedOn.serial >= now.serial) {
						AllFormations.formationsList[i].removeCarByCarId(carId_);
					}
				}
			}
		}
	}
}
//ダイアログ関連ここまで

//自動セーブ
let autoSaveCount = 0;
let autoSaveStatusArea;
function autoSave(isForce) {
	if (Boolean(isForce) || (settings.isAutoSaveEnabled && autoSaveCount % settings.autoSaveInterval == 0)) {
		setAutoSaveData();
		autoSaveStatusArea.innerHTML = "済";
		autoSaveStatusArea.classList.add("done");
	} else {
		autoSaveStatusArea.innerHTML = "未";
		autoSaveStatusArea.classList.remove("done");
	}
	//自動試行(強制実施モード以外)回数を記録
	if (!Boolean(isForce)) {
		autoSaveCount++;
	}
}
function setAutoSaveData() {
	localStorage.setItem('formation-autosave', generateJSON());
}
function getAutoSavedData() {
	return localStorage.getItem("formation-autosave");
}
function loadAutoSavedData() {
	loadListsFromJSON(getAutoSavedData());
}

//設定
function setPanelDisplayMode(isGridMode) {
	settings.isDisplayGridMode = isGridMode;
	if (isGridMode) {
		document.getElementById("formation-table-container").classList.add("grid-mode");
		document.getElementById("panel-display-mode-controller").classList.add("grid-mode");
	} else {
		document.getElementById("formation-table-container").classList.remove("grid-mode");
		document.getElementById("panel-display-mode-controller").classList.remove("grid-mode");
	}
	autoSave(true);
}
function setSortMode(mode) {
	settings.sortMode = mode;
	document.getElementById("panel-sort-mode-controller").classList = "";
	if (mode == "car-count") {
		document.getElementById("panel-sort-mode-controller").classList.add("car-count-mode");
	} else if (mode == "car-number") {
		document.getElementById("panel-sort-mode-controller").classList.add("car-number-mode");
	} else if (mode == "manufactured-on") {
		document.getElementById("panel-sort-mode-controller").classList.add("manufactured-on-mode");
	} else {
		document.getElementById("panel-sort-mode-controller").classList.add("formated-on-mode");
	}
	autoSave(true);
	refresh();
}
function loadSetting() {
	setPanelDisplayMode(settings.isDisplayGridMode);
	setSortMode(settings.sortMode);
}

//現在年月の操作
function updateNowYearMonth(ym) {
	now = ym;
	refresh();
}
function updateNowYearMonthByObject(ym) {
	now = new YearMonth(ym.year, ym.month);
}
function updateNowYearMonthByInputBoxes() {
	updateNowYearMonth(new YearMonth(Number(document.getElementById("now-y").value), Number(document.getElementById("now-m").value)));
}
function setInputMaxAndMin() {
	document.getElementById("now-range").setAttribute("min", minYearMonth.serial);
	document.getElementById("now-range").setAttribute("max", maxYearMonth.serial);

	if (minYearMonth.serial > now.serial) {
		updateNowYearMonthByObject(minYearMonth);
	} else if (maxYearMonth.serial < now.serial) {
		updateNowYearMonthByObject(maxYearMonth);
	}

	document.getElementById("now-y").setAttribute("min", minYearMonth.year);
	document.getElementById("now-y").setAttribute("max", maxYearMonth.year);
}

//年月関連のグローバル変数の定義
let now = new YearMonth();
let minYearMonth;
let maxYearMonth;

window.addEventListener("load", setInputMaxAndMin);