//JSONを保存ウインドウ表示
function showJSONOutputDialog() {
	saveFile("formation.json", generateJSON())
}

//JSON読み込み
function showJSONLoadDialog() {
	document.querySelector("#jsonReader").click();
}
let tmpJSON = "";
function readJson(evt) {
	let file = evt.target.files;
	let reader = new FileReader();
	reader.readAsText(file[0]);
	reader.onload = function (e) {
		tmpJSON = e.target.result;
		Dialog.list.confirmJSONDialog.functions.display();
	}
}
function continueReadJSON() {
	loadListsFromJSON(tmpJSON);
	tmpJSON = "";
	Dialog.list.confirmJSONDialog.off();
}

//現存編成の編成表を表に出力
function list() {
	//ソート
	let seriesList = serieses.seriesesList;
	let carListNow = [];
	let tables = [];
	let html = "";

	//編成に組み込まれている車両
	let proccessedCarIds = [];


	//形式ごとに処理
	for (let seriesId in seriesList) {
		//テーブルを生成
		tables.push(new Table(seriesList[seriesId].name));
		tables.at(-1).setSubtitle(seriesList[seriesId].description);
		tables.at(-1).setAttributes({ "class": "formation-table horizontal-stripes" });
		//現時点で組成されている編成を取得
		let formationList = formations.getBySeriesIdAndYearMonth(seriesId, now);

		//ソート
		let keys = Object.keys(formationList).sort((f1, f2) => {
			if (formationList[f1].name < formationList[f2].name) {
				return -1
			} else if (formationList[f1].name > formationList[f2].name) {
				return 1
			} else {
				return 0
			}
		});


		//編成ごとに処理
		for (let formationId of keys) {
			//行を追加
			tables.at(-1).addRow();
			//編成番号セルを追加
			tables.at(-1).addCell(`${formationList[formationId].name}<button onclick="Dialog.list.formationDetealDialog.functions.display(${formationId})" class="lsf-icon" icon="search">編成詳細</button>`, { "class": "formation-name" });
			//車両ごとに処理
			let carsOnFormation = formationList[formationId].cars;
			for (let i in carsOnFormation) {
				addCarCell(tables.at(-1), carsOnFormation[i], carListNow, true);
				proccessedCarIds.push(carsOnFormation[i]);
			}
			//所属地セルを追加
			//tables.at(-1).addCell(formationList[formationId].belongsTo==null?"運用離脱":formationList[formationId].belongsTo,{"class":"belongs"});
			//組成年月セルを追加
			tables.at(-1).addCell(formationList[formationId].formatedOn.toStringWithLink());
			//コントロールセルを追加
			//tables.at(-1).addCell(`<button onclick="Dialog.list.formationDetealDialog.functions.display(${formationId})">編成詳細</button>`);
		}
		tables.at(-1).addBlankCellToRowIn(1);
		html += tables.at(-1).generateTable();
	}

	//編成に組み込まれていない車両を処理
	tables.push(new Table("編成に所属していない車両"));
	tables.at(-1).setAttributes({ "class": "not-formated-car-table vertical-stripes" });
	for (let carId in cars.carsList) {
		//編成に組み込まれている車両および未製造の車両および廃車は除外する
		if (proccessedCarIds.includes(Number(carId)) || cars.carsList[carId].manufacturedOn.serial > now.serial) {
			continue;
		} else {
			if (tables.at(-1).cellCountOfLastRow % 10 == 0) {
				tables.at(-1).addRow();
			}
			addCarCell(tables.at(-1), carId, carListNow, false);
		}
	}
	//tables.at(-1).addBlankCellToRowRightEnd();
	html += tables.at(-1).generateTable();

	//車両番号の重複をチェック
	let duplications = carListNow.filter(function (x, i, self) {
		return self.indexOf(x) === i && i !== self.lastIndexOf(x);
	});

	document.querySelector("#formation-table-container").innerHTML = `${(duplications.length > 0) ? `<div class="warning message">車両番号の重複があります</div>` : ""}${html}`;

	//重複ハイライト
	if (duplications.length > 0) {
		let tds = document.querySelectorAll("#formation-table-container td.car");
		for (let td of tds) {
			for (let j in duplications) {
				if (td.innerHTML.match(new RegExp(duplications[j], "g")) != null) {
					td.classList.add("duplicated");
				}
			}
		}
	}
}

//車両セルの追加
//Table, 車両ID, 処理中の車両リスト, 今編成内の車両を処理しているか
function addCarCell(table, carId, carListNow, isInFormation) {
	if (cars.carsList[carId].isDroppedInTime(now)) {
		if (isInFormation) { table.addCell("") }
	} else {
		table.addCell(Formatter.link(carId, cars.carsList[carId].numberInTime(now)), { "class": "car" + (cars.carsList[carId].isDroppedInTime(now) ? " dropped" : "") });
		carListNow.push(cars.carsList[carId].numberInTime(now))
	}
}

//編成に所属していない車両のリストアップ
function listUpNotFormatedCarIds() {
	let carIdsList = [];
	let enrolledFormations = formations.getFormationsByYearMonth(now);
	for (let i in enrolledFormations) {
		for (let j in enrolledFormations[i].cars) {
			carIdsList.push(enrolledFormations[i].cars[j]);
		}
	}
	return cars.activeCarIdsListInTime(now).filter((x) => {
		return carIdsList.indexOf(x) == -1 && cars.carsList[x].isActiveInTime(now);
	});
}

//表示を最新の状態にリフレッシュ
function reflesh() {
	//リストを表示
	list();

	//年月を反映
	document.querySelector("#now-range").value = now.serial;
	document.querySelector("#now-y").value = now.year;
	document.querySelector("#now-m").value = now.month;

	//ダイアログ内の表示を更新
	if (Dialog.list.carDetealDialog.isActive) {
		Dialog.list.carDetealDialog.functions.display(Number(document.querySelector('#cardt-car-id').innerHTML));
	}
	if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
		Dialog.list.createFormationFromFloatingCarsDialog.functions.display();
	}
}


//以下、ダイアログ関連

//セレクトボックスに形式名を投入
function setSeriesesToSelectBox(seriesSelectBox) {
	seriesSelectBox.innerHTML = "";
	for (let i in serieses.seriesesList) {
		let newDiv = document.createElement("option");
		newDiv.setAttribute("value", i);
		newDiv.innerHTML = serieses.seriesesList[i].name;
		seriesSelectBox.appendChild(newDiv);
	}
}

//車両を廃車
function dropCar(carId_) {
	//引数がない場合、ダイアログからの処理
	if (carId_ == undefined) {
		//親ダイアログが表示されている状態以外での実行を禁止
		if (Dialog.list.carDetealDialog.isActive) {
			let carId = Number(document.querySelector('#cardt-car-id').innerHTML);
			if (cars.carsList[carId].isDropped) {
				alert("この車両は既に廃車されています。");
				Dialog.list.carDetealDialog.off();
				return;
			}
			if (window.confirm(`${cars.carsList[carId].numberInTime(now)}号車を${now.toString()}付で廃車します。`)) {
				//廃車
				dropCar(carId);
				//廃車車両を除いた車両で編成
				reflesh();
				Dialog.list.carDetealDialog.off();
			}
		}
		//引数がある場合、廃車処理
	} else {
		//廃車
		cars.dropCar(carId_, now);
		let formationId = formations.searchByCarId(carId_, now);
		//編成に所属していた場合、編成を解除
		if (formationId != -1) {
			let cars = formations.formationsList[formationId].cars;
			let seriesId = formations.formationsList[formationId].seriesId;
			let name = formations.formationsList[formationId].name;
			let belongsTo = formations.formationsList[formationId].belongsTo;
			let isTerminated = formations.formationsList[formationId].isTerminated;
			let terminatedOn = formations.formationsList[formationId].terminatedOn;
			//編成解除
			formations.releaseFormation(formationId, now);
			//廃車した車両を除いて編成再組成
			let newFormationCars = [];
			for (let i in cars) {
				if (cars[i] != carId_) {
					newFormationCars.push(cars[i]);
				}
			}
			let newFormationId = formations.addFormation(new Formation(seriesId, name, newFormationCars, belongsTo, now));
			//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
			if (isTerminated) {
				formations.releaseFormation(newFormationId, terminatedOn);
			}
			//廃車した車両が未来に組成されている編成のメンバとして在籍している場合、除外する
			for (let i in formations.formationsList) {
				if (formations.formationsList[i].formatedOn.serial >= now.serial) {
					formations.formationsList[i].removeCarByCarId(carId_);
				}
			}
		}
	}
}
//ダイアログ関連ここまで

//現在年月の操作
function updateNowYearMonth(ym) {
	now = ym;
	reflesh();
}
function updateNowYearMonthByInputBoxes() {
	updateNowYearMonth(new YearMonth(Number(document.querySelector('#now-y').value), Number(document.querySelector('#now-m').value)));
}
function setInputMaxAndMin() {
	document.querySelector("#now-range").setAttribute("min", minYearMonth.serial);
	document.querySelector("#now-range").setAttribute("max", maxYearMonth.serial);
	document.querySelector("#now-y").setAttribute("min", minYearMonth.year);
	document.querySelector("#now-y").setAttribute("max", maxYearMonth.year);
	now = maxYearMonth;
}

//年月関連のグローバル変数の定義
let now;
let minYearMonth;
let maxYearMonth;

//実際データ領域定義
let serieses = new AllSerieses();
let cars = new AllCars();
let formations = new AllFormations();
let formationTemplates = new AllFormationTemplates();

window.addEventListener("load", setInputMaxAndMin);
window.addEventListener("load", reflesh);