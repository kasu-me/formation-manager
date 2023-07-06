class Dialog {
	static area;
	static list = {};

	//new Dialog("ID","タイトル","本文",[{"event":"ボタン1のイベント","content":"ボタン1の本文"},{"event":"ボタン2のイベント","content":"ボタン2の本文"},...],{関数,関数,...});
	constructor(id, dialogTitle, message, buttons, functions) {
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
		this.functions = functions;
		Dialog.area.appendChild(this.dialog);

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
		Dialog.offAll();
		Dialog.open(Dialog.area);
		Dialog.open(this.dialog);
	}
	off() {
		reflesh();
		Dialog.closeDialogArea();
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
	static closeDialogArea() {
		Dialog.close(Dialog.area);
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
	Dialog.area = document.createElement("div");
	Dialog.area.id = "dialog-area";
	document.body.appendChild(Dialog.area);

	//以下、ダイアログ定義

	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式追加", "event": ``, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }], {
		//形式一覧ダイアログを表示
		display: function () {
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
	});

	//編成テンプレート一覧:fort
	new Dialog("formationTemplatesDialog", "編成テンプレート一覧", `<div class="table-container"></div>`, [{ "content": "テンプレート作成", "event": `Dialog.list.createFormationTemplateDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.formationTemplatesDialog.off();`, "icon": "close" }], {
		//編成テンプレート一覧ダイアログを表示
		display: function () {
			let formationTemplateList = formationTemplates.getFormationTemplateList();
			let table = new Table();
			table.setAttributes({ "class": "horizontal-stripes" });
			let maxCellCount = 3;
			for (let formationTemplateId in formationTemplateList) {
				table.addRow();
				table.addCell(`${serieses.seriesesList[formationTemplateList[formationTemplateId].seriesId].name}`, { "class": "formation-name" });
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
	new Dialog("createFormationFromTemplateDialog", "編成テンプレートから編成作成", `
		<p><label><span>番号:</span><input id="fromt-car-number" type="number" value="1" onchange="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))" onkeyup="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))"></label></p>
		<p><label><span>所属:</span><input id="fromt-car-belongs-to"></label></p>
		<div id="fromt-opening">
		</div>
		<div id="fromt-template-legend"></div>
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
		},
		//編成テンプレートから編成を作成
		createFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationFromTemplateDialog.isActive) {
				formations.addFormationFromTemplate(cars, formationTemplates.getFormationTemplate(Number(document.querySelector('#fromt-opening').innerHTML)), Number(document.querySelector("#fromt-car-number").value), document.querySelector("#fromt-car-belongs-to").value);
				Dialog.list.createFormationFromTemplateDialog.off();
			}
		}
	});

	//編成に所属していない車両から編成作成:forfc
	new Dialog("createFormationFromFloatingCarsDialog", "編成に所属していない車両から編成作成", `
	<p>※車両が選択された状態で現在年月を操作すると選択がリセットされます</p>
	<p><label><span>形式:</span><select id="forfc-series" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()"></select></label></p>
	<p><label><span>編成番号:</span><input id="forfc-formation-name" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()"></label></p>
	<p><label><span>所属:</span><input id="forfc-car-belongs-to"></label></p>
	<div id="forfc-not-formated-cars-table"></div>
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
				table.addCell(`<a href="javascript:void(0)" onclick="if(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id})==-1){Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.push(${id})}else{Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id}),1)}this.parentNode.classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()">${cars.carsList[id].number}</a>`, { "class": "car", "id": `forfc-car-${id}` });
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
				table.addCell(`<a href="javascript:void(0)" onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(${i},1);document.querySelector('#forfc-car-${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]}').classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()">${cars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]].number}</a>`);
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
				formations.addFormation(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation);
				Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation = new Formation(0, 0, []);
				Dialog.list.createFormationFromFloatingCarsDialog.off();
			}
		}
	});

	//編成テンプレートを作成:cref
	new Dialog("createFormationTemplateDialog", "編成テンプレートを作成", `形式:<select id="cref-series" onchange="Dialog.list.createFormationTemplateDialog.functions.reflesh()"></select><p>車両番号の一般式:<input id="cref-carnumber"><button onclick="Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumber(document.getElementById('cref-carnumber').value);Dialog.list.createFormationTemplateDialog.functions.reflesh();document.getElementById('cref-carnumber').value='';document.getElementById('cref-carnumber').focus()" class="lsf-icon" icon="add">追加</button></p><div id="cref-new-formated-template-table"></div>`, [{ "content": "編成作成", "event": ``, "icon": "check" }, { "content": "クリア", "event": ``, "icon": "clear" }, { "content": "キャンセル", "event": `Dialog.list.createFormationTemplateDialog.off();`, "icon": "close" }], {
		tentativeFormationTemplate: new FormationTemplate(),
		//編成テンプレートを作成ダイアログを表示
		display: function () {
			//セレクトボックスに形式名を投入
			setSeriesesToSelectBox(document.querySelector("#cref-series"));
			Dialog.list.createFormationTemplateDialog.functions.reflesh();
			Dialog.list.createFormationTemplateDialog.on();
		},
		//作成予定の編成テンプレートプレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId = Number(document.querySelector("#cref-series").value);

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
		}
	});

	new Dialog("confirmJSONDialog", "確認", `JSON読み込みを実施すると現在のデータはクリアされます。本当に読み込んでよろしいですか？`, [{ "content": "はい", "event": `continueReadJSON()`, "icon": "check" }, { "content": "キャンセル", "event": `document.querySelector('#jsonReader').value='';tmpJSON='';Dialog.list.confirmJSONDialog.off();`, "icon": "close" }]);

	//車両の詳細:cardt
	new Dialog("carDetealDialog", "車両の詳細", `<div id="cardt-main"></div>`, [{ "content": "廃車", "event": `dropCar()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.carDetealDialog.off();`, "icon": "close" }], {
		//車両の詳細ダイアログを表示
		display: function (x) {
			let table = new Table();
			table.setSubtitle(`<p class="car-name"><b><span id="cardt-car-number">${cars.carsList[x].numberInTime(now)}</span>号車</b><button class="lsf-icon" icon="pen" onclick="Dialog.list.carRenumberDialog.functions.display()">改番</button><span class="car-status lsf-icon ${cars.carsList[x].isActive ? "" : "dropped"}">${cars.carsList[x].isActive ? "現役" : `${cars.carsList[x].droppedOn.toString()}廃車`}</span></p>`);
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
		},

	});

	//車両の改番:carrn
	new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `Dialog.list.carRenumberDialog.functions.renumberCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.carRenumberDialog.off();`, "icon": "close" }], {
		//車両を改番ダイアログを表示
		display: function () {
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
		},
		//車両を改番
		renumberCar: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carRenumberDialog.isActive) {
				let carId = Number(document.querySelector('#carrn-opening').innerHTML);
				cars.renumberCar(carId, document.querySelector('#carrn-car-number').value);
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
			let formation = formations.formationsList[x];
			table.setSubtitle(`<p class="car-name"><b><span id="fmdt-formation-number">${formation.name}</span></b> (${formation.formatedOn.toStringWithLink()}～${formation.isTerminated ? `${formation.terminatedOn.toStringWithLink()}` : ``})<button class="lsf-icon" icon="pen" onclick="Dialog.list.formationRenameDialog.functions.display()">名称変更</button></p><div id="fmdt-opening">${x}</div>`);
			table.addRow();
			table.addCell(`編成ID:${x}`, { "colspan": formation.cars.length, "class": "formation-id" });
			table.addRow();
			for (let i in formation.cars) {
				table.addCell(Formatter.link(formation.cars[i], cars.carsList[formation.cars[i]].number));
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
		},
		//編成内の車両を全て廃車
		releaseFormationAndDropAllCars: function () {
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
	});

	//編成の改名:fmrn
	new Dialog("formationRenameDialog", "編成の改名", `<div id="fmrn-main"></div>`, [{ "content": "改名", "event": `Dialog.list.formationRenameDialog.functions.renameFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationRenameDialog.off();`, "icon": "close" }], {
		//編成を改名ダイアログを表示
		display: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				document.querySelector("#fmrn-main").innerHTML = `<p><input id="fmrn-formation-name" placeholder="${formations.formationsList[formationId].name}" value="${formations.formationsList[formationId].name}"></p><div id="fmrn-opening">${formationId}</div>`
				Dialog.list.formationRenameDialog.on();
			}
		},
		//編成を改名
		renameFormation: function () {
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
	});
})