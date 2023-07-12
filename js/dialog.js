class Dialog {
	static area = document.createElement("div");
	static areaOverlay = document.createElement("div");
	static list = {};

	id;
	dialogTitle;
	dialog;
	mainMessage;
	buttons;
	functions = {};
	isOverlay = false;

	//new Dialog("ID","タイトル","本文",[{"event":"ボタン1のイベント","content":"ボタン1の本文"},{"event":"ボタン2のイベント","content":"ボタン2の本文"},...],{関数,関数,...},重ねがけするかどうか);
	constructor(id, dialogTitle, message, buttons, functions, isOverlay) {
		this.dialog = document.createElement("div");
		if (dialogTitle != "") {
			this.dialogTitle = document.createElement("p");
			this.dialogTitle.classList.add("dialog-title");
			this.dialogTitle.innerHTML = dialogTitle;
			this.dialog.appendChild(this.dialogTitle);
		}
		this.mainMessage = document.createElement("div");
		this.buttons = document.createElement("p");
		this.buttons.classList.add("dialog-foot-buttons-container");
		this.setContents(message, buttons);
		this.dialog.appendChild(this.mainMessage);
		this.dialog.appendChild(this.buttons);
		this.dialog.setAttribute("id", id);
		this.dialog.setAttribute("class", "dialog-content off");

		this.functions = functions || this.functions;
		if (this.functions.display == undefined) {
			this.functions.display = () => {
				this.on();
			}
		}

		this.isOverlay = isOverlay || this.isOverlay;

		if (this.isOverlay) {
			Dialog.areaOverlay.appendChild(this.dialog);
		} else {
			Dialog.area.appendChild(this.dialog);
		}
		Dialog.list[id] = this;
	}
	setContents(message, buttons) {
		this.setMessage(message);
		this.setButtons(buttons);
	}
	setMessage(message) {
		this.mainMessage.innerHTML = message;
	}
	setButtons(buttons) {
		let buttonContent = "";
		for (let i in buttons) {
			if (buttons[i]["icon"] == undefined || buttons[i]["icon"] == null) {
				buttons[i]["icon"] = "";
			}
			let attributes = "";
			let classes = "";
			for (let j in buttons[i]) {
				if (j == "content" || j == "event") {
					continue;
				} else if (j == "icon") {
					attributes += ` icon="${buttons[i]["icon"]}"`;
					classes += ` lsf-icon`;
				} else if (j == "class") {
					classes += ` ${buttons[i][j]}`;
				} else {
					attributes += ` ${j}=${buttons[i][j]}`;
				}
			}
			buttonContent += `<button onclick="${buttons[i]["event"]}" class="${classes}"${attributes}>${buttons[i]["content"]}</button>`;
		}
		this.buttons.innerHTML = buttonContent;
	}
	on() {
		if (!this.isOverlay) {
			Dialog.offAll();
			Dialog.displayDialogArea();
		} else {
			Dialog.displayDialogAreaOverlay();
		}
		Dialog.open(this.dialog);
	}
	off() {
		reflesh();
		if (!this.isOverlay) {
			Dialog.closeDialogArea();
		} else {
			Dialog.closeDialogAreaOverlay();
		}
		Dialog.close(this.dialog);
	}
	get isActive() {
		return this.dialog.classList.contains("on");
	}
	static offAll() {
		Dialog.closeDialogArea();
		for (let i of document.querySelectorAll(".dialog-content")) {
			Dialog.close(i);
		}
	}
	static displayDialogArea() {
		Dialog.open(Dialog.area);
	}
	static displayDialogAreaOverlay() {
		Dialog.open(Dialog.areaOverlay);
	}
	static closeDialogArea() {
		Dialog.close(Dialog.area);
	}
	static closeDialogAreaOverlay() {
		Dialog.close(Dialog.areaOverlay);
	}
	static open(div) {
		div.classList.remove("off");
		div.classList.add("on");
	}
	static close(div) {
		div.classList.remove("on");
		div.classList.add("off");
	}
}

window.addEventListener("load", function () {
	Dialog.area.id = "dialog-area";
	Dialog.area.classList.add("dialog-area");
	document.body.appendChild(Dialog.area);
	Dialog.areaOverlay.id = "dialog-area-overlay";
	Dialog.areaOverlay.classList.add("dialog-area");
	document.body.appendChild(Dialog.areaOverlay);

	//以下、ダイアログ定義

	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式作成", "event": `Dialog.list.createSeriesDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }], {
		//形式一覧ダイアログを表示
		display: function () {
			let seriesList = AllSerieses.seriesesList;
			let table = new Table();
			table.setAttributes({ "class": "horizontal-stripes" });
			for (let seriesId in seriesList) {
				table.addRow();
				table.addCell(`${seriesList[seriesId].name}`, { "class": "formation-name" });
				table.addCell(`${seriesList[seriesId].description}`, { "class": "formation-template-name" });
				table.addCell(`<button onclick="">編集</button>`);
				table.addCell(`<button onclick="">編成一覧</button>`);
				table.addCell(`<button onclick="">編成テンプレート一覧</button>`);
			}
			document.querySelector("#seriesDispDialog div.table-container").innerHTML = table.generateTable();
			Dialog.list.seriesDispDialog.on();
		}
	});

	//編成テンプレート一覧:fort
	new Dialog("formationTemplatesDialog", "編成テンプレート一覧", `<div class="table-container"></div>`, [{ "content": "テンプレート作成", "event": `Dialog.list.createFormationTemplateDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.formationTemplatesDialog.off();`, "icon": "close" }], {
		//編成テンプレート一覧ダイアログを表示
		display: function () {
			let formationTemplateList = AllFormationTemplates.getFormationTemplateList();
			let table = new Table();
			table.setAttributes({ "class": "horizontal-stripes" });
			let maxCellCount = 3;
			for (let formationTemplateId in formationTemplateList) {
				table.addRow();
				table.addCell(`${AllSerieses.seriesesList[formationTemplateList[formationTemplateId].seriesId].name}`, { "class": "formation-name" });
				table.addCell(`${formationTemplateList[formationTemplateId].name}`, { "class": "formation-template-name" });
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
				table.addCellTo(formationTemplateId, `<button onclick="Dialog.list.createFormationFromTemplateDialog.functions.display(${formationTemplateId})">テンプレートを使用</button>`);
			}
			document.querySelector("#formationTemplatesDialog div.table-container").innerHTML = table.generateTable();
			Dialog.list.formationTemplatesDialog.on();
		}
	});

	//編成を作成:fora
	new Dialog("formationAddingDialog", "編成を作成", ``, [{ "content": "編成テンプレートから作成", "event": `Dialog.list.formationTemplatesDialog.functions.display()`, "icon": "add" }, { "content": "編成に所属していない車両から作成", "event": `Dialog.list.createFormationFromFloatingCarsDialog.functions.display()`, "icon": "add" }, { "content": "キャンセル", "event": `Dialog.list.formationAddingDialog.off();`, "icon": "close" }]);

	//編成テンプレートから編成作成:fromt
	new Dialog("createFormationFromTemplateDialog", "編成テンプレートから編成作成", `<table class="input-area">
	<tr>
		<td>番号</td>
		<td><input id="fromt-car-number" type="number" value="1" onchange="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))" onkeyup="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))"></td>
	</tr>
	<tr>
		<td><span>所属</span></td>
		<td><input id="fromt-car-belongs-to"></td>
	</tr>
	</table>
		<div id="fromt-opening">
		</div>
		<div id="fromt-template-legend" class="element-bottom-of-input-area"></div>
		<p>
			<button onclick="Dialog.list.formationTemplatesDialog.functions.display()">他のテンプレートを使う</button>
		</p>
	`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromTemplateDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromTemplateDialog.off();`, "icon": "close" }], {
		//編成テンプレートから編成を作成ダイアログを表示
		display: function (x) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationTemplatesDialog.isActive) {
				document.querySelector("#fromt-opening").innerHTML = x;
				Dialog.list.createFormationFromTemplateDialog.functions.reflesh(x, Number(document.querySelector("#fromt-car-number").value));
				Dialog.list.createFormationFromTemplateDialog.on();
			}
		},
		//編成テンプレートから編成を作成ダイアログのプレビューをリフレッシュ
		reflesh: function (x, y) {
			let formationTemplate = AllFormationTemplates.getFormationTemplate(x);
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
		},
		//編成テンプレートから編成を作成
		createFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationFromTemplateDialog.isActive) {
				AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(Number(document.querySelector('#fromt-opening').innerHTML)), Number(document.querySelector("#fromt-car-number").value), document.querySelector("#fromt-car-belongs-to").value);
				Dialog.list.createFormationFromTemplateDialog.off();
			}
		}
	});

	//編成に所属していない車両から編成作成:forfc
	new Dialog("createFormationFromFloatingCarsDialog", "編成に所属していない車両から編成作成", `
	<p>※車両が選択された状態で現在年月を操作すると選択がリセットされます</p>
	<table class="input-area">
	<tr>
		<td>
			<span>形式</span>
		</td>
		<td>
			<select id="forfc-series" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()"></select>
		</td>
	</tr>
	<tr>
		<td>
			<span>編成番号</span>
		</td>
		<td>
			<input id="forfc-formation-name" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()">
		</td>
	</tr>
	<tr>
		<td>
			<span>所属</span>
		</td>
		<td>
			<input id="forfc-car-belongs-to">
		</td>
	</tr>
	</table>
	<div id="forfc-not-formated-cars-table" class="element-bottom-of-input-area"></div>
	<div id="forfc-new-formated-cars-table"></div>
	<div id="forfc-new-formation"></div>
	<div id="forfc-formation-opening"></div>
	<div id="forfc-template-legend"></div>
		`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromFloatingCarsDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromFloatingCarsDialog.off();`, "icon": "close" }], {
		tentativeFormation: new Formation(),
		//編成されていない車両から編成作成ダイアログを表示
		display: function () {
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation = new Formation(0, "", [], "", now);
			setSeriesesToSelectBox(document.querySelector("#forfc-series"));
			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
			table.setSubtitle("編成に所属していない車両一覧");
			let maxCellCount = 10;
			let carIds = listUpNotFormatedCarIds();
			for (let id of carIds) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<a href="javascript:void(0)" onclick="if(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id})==-1){Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.push(${id})}else{Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id}),1)}this.parentNode.classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()">${AllCars.carsList[id].number}</a>`, { "class": "car", "id": `forfc-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.querySelector("#forfc-not-formated-cars-table").innerHTML = table.generateTable();
			Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh();
			Dialog.list.createFormationFromFloatingCarsDialog.on();
		},
		//作成予定の編成プレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setSeries(document.querySelector("#forfc-series").value);
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setName(document.querySelector("#forfc-formation-name").value);

			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
			table.setSubtitle("作成される編成のプレビュー");
			table.addRow();
			table.addCell(`編成番号:${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.name}`, { "colspan": Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length });
			for (let i in Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars) {
				if (i % 10 == 0) { table.addRow() }
				table.addCell(`<a href="javascript:void(0)" onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(${i},1);document.querySelector('#forfc-car-${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]}').classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()">${AllCars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]].number}</a>`);
			}
			let missingCellCount = (Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length <= 10) ? 0 : (10 - Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length % 10);
			for (let i = 0; i < missingCellCount; i++) {
				table.addCell("");
			}
			document.querySelector("#forfc-new-formated-cars-table").innerHTML = table.generateTable();
		},
		//編成に組成されていない車両から編成を作成
		createFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
				if (Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length == 0) {
					Dialog.list.alertDialog.functions.display("編成には最低1両の車両を組成してください。");
				} else {
					AllFormations.addFormation(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation = new Formation(0, 0, []);
					Dialog.list.createFormationFromFloatingCarsDialog.off();
				}
			}
		}
	});

	//編成テンプレートを作成:cref
	new Dialog("createFormationTemplateDialog", "編成テンプレートを作成", `<table class="input-area"><tr><td>形式</td><td><select id="cref-series" onchange="Dialog.list.createFormationTemplateDialog.functions.reflesh()"></select></td></tr><tr><td>テンプレートの説明</td><td><input id="cref-name" oninput="Dialog.list.createFormationTemplateDialog.functions.reflesh();"></td></tr><tr><td>車両番号の一般式</td><td><input id="cref-carnumber" onkeyup="if(event.keyCode==13){document.getElementById('cref-add-number-button').click()}"><button id="cref-add-number-button" onclick="Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumber(document.getElementById('cref-carnumber').value);Dialog.list.createFormationTemplateDialog.functions.reflesh();document.getElementById('cref-carnumber').value='';document.getElementById('cref-carnumber').focus()" class="lsf-icon" icon="add">追加</button></td></tr></table><div id="cref-new-formated-template-table" class="element-bottom-of-input-area"></div>`, [{ "content": "編成テンプレート作成", "event": `Dialog.list.createFormationTemplateDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "クリア", "event": `Dialog.list.createFormationTemplateDialog.functions.clearInputs();Dialog.list.createFormationTemplateDialog.functions.reflesh();`, "icon": "clear" }, { "content": "キャンセル", "event": `Dialog.list.createFormationTemplateDialog.off();`, "icon": "close" }], {
		tentativeFormationTemplate: new FormationTemplate(),
		//編成テンプレートを作成ダイアログを表示
		display: function () {
			Dialog.list.createFormationTemplateDialog.functions.clearInputs();
			//セレクトボックスに形式名を投入
			setSeriesesToSelectBox(document.querySelector("#cref-series"));
			Dialog.list.createFormationTemplateDialog.functions.reflesh();
			Dialog.list.createFormationTemplateDialog.on();
		},
		//作成予定の編成テンプレートプレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId = Number(document.querySelector("#cref-series").value);
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name = document.querySelector("#cref-name").value;

			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
			table.setSubtitle("作成される編成テンプレートから作成できる編成のトップナンバーのプレビュー");
			if (Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length != 0) {
				table.addRow();
				table.addCell(`編成番号:${Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.formationName(1)}`, { "colspan": Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length });
				for (let i in Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers) {
					if (i % 10 == 0) { table.addRow() }
					table.addCell(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers[i](1));
				}
				let missingCellCount = (Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length <= 10) ? 0 : (10 - Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length % 10);
				for (let i = 0; i < missingCellCount; i++) {
					table.addCell("");
				}
			}
			document.querySelector("#cref-new-formated-template-table").innerHTML = table.generateTable();
		},
		createFormationTemplate: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationTemplateDialog.isActive) {
				if (Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length < 1) {
					Dialog.list.alertDialog.functions.display("最低1つは車両番号の一般式が必要です。");
				} else {
					AllFormationTemplates.addFormationTemplate(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate);
					Dialog.list.createFormationTemplateDialog.functions.clearInputs();
					Dialog.list.createFormationTemplateDialog.off();
					Dialog.list.formationTemplatesDialog.functions.display();
				}
			}
		},
		clearInputs: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate = new FormationTemplate();
			document.querySelector("#cref-name").value = "";
			document.querySelector("#cref-carnumber").value = "";
		}
	});

	//形式を作成:crsr
	new Dialog("createSeriesDialog", "形式を作成", `<table class="input-area"><tr><td>形式名</td><td><input id="crsr-series-name"></td></tr><tr><td>説明</td><td><input id="crsr-series-description"></td></tr></table>`, [{ "content": "形式作成", "event": `Dialog.list.createSeriesDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createSeriesDialog.off();`, "icon": "close" }], {
		tentativeFormationTemplate: new FormationTemplate(),
		display: function () {
			Dialog.list.createSeriesDialog.functions.clearInputs();
			Dialog.list.createSeriesDialog.on();
		},
		createFormationTemplate: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createSeriesDialog.isActive) {
				let seriesName = document.getElementById("crsr-series-name").value;
				let seriesDescription = document.getElementById("crsr-series-description").value;
				if (seriesName == "") {
					Dialog.list.alertDialog.functions.display("形式名は必須です。");
				} else {
					AllSerieses.addSeries(new Series(seriesName, "", seriesDescription == "" ? "　" : seriesDescription));
					Dialog.list.createSeriesDialog.off();
					Dialog.list.createSeriesDialog.functions.clearInputs();
				}
			}
		},
		clearInputs: function () {
			document.getElementById("crsr-series-name").value = "";
			document.getElementById("crsr-series-description").value = "";
		}
	});

	new Dialog("confirmJSONDialog", "確認", `JSON読み込みを実施すると現在のデータはクリアされます。本当に読み込んでよろしいですか？`, [{ "content": "はい", "event": `continueReadJSON()`, "icon": "check" }, { "content": "キャンセル", "event": `document.querySelector('#jsonReader').value='';tmpJSON='';Dialog.list.confirmJSONDialog.off();`, "icon": "close" }]);

	//車両の詳細:cardt
	new Dialog("carDetealDialog", "車両の詳細", `<div id="cardt-main"></div>`, [{ "content": "廃車", "event": `dropCar()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.carDetealDialog.off();`, "icon": "close" }], {
		//車両の詳細ダイアログを表示
		display: function (x) {
			let table = new Table();
			table.setSubtitle(`<p class="car-name"><b><span id="cardt-car-number">${AllCars.carsList[x].numberInTime(now)}</span>号車</b><button class="lsf-icon" icon="pen" onclick="Dialog.list.carRenumberDialog.functions.display()">改番</button><span class="car-status lsf-icon ${AllCars.carsList[x].isActive ? "" : "dropped"}">${AllCars.carsList[x].isActive ? "現役" : `${AllCars.carsList[x].droppedOn.toString()}廃車`}</span></p>`);
			table.setAttributes({ "class": "horizontal-stripes" });
			//所属編成を探す
			let formation = AllFormations.searchByCarId(x, now);
			//車歴
			let oldNumbers = AllCars.carsList[x].oldNumbers;
			let oldNumbersText = ``;
			for (let i in oldNumbers) {
				oldNumbersText += `<li>${oldNumbers[i].number} <small>(${i != 0 ? oldNumbers[i - 1].renumberedOn.toStringWithLink() : AllCars.carsList[x].manufacturedOn.toStringWithLink()}～${oldNumbers[i].renumberedOn.toStringWithLink()})</small></li>`;
			}
			oldNumbersText = `<ul>${oldNumbersText}<li>${AllCars.carsList[x].number} <small>(${oldNumbers.length > 0 ? `${oldNumbers.at(-1).renumberedOn.toStringWithLink()}` : `${AllCars.carsList[x].manufacturedOn.toStringWithLink()}`}～${AllCars.carsList[x].isDropped ? AllCars.carsList[x].droppedOn.toStringWithLink() : ""})</small></li></ul>`;

			table.addRow();
			table.addCell("車両ID");
			table.addCell(x, { "id": "cardt-car-id" });
			table.addRow();
			table.addCell("製造年月");
			table.addCell(AllCars.carsList[x].manufacturedOn.toStringWithLink());
			if (AllCars.carsList[x].isDropped) {
				table.addRow();
				table.addCell("廃車年月");
				table.addCell(AllCars.carsList[x].droppedOn.toStringWithLink());
			}
			table.addRow();
			table.addCell(`所属編成`);
			table.addCell(`${formation != -1 ? AllFormations.formationsList[formation].name : "編成に所属していません"}<small> (${now.toStringWithLink()}時点)</small>`);
			table.addRow();
			table.addCell("車歴");
			table.addCell(oldNumbersText);
			table.addRow();
			table.addCell("備考", { "rowspan": AllCars.carsList[x].remarks.length });
			for (let i in AllCars.carsList[x].remarks) {
				if (i != 0) {
					table.addRow();
				}
				table.addCell(AllCars.carsList[x].remarks[i], { "class": "remark" });
			}
			if (AllCars.carsList[x].remarks.length == 0) {
				table.addCell("");
			}
			document.querySelector("#cardt-main").innerHTML = table.generateTable();
			Dialog.list.carDetealDialog.on();
		},

	});

	//車両の改番:carrn
	new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `Dialog.list.carRenumberDialog.functions.renumberCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.carRenumberDialog.off();`, "icon": "close" }], {
		//車両を改番ダイアログを表示
		display: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carDetealDialog.isActive) {
				let carId = Number(document.querySelector('#cardt-car-id').innerHTML);
				if (AllCars.carsList[carId].isDroppedInTime(now)) {
					Dialog.list.alertDialog.functions.display("この車両は既に廃車されているため改番することはできません。");
					return;
				}
				document.querySelector("#carrn-main").innerHTML = `<p><input id="carrn-car-number" placeholder="${AllCars.carsList[carId].number}" value="${AllCars.carsList[carId].number}">号車</p><div id="carrn-opening">${carId}</div>`
				Dialog.list.carRenumberDialog.on();
			}
		},
		//車両を改番
		renumberCar: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carRenumberDialog.isActive) {
				let carId = Number(document.querySelector('#carrn-opening').innerHTML);
				AllCars.renumberCar(carId, document.querySelector('#carrn-car-number').value);
				Dialog.list.carRenumberDialog.off();
				reflesh();
			}
		}
	});

	//編成の詳細:fmdt
	new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div>`, [{ "content": "編成解除", "event": `Dialog.list.formationDetealDialog.functions.releaseFormation()`, "icon": "clear" }, { "content": "編成内の車両をまとめて廃車", "event": `Dialog.list.formationDetealDialog.functions.releaseFormationAndDropAllCars()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.formationDetealDialog.off();`, "icon": "close" }], {
		//編成の詳細ダイアログを表示
		display: function (x) {
			let table = new Table();
			table.setAttributes({ "class": "formation-view" });
			let formation = AllFormations.formationsList[x];
			table.setSubtitle(`<p class="car-name"><b><span id="fmdt-formation-number">${formation.name}</span></b> (${formation.formatedOn.toStringWithLink()}～${formation.isTerminated ? `${formation.terminatedOn.toStringWithLink()}` : ``})<button class="lsf-icon" icon="pen" onclick="Dialog.list.formationRenameDialog.functions.display()">名称変更</button></p><div id="fmdt-opening">${x}</div>`);
			table.addRow();
			table.addCell(`編成ID:${x}`, { "colspan": formation.cars.length, "class": "formation-id" });
			table.addRow();
			for (let i in formation.cars) {
				table.addCell(Formatter.link(formation.cars[i], AllCars.carsList[formation.cars[i]].number));
			}
			let html = table.generateTable();
			document.querySelector("#fmdt-main").innerHTML = html;
			Dialog.list.formationDetealDialog.on();
		},
		//編成を解除
		releaseFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				if (AllFormations.formationsList[formationId].isTerminated) {
					Dialog.list.alertDialog.functions.display("この編成は未来で解除されているため編成解除できません。");
					return;
				}
				Dialog.list.confirmDialog.functions.display(`${AllFormations.formationsList[formationId].name}を${now.toString()}付で編成解除します。`, function () {
					AllFormations.releaseFormation(formationId);
					reflesh();
					Dialog.list.formationDetealDialog.off();
				});
			}
		},
		//編成内の車両を全て廃車
		releaseFormationAndDropAllCars: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				if (AllFormations.formationsList[formationId].isTerminated) {
					Dialog.list.alertDialog.functions.display("この編成は未来で解除されているため操作できません。");
					return;
				}
				Dialog.list.confirmDialog.functions.display(`${AllFormations.formationsList[formationId].name}内の車両${AllFormations.formationsList[formationId].cars.length}両を${now.toString()}付で全て廃車します。`, function () {
					for (let i in AllFormations.formationsList[formationId].cars) {
						//車両が未来で廃車されている場合スキップ
						if (AllCars.carsList[AllFormations.formationsList[formationId].cars[i]].isDropped) {
							continue;
						}
						AllCars.dropCar(AllFormations.formationsList[formationId].cars[i], now);
					}
					//編成解除
					AllFormations.releaseFormation(formationId);
					reflesh();
					Dialog.list.formationDetealDialog.off();
				});
			}
		}
	});

	//編成の改名:fmrn
	new Dialog("formationRenameDialog", "編成の改名", `<div id="fmrn-main"></div>`, [{ "content": "改名", "event": `Dialog.list.formationRenameDialog.functions.renameFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationRenameDialog.off();`, "icon": "close" }], {
		//編成を改名ダイアログを表示
		display: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				document.querySelector("#fmrn-main").innerHTML = `<p><input id="fmrn-formation-name" placeholder="${AllFormations.formationsList[formationId].name}" value="${AllFormations.formationsList[formationId].name}"></p><div id="fmrn-opening">${formationId}</div>`
				Dialog.list.formationRenameDialog.on();
			}
		},
		//編成を改名
		renameFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationRenameDialog.isActive) {
				let formationId = Number(document.querySelector('#fmrn-opening').innerHTML);
				let formation = AllFormations.formationsList[formationId];
				let isTerminated = formation.isTerminated;
				let terminatedOn = formation.terminatedOn;
				AllFormations.releaseFormation(formationId);
				let newFormationId = AllFormations.addFormation(new Formation(formation.seriesId, document.querySelector('#fmrn-formation-name').value, formation.cars, formation.belongsTo, now))
				//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
				if (isTerminated) {
					AllFormations.releaseFormation(newFormationId, terminatedOn);
				}
				Dialog.list.formationRenameDialog.off();
				reflesh();
			}
		}
	});

	//アラート:alrt
	new Dialog("alertDialog", "警告", `<img src="./js/alert.svg" class="dialog-icon"><div id="alrt-main"></div>`, [{ "content": "OK", "event": `Dialog.list.alertDialog.off()`, "icon": "check" }], {
		display: function (message) {
			document.getElementById("alrt-main").innerHTML = message;
			Dialog.list.alertDialog.on();
		}
	}, true);

	//確認:cnfm
	new Dialog("confirmDialog", "確認", `<img src="./js/confirm.svg" class="dialog-icon"><div id="cnfm-main"></div>`, [{ "content": "OK", "event": `Dialog.list.confirmDialog.functions.callback();Dialog.list.alertDialog.off()`, "icon": "check" }, { "content": "NO", "event": `Dialog.list.confirmDialog.off()`, "icon": "close" }], {
		display: function (message, callback) {
			document.getElementById("cnfm-main").innerHTML = message;
			Dialog.list.confirmDialog.functions.callback = callback;
			Dialog.list.confirmDialog.on();
		},
		callback: function () { }
	}, true);
})