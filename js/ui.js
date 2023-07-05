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
		Dialog.list.confirmJSONDialog.on();
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
			tables.at(-1).addCell(`${formationList[formationId].name}<button onclick="displayFormationDeteal(${formationId})" class="lsf-icon" icon="search">編成詳細</button>`, { "class": "formation-name" });
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
			//tables.at(-1).addCell(`<button onclick="displayFormationDeteal(${formationId})">編成詳細</button>`);
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
		displayCarDeteal(Number(document.querySelector('#cardt-car-id').innerHTML));
	}
	if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
		displayNotFormatedCars();
	}
}


//以下、ダイアログ関連

//形式一覧ダイアログを表示
function displaySerieses() {
	let seriesList = serieses.seriesesList;
	let table = new Table();
	table.setAttributes({ "class": "horizontal-stripes" });
	for (let seriesId in seriesList) {
		table.addRow();
		table.addCell(`${seriesList[seriesId].name}`, { "class": "formation-name" });
		table.addCell(`<button onclick="">編集</button>`);
		table.addCell(`<button onclick="">編成一覧</button>`);
		table.addCell(`<button onclick="">編成テンプレート一覧</button>`);
	}
	document.querySelector("#seriesDispDialog div.table-container").innerHTML = table.generateTable();
	Dialog.list.seriesDispDialog.on();
}
//編成テンプレート一覧ダイアログを表示
function displayTemplates() {
	let formationTemplateList = formationTemplates.getFormationTemplateList();
	let table = new Table();
	table.setAttributes({ "class": "horizontal-stripes" });
	let maxCellCount = 3;
	for (let formationTemplateId in formationTemplateList) {
		table.addRow();
		table.addCell(`${serieses.seriesesList[formationTemplateList[formationTemplateId].seriesId].name}`, { "class": "formation-name" });
		for (let i in formationTemplateList[formationTemplateId].carNumbers) {
			if (i >= maxCellCount) {
				table.addCell("&nbsp;…&nbsp;", { "class": "separator" });
				break;
			}
			table.addCell(formationTemplateList[formationTemplateId].carNumbers[i](1), { "class": "car" });
		}
	}
	table.addBlankCellToRowRightEnd();
	for (let formationTemplateId in formationTemplateList) {
		table.addCellTo(formationTemplateId, `<button onclick="createFormationFromTemplate(${formationTemplateId})">テンプレートを使用</button>`);
	}
	document.querySelector("#formationTemplatesDialog div.table-container").innerHTML = table.generateTable();
	Dialog.list.formationTemplatesDialog.on();
}
//編成テンプレートから編成を作成ダイアログを表示
function createFormationFromTemplate(x) {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.formationTemplatesDialog.isActive) {
		document.querySelector("#fromt-opening").innerHTML = x;
		createFormationFromTemplateDialogUpdateTable(x, Number(document.querySelector("#fromt-car-number").value));
		Dialog.list.createFormationFromTemplateDialog.on();
	}
}
//編成テンプレートから編成を作成ダイアログのプレビューをリフレッシュ
function createFormationFromTemplateDialogUpdateTable(x, y) {
	let formationTemplate = formationTemplates.getFormationTemplate(x);
	let table = new Table();
	table.setSubtitle("作成される編成のプレビュー");
	table.setAttributes({ "class": "formation-view" });
	table.addRow();
	table.addCell(`編成番号:${formationTemplate.formationName(y)}`, { "colspan": formationTemplate.carNumbers.length });
	table.addRow();
	for (let i in formationTemplate.carNumbers) {
		table.addCell(formationTemplate.carNumbers[i](y));
	}
	document.querySelector("#fromt-template-legend").innerHTML = table.generateTable();
}
//編成テンプレートから編成を作成
function fromtCreate() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.createFormationFromTemplateDialog.isActive) {
		formations.addFormationFromTemplate(cars, formationTemplates.getFormationTemplate(Number(document.querySelector('#fromt-opening').innerHTML)), Number(document.querySelector("#fromt-car-number").value), document.querySelector("#fromt-car-belongs-to").value);
		Dialog.list.createFormationFromTemplateDialog.off();
	}
}

let tentativeFormation = new Formation();
//編成されていない車両から編成作成ダイアログを表示
function displayNotFormatedCars() {
	tentativeFormation = new Formation(0, "", [], "", now);
	let seriesSelectBox = document.querySelector("#forfc-series");
	for (let i in serieses.seriesesList) {
		let newDiv = document.createElement("option");
		newDiv.setAttribute("value", i);
		newDiv.innerHTML = serieses.seriesesList[i].name;
		seriesSelectBox.appendChild(newDiv);
	}
	let table = new Table();
	table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
	table.setSubtitle("編成に所属していない車両一覧");
	let maxCellCount = 10;
	let carIds = listUpNotFormatedCarIds();
	for (let id of carIds) {
		if (table.cellCountOfLastRow % maxCellCount == 0) {
			table.addRow();
		}
		table.addCell(`<a href="javascript:void(0)" onclick="if(tentativeFormation.cars.indexOf(${id})==-1){tentativeFormation.cars.push(${id})}else{tentativeFormation.cars.splice(tentativeFormation.cars.indexOf(${id}),1)}this.parentNode.classList.toggle('selected');refleshNewFormationTable()">${cars.carsList[id].number}</a>`, { "class": "car", "id": `forfc-car-${id}` });
	}
	table.addBlankCellToRowRightEnd();
	document.querySelector("#forfc-not-formated-cars-table").innerHTML = table.generateTable();
	refleshNewFormationTable();
	Dialog.list.createFormationFromFloatingCarsDialog.on();
}
//作成予定の編成プレビューをリフレッシュ
function refleshNewFormationTable() {
	tentativeFormation.setSeries(document.querySelector("#forfc-series").value);
	tentativeFormation.setName(document.querySelector("#forfc-formation-name").value);

	let table = new Table();
	table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
	table.setSubtitle("作成される編成のプレビュー");
	table.addRow();
	table.addCell(`編成番号:${tentativeFormation.name}`, { "colspan": tentativeFormation.cars.length });
	for (let i in tentativeFormation.cars) {
		if (i % 10 == 0) { table.addRow() }
		table.addCell(`<a href="javascript:void(0)" onclick="tentativeFormation.cars.splice(${i},1);document.querySelector('#forfc-car-${tentativeFormation.cars[i]}').classList.toggle('selected');refleshNewFormationTable()">${cars.carsList[tentativeFormation.cars[i]].number}</a>`);
	}
	let missingCellCount = (tentativeFormation.cars.length <= 10) ? 0 : (10 - tentativeFormation.cars.length % 10);
	for (let i = 0; i < missingCellCount; i++) {
		table.addCell("");
	}
	document.querySelector("#forfc-new-formated-cars-table").innerHTML = table.generateTable();
}
//編成に組成されていない車両から編成を作成
function forfcCreate() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
		formations.addFormation(tentativeFormation);
		tentativeFormation = new Formation(0, 0, []);
		Dialog.list.createFormationFromFloatingCarsDialog.off();
	}
}

//編成テンプレートを作成ダイアログを表示
function createFormationTemplate(x) {
	let formationTemplateList = formationTemplates.getFormationTemplateList();
	let html = "";
	for (let formationTemplateId in formationTemplateList) {
		html += `<option value="${formationTemplateId}">${formationTemplateId}</option>`;
	}
	document.querySelector("#createFormationTemplateDialog #formationTemplateId").innerHTML = html;
	Dialog.list.createFormationFromTemplateDialog.on();
}
//車両の詳細ダイアログを表示
function displayCarDeteal(x) {
	let table = new Table();
	table.setSubtitle(`<p class="car-name"><b><span id="cardt-car-number">${cars.carsList[x].numberInTime(now)}</span>号車</b><button class="lsf-icon" icon="pen" onclick="displayCarRenumberDialog()">改番</button><span class="car-status lsf-icon ${cars.carsList[x].isActive ? "" : "dropped"}">${cars.carsList[x].isActive ? "現役" : `${cars.carsList[x].droppedOn.toString()}廃車`}</span></p>`);
	table.setAttributes({ "class": "horizontal-stripes" });
	//所属編成を探す
	let formation = formations.searchByCarId(x, now);
	//車歴
	let oldNumbers = cars.carsList[x].oldNumbers;
	let oldNumbersText = ``;
	for (let i in oldNumbers) {
		oldNumbersText = `<li>${oldNumbers[i].number} <small>(${i != 0 ? oldNumbers[i - 1].renumberedOn.toStringWithLink() : cars.carsList[x].manufacturedOn.toStringWithLink()}～${oldNumbers[i].renumberedOn.toStringWithLink()})</small></li>${oldNumbersText}`;
	}
	oldNumbersText = `<ul><li>${cars.carsList[x].number} <small>(${oldNumbers.length > 0 ? `${oldNumbers.at(-1).renumberedOn.toStringWithLink()}` : `${cars.carsList[x].manufacturedOn.toStringWithLink()}`}～${cars.carsList[x].isDropped ? cars.carsList[x].droppedOn.toStringWithLink() : ""})</small></li>${oldNumbersText}</ul>`;

	table.addRow();
	table.addCell("車両ID");
	table.addCell(x, { "id": "cardt-car-id" });
	table.addRow();
	table.addCell("製造年月");
	table.addCell(cars.carsList[x].manufacturedOn.toStringWithLink());
	if (cars.carsList[x].isDropped) {
		table.addRow();
		table.addCell("廃車年月");
		table.addCell(cars.carsList[x].droppedOn.toStringWithLink());
	}
	table.addRow();
	table.addCell(`所属編成`);
	table.addCell(`${formation != -1 ? formations.formationsList[formation].name : "編成に所属していません"}<small> (${now.toStringWithLink()}時点)</small>`);
	table.addRow();
	table.addCell("車歴");
	table.addCell(oldNumbersText);
	table.addRow();
	table.addCell("備考", { "rowspan": cars.carsList[x].remarks.length });
	for (let i in cars.carsList[x].remarks) {
		if (i != 0) {
			table.addRow();
		}
		table.addCell(cars.carsList[x].remarks[i], { "class": "remark" });
	}
	if (cars.carsList[x].remarks.length == 0) {
		table.addCell("");
	}
	document.querySelector("#cardt-main").innerHTML = table.generateTable();
	Dialog.list.carDetealDialog.on();
}
//車両を改番ダイアログを表示
function displayCarRenumberDialog() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.carDetealDialog.isActive) {
		let carId = Number(document.querySelector('#cardt-car-id').innerHTML);
		if (cars.carsList[carId].isDroppedInTime(now)) {
			alert("この車両は既に廃車されているため改番することはできません。");
			Dialog.list.carDetealDialog.off();
			return;
		}
		document.querySelector("#carrn-main").innerHTML = `<p><input id="carrn-car-number" placeholder="${cars.carsList[carId].number}" value="${cars.carsList[carId].number}">号車</p><div id="carrn-opening">${carId}</div>`
		Dialog.list.carRenumberDialog.on();
	}
}
//車両を改番
function renumberCar() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.carRenumberDialog.isActive) {
		let carId = Number(document.querySelector('#carrn-opening').innerHTML);
		cars.renumberCar(carId, document.querySelector('#carrn-car-number').value);
		Dialog.list.carRenumberDialog.off();
		reflesh();
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
//編成の詳細ダイアログを表示
function displayFormationDeteal(x) {
	let table = new Table();
	table.setAttributes({ "class": "formation-view" });
	let formation = formations.formationsList[x];
	table.setSubtitle(`<p class="car-name"><b><span id="fmdt-formation-number">${formation.name}</span></b> (${formation.formatedOn.toStringWithLink()}～${formation.isTerminated ? `${formation.terminatedOn.toStringWithLink()}` : ``})<button class="lsf-icon" icon="pen" onclick="displayFormationRenameDialog()">名称変更</button></p><div id="fmdt-opening">${x}</div>`);
	table.addRow();
	table.addCell(`編成ID:${x}`, { "colspan": formation.cars.length, "class": "formation-id" });
	table.addRow();
	for (let i in formation.cars) {
		table.addCell(Formatter.link(formation.cars[i], cars.carsList[formation.cars[i]].number));
	}
	let html = table.generateTable();
	document.querySelector("#fmdt-main").innerHTML = html;
	Dialog.list.formationDetealDialog.on();
}
//編成を改名ダイアログを表示
function displayFormationRenameDialog() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.formationDetealDialog.isActive) {
		let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
		document.querySelector("#fmrn-main").innerHTML = `<p><input id="fmrn-formation-name" placeholder="${formations.formationsList[formationId].name}" value="${formations.formationsList[formationId].name}"></p><div id="fmrn-opening">${formationId}</div>`
		Dialog.list.formationRenameDialog.on();
	}
}
//編成を改名
function renameFormation() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.formationRenameDialog.isActive) {
		let formationId = Number(document.querySelector('#fmrn-opening').innerHTML);
		let formation = formations.formationsList[formationId];
		let isTerminated = formation.isTerminated;
		let terminatedOn = formation.terminatedOn;
		formations.releaseFormation(formationId);
		let newFormationId = formations.addFormation(new Formation(formation.seriesId, document.querySelector('#fmrn-formation-name').value, formation.cars, formation.belongsTo, now))
		//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
		if (isTerminated) {
			formations.releaseFormation(newFormationId, terminatedOn);
		}
		Dialog.list.formationRenameDialog.off();
		reflesh();
	}
}
//編成を解除
function releaseFormation() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.formationDetealDialog.isActive) {
		let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
		if (formations.formationsList[formationId].isTerminated) {
			alert("この編成は未来で解除されているため編成解除できません。");
			Dialog.list.formationDetealDialog.off();
			return;
		}
		if (window.confirm(`${formations.formationsList[formationId].name}を${now.toString()}付で編成解除します。`)) {
			formations.releaseFormation(formationId);
			reflesh();
			Dialog.list.formationDetealDialog.off();
		}
	}
}
//編成内の車両を全て廃車
function releaseFormationAndDropAllCars() {
	//親ダイアログが表示されている状態以外での実行を禁止
	if (Dialog.list.formationDetealDialog.isActive) {
		let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
		if (formations.formationsList[formationId].isTerminated) {
			alert("この編成は未来で解除されているため操作できません。");
			Dialog.list.formationDetealDialog.off();
			return;
		}
		if (window.confirm(`${formations.formationsList[formationId].name}内の車両${formations.formationsList[formationId].cars.length}両を${now.toString()}付で全て廃車します。`)) {
			for (let i in formations.formationsList[formationId].cars) {
				//車両が未来で廃車されている場合スキップ
				if (cars.carsList[formations.formationsList[formationId].cars[i]].isDropped) {
					continue;
				}
				cars.dropCar(formations.formationsList[formationId].cars[i], now);
			}
			//編成解除
			formations.releaseFormation(formationId);
			reflesh();
			Dialog.list.formationDetealDialog.off();
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