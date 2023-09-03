//JSONを保存ウインドウ表示
function showJSONOutputDialog() {
	saveFile("formation.json", generateJSON())
}

//JSON読み込み
function showJSONLoadDialog() {
	document.getElementById("jsonReader").click();
}
let tmpJSON = "";
function readJson(evt) {
	let file = evt.target.files;
	let reader = new FileReader();
	reader.readAsText(file[0]);
	reader.onload = function (e) {
		tmpJSON = e.target.result;
		Dialog.list.confirmDialog.functions.display(Message.list["MC001"], continueReadJSON, () => { document.getElementById("jsonReader").value = ""; tmpJSON = ""; });
	}
}
function continueReadJSON() {
	loadListsFromJSON(tmpJSON);
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
		tables.at(-1).setSubtitle(seriesList[seriesId].description);
		tables.at(-1).setAttributes({ "class": `formation-table row-hover-hilight horizontal-stripes${seriesList[seriesId].isHidden ? " hidden" : ""}` });
		//現時点で組成されている編成を取得
		let formationList = AllFormations.getBySeriesIdAndYearMonth(seriesId, now);

		//ソート
		let natSorter = natsort();
		let formationIds = Object.keys(formationList).sort((f1, f2) => {
			return natSorter(formationList[f1].name, formationList[f2].name);
		});


		//編成ごとに処理
		for (let formationId of formationIds) {
			//行を追加
			tables.at(-1).addRow();
			//編成番号セルを追加
			tables.at(-1).addCell(`${formationList[formationId].name}<button onclick="Dialog.list.formationDetealDialog.functions.display(${formationId})" class="lsf-icon" icon="search">編成詳細</button>`, { "class": `formation-name` });
			//車両ごとに処理
			let carsOnFormation = formationList[formationId].cars;
			for (let i in carsOnFormation) {
				addCarCell(tables.at(-1), carsOnFormation[i], carIdListNow, carNumberListNow, true);
				proccessedCarIds.push(carsOnFormation[i]);
			}
			//所属地セルを追加
			//tables.at(-1).addCell(formationList[formationId].belongsTo==null?"運用離脱":formationList[formationId].belongsTo,{"class":"belongs"});
			//組成年月セルを追加
			tables.at(-1).addCell(formationList[formationId].formatedOn.toStringWithLink());
			//備考セルを追加
			tables.at(-1).addCell(formationList[formationId].remark == "" ? "-" : formationList[formationId].remark);
		}
		tables.at(-1).addBlankCellToRowIn(1);
		html += tables.at(-1).generateTable();
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
				addCarCell(conservedCarsTable, carId, carIdListNow, carNumberListNow, false, true);
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
	let duplicationNumbers = carNumberListNow.filter(function (x, i, self) {
		return self.indexOf(x) === i && i !== self.lastIndexOf(x);
	});

	document.getElementById("formation-table-container").innerHTML = html;

	//重複ハイライト
	if (duplicationNumbers.length > 0) {
		let tds = document.querySelectorAll("#formation-table-container td.car");
		for (let td of tds) {
			for (let j in duplicationNumbers) {
				if (td.innerHTML.match(new RegExp(`<a href=\\"javascript\\:Dialog\\.list\\.carDetealDialog\\.functions\\.display\\(\\d+\\)\\">${duplicationNumbers[j]}</a>`, "g")) != null) {
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
		table.addCell(Formatter.link(carId, AllCars.carsList[carId].numberInTime(now)), { "class": "car" + ` car-id-${carId}` + (AllCars.carsList[carId].isDroppedInTime(now) ? " dropped" : "") });
		carIdListNow.push(carId);
		carNumberListNow.push(AllCars.carsList[carId].numberInTime(now))
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

//表示を最新の状態にリフレッシュ
function reflesh() {
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
				reflesh();
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
function autoSave() {
	localStorage.setItem('formation-autosave', generateJSON());
}
function getAutoSavedData() {
	return localStorage.getItem("formation-autosave");
}
function loadAutoSavedData() {
	loadListsFromJSON(getAutoSavedData());
}

//現在年月の操作
function updateNowYearMonth(ym) {
	now = ym;
	reflesh();
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
	document.getElementById("now-y").setAttribute("min", minYearMonth.year);
	document.getElementById("now-y").setAttribute("max", maxYearMonth.year);
}

//年月関連のグローバル変数の定義
let now = new YearMonth();
let minYearMonth;
let maxYearMonth;

window.addEventListener("load", setInputMaxAndMin);
window.addEventListener("load", function () {
	//入力欄のイベント
	document.querySelectorAll("span.time-inputs").forEach((inputArea) => {
		let monthInput = inputArea.querySelector(".yearmonth-m");
		monthInput.setAttribute("min", "1");
		monthInput.setAttribute("max", "12");
		monthInput.addEventListener("keydown", (event) => {
			if (event.code == 'ArrowDown' && monthInput.value == '1') {
				monthInput.value = '13';
				inputArea.querySelector('.yearmonth-y').value = Number(inputArea.querySelector('.yearmonth-y').value) - 1
			} else if (event.code == 'ArrowUp' && monthInput.value == '12') {
				monthInput.value = '0';
				inputArea.querySelector('.yearmonth-y').value = Number(inputArea.querySelector('.yearmonth-y').value) + 1
			}
		});
	});

	function confirmToLoadSaveData() {
		Dialog.list.confirmDialog.functions.display(Message.list["MC008"],
			() => {
				//サンプルデータ投入
				AllSerieses.addSeries(new Series("1000系", "西武601系", "あああ"));
				AllSerieses.addSeries(new Series("1400系", "西武411系", "いいい"));
				AllSerieses.addSeries(new Series("E233系", "西武411系", "ううう"));

				AllFormationTemplates.addFormationTemplate(new FormationTemplate(0, "4両編成", [n => 1000 + n, n => 1100 + n, n => 1200 + n, n => 1300 + n]));
				AllFormationTemplates.addFormationTemplate(new FormationTemplate(0, "4両編成50番台", [n => 1050 + n, n => 1150 + n, n => 1250 + n, n => 1350 + n]));
				AllFormationTemplates.addFormationTemplate(new FormationTemplate(1, "3両編成", [n => 1400 + (n * 2 - 1), n => 1400 + (n * 2), n => 1500 + (n * 2 - 1)]));
				AllFormationTemplates.addFormationTemplate(new FormationTemplate(1, "3両編成50番台", [1450, 1550, 1650]));
				AllFormationTemplates.addFormationTemplate(new FormationTemplate(2, "10両編成", [n => `クハE233-${n}`, n => `モハE233-${n}`, n => `モハE232-${n}`, n => `サハE233-${500 + n}`, n => `モハE233-${200 + n}`, n => `モハE232-${200 + n}`, n => `サハE233-${n}`, n => `モハE233-${400 + n}`, n => `モハE232-${400 + n}`, n => `クハE232-${n}`], (n) => `T${n}編成`));

				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 1, "本線");
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 2);
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 1, "", new YearMonth(1965, 3));
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 2, "", new YearMonth(1965, 4));
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 3, "", new YearMonth(1965, 5));
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 3, "", new YearMonth(1965, 6));
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 1);
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 2);
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 3);
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 4);
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(3), 6, "", new YearMonth(1980, 2));
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(4), 1, "本線");
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(4), 2, "本線");
				AllCars.addCar(new Car(1091, new YearMonth(1960, 1)));
				AllCars.addCar(new Car(1092, new YearMonth(1960, 1)));
				AllCars.addCar(new Car(1093, new YearMonth(1961, 6)));
				reflesh();
			},
			() => {
				resetAllLists();
				reflesh();
			}
		);
	}

	//自動セーブ関係
	if (localStorage.getItem("formation-autosave") != null) {
		Dialog.list.confirmDialog.functions.display(Message.list["MC005"],
			loadAutoSavedData,
			() => {
				localStorage.removeItem("formation-autosave");
				confirmToLoadSaveData();
			});
	} else {
		//画面表示
		confirmToLoadSaveData();
	}

});