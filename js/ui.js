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
		Dialog.list.confirmDialog.functions.display(Message.list["MC001"], continueReadJSON, () => { document.querySelector('#jsonReader').value = ''; tmpJSON = ''; });
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
		let formationList = AllFormations.getBySeriesIdAndYearMonth(seriesId, now);

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
	for (let carId in AllCars.carsList) {
		//編成に組み込まれている車両および未製造の車両および廃車は除外する
		if (proccessedCarIds.includes(Number(carId)) || AllCars.carsList[carId].manufacturedOn.serial > now.serial) {
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

	document.querySelector("#formation-table-container").innerHTML = `${(duplications.length > 0) ? `<div class="warning message">
	<style type="text/css">
	.wn_st1{fill:#ff0000;}
	.wn_st0{fill:#ffebeb;}
	</style>
	<svg version="1.1" id="レイヤー_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
		y="0px" viewBox="0 0 768 680.8" style="enable-background:new 0 0 768 680.8;height: 1em; transform:translateY(1px);" xml:space="preserve">
		<path class="wn_st1" d="M760,592.3L435.1,29.5c-22.7-39.3-79.5-39.3-102.2,0L8,592.3c-22.7,39.3,5.7,88.5,51.1,88.5h649.9
			C754.3,680.8,782.7,631.6,760,592.3z"/>
		<g>
			<g>
				<path class="wn_st0" d="M333,507.8H435V608H333V507.8z M431.8,268.6l-25.4,200.2h-46.2l-24.7-200.2V143.8h96.2L431.8,268.6
					L431.8,268.6z"/>
			</g>
		</g>
	</svg>

	車両番号の重複があります</div>` : ""}${html}`;

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
	if (AllCars.carsList[carId].isDroppedInTime(now)) {
		if (isInFormation) { table.addCell("") }
	} else {
		table.addCell(Formatter.link(carId, AllCars.carsList[carId].numberInTime(now)), { "class": "car" + (AllCars.carsList[carId].isDroppedInTime(now) ? " dropped" : "") });
		carListNow.push(AllCars.carsList[carId].numberInTime(now))
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
	for (let i in AllSerieses.seriesesList) {
		let newDiv = document.createElement("option");
		newDiv.setAttribute("value", i);
		newDiv.innerHTML = AllSerieses.seriesesList[i].name;
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
	updateNowYearMonth(new YearMonth(Number(document.querySelector('#now-y').value), Number(document.querySelector('#now-m').value)));
}
function setInputMaxAndMin() {
	document.querySelector("#now-range").setAttribute("min", minYearMonth.serial);
	document.querySelector("#now-range").setAttribute("max", maxYearMonth.serial);
	document.querySelector("#now-y").setAttribute("min", minYearMonth.year);
	document.querySelector("#now-y").setAttribute("max", maxYearMonth.year);
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

	//自動セーブ関係
	if (localStorage.getItem("formation-autosave") != null) {
		Dialog.list.confirmDialog.functions.display(Message.list["MC005"], loadAutoSavedData, () => { localStorage.removeItem("formation-autosave") });
	} else {
		//画面表示
		reflesh();
	}

});