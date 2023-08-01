//Alert Message
new Message("MA001", "編成には最低1両の車両を組成してください。");
new Message("MA002", "最低1つは車両番号の一般式が必要です。");
new Message("MA003", "形式名は必須です。");
new Message("MA004", "この車両は既に廃車されているため改番することはできません。");
new Message("MA005", "この編成は未来で解除されているため編成解除できません。");
new Message("MA006", "この編成は未来で解除されているため操作できません。");
new Message("MA007", "車両番号は必須です。");
new Message("MA008", "データを読み込めませんでした。データが壊れていないか確認してください。");
new Message("MA009", "処理エラーです。");
//Confirm Message
new Message("MC001", "この操作を実行すると現在のデータはクリアされます。本当に読み込んでよろしいですか？");
new Message("MC002", "${formationName}を${now}付で編成解除します。");
new Message("MC003", "${formationName}内の車両${carLength}両を${now}付で全て廃車します。");
new Message("MC004", "${carNumber}号車を${now}付で廃車します。");
new Message("MC005", "前回自動的にセーブされたデータが残っています。読み込みますか？");
new Message("MC006", "編成テンプレートを削除します。");

//以下、ダイアログ定義
window.addEventListener("load", function () {
	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式作成", "event": `Dialog.list.createSeriesDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }], {
		//形式一覧ダイアログを表示
		display: function () {
			let seriesList = AllSerieses.seriesesList;
			let table = new Table();
			table.setAttributes({ "class": "horizontal-stripes" });
			for (let seriesId in seriesList) {
				table.addRow();
				table.addCell(`${seriesList[seriesId].name}`, { "class": `formation-name${seriesList[seriesId].isHidden ? " hidden" : ""}` });
				table.addCell(`${seriesList[seriesId].description}`, { "class": "formation-template-name" });
				table.addCell(`<label for="sed-series-ishidden-${seriesId}" class="mku-checkbox-container" title="形式を表示/隠す"><input id="sed-series-ishidden-${seriesId}" type="checkbox" ${!seriesList[seriesId].isHidden ? "checked" : ""} onchange="AllSerieses.seriesesList[${seriesId}].isHidden=!this.checked;this.parentNode.parentNode.parentNode.querySelector('td').classList.toggle('hidden');reflesh()"></label><button class="lsf-icon" icon="pen" onclick="Dialog.list.createSeriesDialog.functions.display(${seriesId})">編集</button>`, { "class": "buttons" });
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
				if (AllSerieses.seriesesList[formationTemplateList[formationTemplateId].seriesId].isHidden) {
					continue;
				}
				table.addRow();
				table.addCell(`${AllSerieses.seriesesList[formationTemplateList[formationTemplateId].seriesId].name}`, { "class": "formation-name", "seriesId": formationTemplateList[formationTemplateId].seriesId });
				table.addCell(`${formationTemplateList[formationTemplateId].name}`, { "class": "formation-template-name" });
				let cellCount = 0;
				for (let i in formationTemplateList[formationTemplateId].carNumbers) {
					cellCount++;
					if (i >= maxCellCount) {
						table.addCell("&nbsp;…&nbsp;", { "class": "separator" });
						break;
					}
					table.addCell(formationTemplateList[formationTemplateId].carNumbers[i](1), { "class": "car" });
				}
				let carDiff = maxCellCount + 1 - cellCount;
				if (carDiff > 0) {
					for (let i = 0; i < carDiff; i++) {
						table.addCell("");
					}
				}
				table.addCell(`<button class="lsf-icon" icon="forward" onclick="Dialog.list.createFormationFromTemplateDialog.functions.display(${formationTemplateId})">使用</button><button class="lsf-icon" icon="pen" onclick="Dialog.list.createFormationTemplateDialog.functions.display(${formationTemplateId})">編集</button><button class="lsf-icon" icon="copy" onclick="Dialog.list.createFormationTemplateDialog.functions.display(${formationTemplateId},true)">複製</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.confirmDialog.functions.display(Message.list['MC006'],()=>{Dialog.list.formationTemplatesDialog.functions.deleteFormationTemplate(${formationTemplateId})})">削除</button>`, { "class": "buttons" });
			}
			table.rows.sort((a, b) => { return a[0].getAttibute("seriesId") < b[0].getAttibute("seriesId") ? -1 : 1 })
			document.querySelector("#formationTemplatesDialog div.table-container").innerHTML = table.generateTable();
			Dialog.list.formationTemplatesDialog.on();
		},
		deleteFormationTemplate: function (x) {
			if (Dialog.list.formationTemplatesDialog.isActive) {
				AllFormationTemplates.getFormationTemplateList().splice(x, 1);
				Dialog.list.formationTemplatesDialog.functions.display();
			}
		}
	});

	//編成を作成:fora
	new Dialog("formationAddingDialog", "編成作成", `<p><button onclick="Dialog.list.formationTemplatesDialog.functions.display()" class="lsf-icon dialog-main-button" icon="add">編成テンプレートから作成</button></p><p><button onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="add">編成に所属していない車両から作成</button></p>`, [{ "content": "キャンセル", "event": `Dialog.list.formationAddingDialog.off();`, "icon": "close" }]);

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
	<tr>
		<td><span>備考</span></td>
		<td><input id="fromt-car-remark"></td>
	</tr>
	</table>
	<div id="fromt-opening">
	</div>
	<p class="element-bottom-of-input-area"><label for="fora-continue" class="mku-checkbox-container small"><input id="fora-continue" type="checkbox"></label><label for="fora-continue">連続で作成</label></p>
		<div id="fromt-template-legend"></div>
		<p>
			<button onclick="Dialog.list.formationTemplatesDialog.functions.display()" class="lsf-icon" icon="shuffle">他のテンプレートを使う</button>
		</p>
	`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromTemplateDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromTemplateDialog.off();`, "icon": "close" }], {
		//編成テンプレートから編成を作成ダイアログを表示
		display: function (x) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationTemplatesDialog.isActive) {
				document.querySelector("#fromt-opening").innerHTML = x;
				document.querySelector('#fromt-car-remark').value = "";
				Dialog.list.createFormationFromTemplateDialog.functions.reflesh(x, Number(document.querySelector("#fromt-car-number").value));
				Dialog.list.createFormationFromTemplateDialog.on();
				document.querySelector('#fromt-car-number').focus();
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
				let formationInfo = AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(Number(document.querySelector('#fromt-opening').innerHTML)), Number(document.querySelector("#fromt-car-number").value), document.querySelector("#fromt-car-belongs-to").value);
				AllFormations.formationsList[formationInfo.formationId].remark = document.querySelector('#fromt-car-remark').value;
				if (!document.getElementById("fora-continue").checked) {
					Dialog.list.createFormationFromTemplateDialog.off();
					Dialog.list.formationDetealDialog.functions.display(formationInfo.formationId);
				} else {
					reflesh();
					document.querySelector('#fromt-car-number').focus();
				}
			}
		}
	});

	//編成に所属していない車両から編成作成:forfc
	new Dialog("createFormationFromFloatingCarsDialog", "編成に所属していない車両から編成作成", `
	<p class="dialog-warn warning">車両が選択された状態で現在年月を操作すると選択がリセットされます</p>
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
	<tr>
		<td>
			<span>備考</span>
		</td>
		<td>
			<input id="forfc-car-remark">
		</td>
	</tr>
	</table>
	<p class="element-bottom-of-input-area"><label for="forfc-continue" class="mku-checkbox-container small"><input id="forfc-continue" type="checkbox"></label><label for="forfc-continue">連続で作成</label></p>
	<div id="forfc-not-formated-cars-table"></div>
	<div id="forfc-new-formated-cars-table"></div>
	<div id="forfc-new-formation"></div>
	<div id="forfc-formation-opening"></div>
	<div id="forfc-template-legend"></div>
		`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromFloatingCarsDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromFloatingCarsDialog.off();`, "icon": "close" }], {
		tentativeFormation: new Formation(),
		//編成されていない車両から編成作成ダイアログを表示
		display: function () {
			document.getElementById("forfc-formation-name").value = "";
			document.getElementById("forfc-car-belongs-to").value = "";
			document.getElementById("forfc-car-remark").value = "";
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
				table.addCell(`<span>${AllCars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]].number}</span><a href="javascript:void(0)" onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(${i},1);document.querySelector('#forfc-car-${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]}').classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()" class="lsf preview-delete-button" title="削除">delete</a>`, { "class": "preview-car" });
			}
			table.addBlankCellToRowIn(0, true);
			document.querySelector("#forfc-new-formated-cars-table").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#forfc-new-formated-cars-table td.preview-car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(dragResult.to + dragResult.direction, 0, Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[dragResult.me]);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0), 1);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh();
				}
			});
		},
		//編成に組成されていない車両から編成を作成
		createFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationFromFloatingCarsDialog.isActive) {
				if (Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length == 0) {
					Dialog.list.alertDialog.functions.display(Message.list["MA001"]);
				} else {
					if (Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.name == "") {
						Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.name = `${AllCars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[0]].number}F`;
					}
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.remark = document.querySelector("#forfc-car-remark").value;
					let formationId = AllFormations.addFormation(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation = new Formation(0, 0, []);

					if (!document.getElementById("forfc-continue").checked) {
						Dialog.list.createFormationFromFloatingCarsDialog.off();
						Dialog.list.formationDetealDialog.functions.display(formationId);
					} else {
						Dialog.list.createFormationFromFloatingCarsDialog.functions.display();
						reflesh();
					}
				}
			}
		}
	});

	//編成テンプレートを作成･編集:cref
	new Dialog("createFormationTemplateDialog", "編成テンプレートの作成･編集･複製", `<table class="input-area"><tr><td>形式</td><td><select id="cref-series" onchange="Dialog.list.createFormationTemplateDialog.functions.reflesh()"></select></td></tr><tr><td>テンプレートの説明</td><td><input id="cref-name" oninput="Dialog.list.createFormationTemplateDialog.functions.reflesh();"></td></tr><tr><td>編成番号の一般式</td><td><input id="cref-formationnumber" oninput="try{Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.formationName=this.value;Dialog.list.createFormationTemplateDialog.functions.reflesh()}catch(e){}"></td></tr><tr><td>車両番号の一般式</td><td><input id="cref-carnumber" onkeyup="if(event.keyCode==13){document.getElementById('cref-add-number-button').click()}"><button id="cref-add-number-button" onclick="try{Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumber(document.getElementById('cref-carnumber').value);Dialog.list.createFormationTemplateDialog.functions.reflesh();document.getElementById('cref-carnumber').value='';}catch(e){}document.getElementById('cref-carnumber').focus()" class="lsf-icon" icon="add">追加</button></td></tr></table><div id="cref-new-formated-template-table" class="element-bottom-of-input-area"></div>`, [{ "content": "確定", "event": `Dialog.list.createFormationTemplateDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "クリア", "event": `Dialog.list.createFormationTemplateDialog.functions.clearInputs();Dialog.list.createFormationTemplateDialog.functions.reflesh();`, "icon": "clear" }, { "content": "キャンセル", "event": `Dialog.list.createFormationTemplateDialog.off();`, "icon": "close" }], {
		tentativeFormationTemplate: new FormationTemplate(),
		tentativeFormationTemplateId: 0,
		isExisting: false,
		isCopyMode: false,
		//編成テンプレートを作成ダイアログを表示
		display: function (x, isCopyMode) {
			Dialog.list.createFormationTemplateDialog.functions.clearInputs();
			//セレクトボックスに形式名を投入
			setSeriesesToSelectBox(document.querySelector("#cref-series"));
			//既存の編成テンプレートの場合
			if (x != undefined) {
				Dialog.list.createFormationTemplateDialog.functions.isExisting = true;
				if (isCopyMode) {
					Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "編成テンプレートの複製";
					Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "複製";
					Dialog.list.createFormationTemplateDialog.functions.isCopyMode = true;
				} else {
					Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "編成テンプレートの編集";
					Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "保存";
					Dialog.list.createFormationTemplateDialog.functions.isCopyMode = false;
				}
				Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplateId = x;
				let tmpTemplate = AllFormationTemplates.getFormationTemplate(x);
				Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate = new FormationTemplate(tmpTemplate.seriesId, tmpTemplate.name, tmpTemplate.carNumbers, tmpTemplate.rawFormationName);
				document.querySelector("#cref-series").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId;
				document.querySelector("#cref-name").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name;
				document.querySelector("#cref-formationnumber").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawFormationName || "";
			} else {
				Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "編成テンプレートの作成";
				Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "作成";
			}
			Dialog.list.createFormationTemplateDialog.functions.reflesh();
			Dialog.list.createFormationTemplateDialog.on();
		},
		//作成予定の編成テンプレートプレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId = Number(document.querySelector("#cref-series").value);
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name = document.querySelector("#cref-name").value;

			let table = new Table();
			if (Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length != 0) {
				table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
				table.setSubtitle("作成される編成テンプレートから作成できる編成のトップナンバーのプレビュー");
				table.addRow();
				table.addCell(`編成番号:${Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.formationName(1)}`, { "colspan": Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length });
				for (let i in Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers) {
					if (i % 10 == 0) { table.addRow() }
					table.addCell(`<span>${Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers[i](1)}</span><a href="javascript:void(0)" onclick="Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.deleteCarNumber(${i});Dialog.list.createFormationTemplateDialog.functions.reflesh()" class="lsf preview-delete-button" title="削除">delete</a>`, { "class": "preview-car" });
				}
				table.addBlankCellToRowIn(0, true);
			}
			document.querySelector("#cref-new-formated-template-table").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#cref-new-formated-template-table td.preview-car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumberTo(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawCarNumbers[dragResult.me], dragResult.to + dragResult.direction);
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.deleteCarNumber(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0));
					Dialog.list.createFormationTemplateDialog.functions.reflesh();
				}
			});
		},
		createFormationTemplate: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationTemplateDialog.isActive) {
				if (Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers.length < 1) {
					Dialog.list.alertDialog.functions.display(Message.list["MA002"]);
				} else {
					if (!Dialog.list.createFormationTemplateDialog.functions.isExisting || Dialog.list.createFormationTemplateDialog.functions.isCopyMode) {
						//新規編成テンプレートの場合
						AllFormationTemplates.addFormationTemplate(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate);
						Dialog.list.createFormationTemplateDialog.functions.clearInputs();
					} else {
						//既存編成テンプレートの場合
						let tmpTemplate = AllFormationTemplates.getFormationTemplate(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplateId);
						tmpTemplate.seriesId = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId;
						tmpTemplate.name = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name;
						tmpTemplate.carNumbers = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers;
						tmpTemplate.formationName = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawFormationName;
					}
					Dialog.list.createFormationTemplateDialog.off();
					Dialog.list.formationTemplatesDialog.functions.display();
				}
			}
		},
		clearInputs: function () {
			Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "";
			Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "確定";
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate = new FormationTemplate();
			Dialog.list.createFormationTemplateDialog.functions.isExisting = false;
			Dialog.list.createFormationTemplateDialog.functions.isCopyMode = false;
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplateId = 0;
			document.querySelector("#cref-name").value = "";
			document.querySelector("#cref-carnumber").value = "";
			document.querySelector("#cref-formationnumber").value = "";
		}
	});

	//形式を作成･編集:crsr
	new Dialog("createSeriesDialog", "形式の作成･編集", `<table class="input-area"><tr><td>形式名</td><td><input id="crsr-series-name"></td></tr><tr><td>説明</td><td><input id="crsr-series-description"></td></tr><tr><td>編成を表示する</td><td><label for="crsr-series-ishidden" class="mku-checkbox-container"><input id="crsr-series-ishidden" type="checkbox" checked></label></td></tr></table>`, [{ "content": "確定", "event": `Dialog.list.createSeriesDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createSeriesDialog.off();`, "icon": "close" }], {
		tentativeSeries: null,
		display: function (x) {
			Dialog.list.createSeriesDialog.functions.clearInputs();
			if (x != undefined) {
				//既存形式
				Dialog.list.createSeriesDialog.dialogTitle.innerHTML = "形式の編集";
				Dialog.list.createSeriesDialog.functions.tentativeSeries = AllSerieses.seriesesList[x];
				document.getElementById("crsr-series-name").value = Dialog.list.createSeriesDialog.functions.tentativeSeries.name;
				document.getElementById("crsr-series-description").value = Dialog.list.createSeriesDialog.functions.tentativeSeries.description;
				document.getElementById("crsr-series-ishidden").checked = !Dialog.list.createSeriesDialog.functions.tentativeSeries.isHidden;
			} else {
				//新規形式
				Dialog.list.createSeriesDialog.dialogTitle.innerHTML = "形式の作成";
				Dialog.list.createSeriesDialog.functions.tentativeSeries = null;
			}
			Dialog.list.createSeriesDialog.on();
		},
		createFormationTemplate: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createSeriesDialog.isActive) {
				let seriesName = document.getElementById("crsr-series-name").value;
				let seriesDescription = document.getElementById("crsr-series-description").value;
				let seriesIsHidden = !document.getElementById("crsr-series-ishidden").checked;
				if (seriesName == "") {
					Dialog.list.alertDialog.functions.display(Message.list["MA003"]);
				} else {
					if (Dialog.list.createSeriesDialog.functions.tentativeSeries == null) {
						//新規形式
						AllSerieses.addSeries(new Series(seriesName, "", seriesDescription, seriesIsHidden));
					} else {
						//既存形式
						Dialog.list.createSeriesDialog.functions.tentativeSeries.name = seriesName;
						Dialog.list.createSeriesDialog.functions.tentativeSeries.description = seriesDescription;
						Dialog.list.createSeriesDialog.functions.tentativeSeries.isHidden = seriesIsHidden;
					}
					Dialog.list.createSeriesDialog.off();
					Dialog.list.createSeriesDialog.functions.clearInputs();
					Dialog.list.seriesDispDialog.functions.display();
				}
			}
		},
		clearInputs: function () {
			Dialog.list.createSeriesDialog.dialogTitle.innerHTML = "";
			Dialog.list.createSeriesDialog.functions.tentativeSeries = null;
			document.getElementById("crsr-series-name").value = "";
			document.getElementById("crsr-series-description").value = "";
			document.getElementById("crsr-series-ishidden").checked = true;
		}
	});

	//車両の作成:crcar
	new Dialog("createCarDialog", "車両作成", `<table class="input-area"><tr><td>車両番号</td><td><input id="crcar-carNumber"></td></tr><tr><td>備考</td><td><input id="crcar-carRemark"></td></tr></table><p class="element-bottom-of-input-area"><label for="crcar-continue" class="mku-checkbox-container small"><input id="crcar-continue" type="checkbox"></label><label for="crcar-continue">連続で作成</label></p>`, [{ "content": "作成", "event": `Dialog.list.createCarDialog.functions.createCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createCarDialog.off();`, "icon": "close" }], {
		carId: 0,
		//車両の作成ダイアログを表示
		display: function () {
			document.getElementById("crcar-carNumber").value = "";
			document.getElementById("crcar-carRemark").value = "";
			Dialog.list.createCarDialog.on();
			document.getElementById("crcar-carNumber").focus();
		},
		//車両の作成
		createCar: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createCarDialog.isActive) {
				if (document.getElementById("crcar-carNumber").value == "") {
					Dialog.list.alertDialog.functions.display(Message.list["MA007"]);
				} else {
					let carId = AllCars.addCar(new Car(document.getElementById("crcar-carNumber").value, now, null, document.getElementById("crcar-carRemark").value));
					if (!document.getElementById("crcar-continue").checked) {
						Dialog.list.createCarDialog.off();
						Dialog.list.carDetealDialog.functions.display(carId);
					} else {
						Dialog.list.createCarDialog.functions.display();
						reflesh();
					}
				}
			}
		}
	});

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
			table.addCell(`${formation != -1 ? `<a href="javascript:Dialog.list.formationDetealDialog.functions.display(${formation})">${AllFormations.formationsList[formation].name}</a><small> (${AllFormations.formationsList[formation].formatedOn.toStringWithLink()}～${AllFormations.formationsList[formation].isTerminated ? AllFormations.formationsList[formation].terminatedOn.toStringWithLink() : ""})` : `編成に所属していません<small> (${now.toStringWithLink()}時点)`}</small>`);
			table.addRow();
			table.addCell("車歴");
			table.addCell(oldNumbersText);
			table.addRow();
			table.addCell("備考");
			table.addCell(`${AllCars.carsList[x].remark == undefined || AllCars.carsList[x].remark == "" ? "" : `<span>${AllCars.carsList[x].remark}</span>`}<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('car',${x})">編集</button>`, { "class": "remark" });
			document.querySelector("#cardt-main").innerHTML = table.generateTable();
			Dialog.list.carDetealDialog.on();
		},

	});

	//車両の改番:carrn
	new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `Dialog.list.carRenumberDialog.functions.renumberCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.carRenumberDialog.off();Dialog.list.carDetealDialog.functions.display(Dialog.list.carDetealDialog.functions.carId)`, "icon": "close" }], {
		carId: 0,
		//車両を改番ダイアログを表示
		display: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carDetealDialog.isActive) {
				Dialog.list.carDetealDialog.functions.carId = Number(document.querySelector('#cardt-car-id').innerHTML);
				if (AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].isDroppedInTime(now)) {
					Dialog.list.alertDialog.functions.display(Message.list["MA004"]);
					return;
				}
				document.querySelector("#carrn-main").innerHTML = `<table class="input-area"><tr><td>車両番号</td><td><input id="carrn-car-number" placeholder="${AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].number}" value="${AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].number}">号車</td></tr></table><div id="carrn-opening">${Dialog.list.carDetealDialog.functions.carId}</div>`
				Dialog.list.carRenumberDialog.on();
				document.querySelector('#carrn-car-number').focus();
			}
		},
		//車両を改番
		renumberCar: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carRenumberDialog.isActive) {
				AllCars.renumberCar(Dialog.list.carDetealDialog.functions.carId, document.querySelector('#carrn-car-number').value);
				Dialog.list.carRenumberDialog.off();
				reflesh();
				Dialog.list.carDetealDialog.functions.display(Dialog.list.carDetealDialog.functions.carId);
			}
		}
	}, true);

	//備考編集:edrm
	new Dialog("editRemarkDialog", "備考の編集", `<table class="input-area"><tr><td id="edrm-title"></td><td><input id="edrm-remark"></td></tr></table>`, [{ "content": "決定", "event": `Dialog.list.editRemarkDialog.functions.setRemark()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.editRemarkDialog.off();`, "icon": "close" }], {
		id: 0,
		type: 0,
		//備考編集ダイアログを表示
		display: function (type, x) {
			Dialog.list.editRemarkDialog.functions.type = type;
			Dialog.list.editRemarkDialog.functions.id = x;
			switch (Dialog.list.editRemarkDialog.functions.type) {
				case "car":
					document.getElementById("edrm-title").innerHTML = `${AllCars.carsList[Dialog.list.editRemarkDialog.functions.id].number}号車の備考`;
					document.getElementById("edrm-remark").value = AllCars.carsList[Dialog.list.editRemarkDialog.functions.id].remark == undefined ? "" : AllCars.carsList[Dialog.list.editRemarkDialog.functions.id].remark;
					break;
				case "formation":
					document.getElementById("edrm-title").innerHTML = `${AllFormations.formationsList[Dialog.list.editRemarkDialog.functions.id].name}の備考`;
					document.getElementById("edrm-remark").value = AllFormations.formationsList[Dialog.list.editRemarkDialog.functions.id].remark == undefined ? "" : AllFormations.formationsList[Dialog.list.editRemarkDialog.functions.id].remark;
					break;
			}
			Dialog.list.editRemarkDialog.on();
			document.getElementById("edrm-remark").focus();
		},
		//備考編集
		setRemark: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.editRemarkDialog.isActive) {
				switch (Dialog.list.editRemarkDialog.functions.type) {
					case "car":
						AllCars.carsList[Dialog.list.editRemarkDialog.functions.id].remark = document.getElementById("edrm-remark").value;
						break;
					case "formation":
						AllFormations.formationsList[Dialog.list.editRemarkDialog.functions.id].remark = document.getElementById("edrm-remark").value;
						Dialog.list.formationDetealDialog.functions.display(Dialog.list.editRemarkDialog.functions.id);
						break;
				}
			}
			Dialog.list.editRemarkDialog.functions.type = 0;
			Dialog.list.editRemarkDialog.functions.id = 0;
			Dialog.list.editRemarkDialog.off();
		}
	}, true);

	//編成の詳細:fmdt
	new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div><div id="fmdt-remark">備考：<span id="fmdt-remark-remark"></span><span id="fmdt-remark-button"></span></div>`, [{ "content": "車両並替", "event": `Dialog.list.formationShuffleDialog.functions.display(Number(document.querySelector('#fmdt-opening').innerHTML))`, "icon": "shuffle" }, { "content": "編成解除", "event": `Dialog.list.formationDetealDialog.functions.releaseFormation()`, "icon": "clear" }, { "content": "まとめて廃車", "event": `Dialog.list.formationDetealDialog.functions.releaseFormationAndDropAllCars()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.formationDetealDialog.off();`, "icon": "close" }], {
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
			document.querySelector("#fmdt-remark-remark").innerHTML = formation.remark == undefined ? "" : formation.remark;
			document.querySelector("#fmdt-remark-button").innerHTML = `<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('formation',${x})">編集</button>`
			Dialog.list.formationDetealDialog.on();
		},
		//編成を解除
		releaseFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				if (AllFormations.formationsList[formationId].isTerminated) {
					Dialog.list.alertDialog.functions.display(Message.list["MA005"]);
					return;
				}
				Dialog.list.confirmDialog.functions.display(Message.list["MC002"].toString({ "formationName": AllFormations.formationsList[formationId].name, "now": now.toString() }), function () {
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
					Dialog.list.alertDialog.functions.display(Message.list["MA006"]);
					return;
				}
				Dialog.list.confirmDialog.functions.display(Message.list["MC003"].toString({ "formationName": AllFormations.formationsList[formationId].name, "carLength": AllFormations.formationsList[formationId].cars.length, "now": now.toString() }), function () {
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
	new Dialog("formationRenameDialog", "編成の改名", `<div id="fmrn-main"></div>`, [{ "content": "改名", "event": `Dialog.list.formationRenameDialog.functions.renameFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationRenameDialog.off();Dialog.list.formationDetealDialog.functions.display(Dialog.list.formationRenameDialog.functions.formationId)`, "icon": "close" }], {
		formationId: 0,
		//編成を改名ダイアログを表示
		display: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				Dialog.list.formationRenameDialog.functions.formationId = Number(document.querySelector('#fmdt-opening').innerHTML);
				document.querySelector("#fmrn-main").innerHTML = `<table class="input-area"><tr><td>編成番号</td><td><input id="fmrn-formation-name" placeholder="${AllFormations.formationsList[Dialog.list.formationRenameDialog.functions.formationId].name}" value="${AllFormations.formationsList[Dialog.list.formationRenameDialog.functions.formationId].name}"></td></tr></table><div id="fmrn-opening">${Dialog.list.formationRenameDialog.functions.formationId}</div>`
				Dialog.list.formationRenameDialog.on();
				document.querySelector('#fmrn-formation-name').focus();
			}
		},
		//編成を改名
		renameFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationRenameDialog.isActive) {
				let formation = AllFormations.formationsList[Dialog.list.formationRenameDialog.functions.formationId];
				let isTerminated = formation.isTerminated;
				let terminatedOn = formation.terminatedOn;
				AllFormations.releaseFormation(Dialog.list.formationRenameDialog.functions.formationId);
				let newFormationId = AllFormations.addFormation(new Formation(formation.seriesId, document.querySelector('#fmrn-formation-name').value, formation.cars, formation.belongsTo, now))
				//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
				if (isTerminated) {
					AllFormations.releaseFormation(newFormationId, terminatedOn);
				}
				Dialog.list.formationRenameDialog.off();
				reflesh();
				Dialog.list.formationDetealDialog.functions.display(newFormationId);
			}
		}
	}, true);

	//編成内車両の並べ替え:fmsh
	new Dialog("formationShuffleDialog", "編成内車両の並べ替え", `<div id="fmsh-main"></div>`, [{ "content": "確定", "event": `Dialog.list.formationShuffleDialog.functions.shuffleFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationShuffleDialog.off();Dialog.list.formationDetealDialog.functions.display(Dialog.list.formationShuffleDialog.functions.formationId)`, "icon": "close" }], {
		formationId: 0,
		tentativeFormation: new Formation(),
		//編成を改名ダイアログを表示
		display: function (x) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				Dialog.list.formationShuffleDialog.functions.formationId = x;
				let tmpFormation = AllFormations.formationsList[x];
				Dialog.list.formationShuffleDialog.functions.tentativeFormation = new Formation(tmpFormation.seriesId, tmpFormation.name, [...tmpFormation.cars], tmpFormation.belongsTo, now, tmpFormation.remark);
				Dialog.list.formationShuffleDialog.functions.reflesh();
				Dialog.list.formationShuffleDialog.on();
			}
		},
		reflesh: function () {
			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
			table.setSubtitle("編成に所属している車両一覧");
			let maxCellCount = 10;
			let carIds = listUpNotFormatedCarIds();
			for (let id of Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<span>${AllCars.carsList[id].number}</span>`, { "class": "car preview-car", "id": `fmsh-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.querySelector("#fmsh-main").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#fmsh-main td.car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.splice(dragResult.to + dragResult.direction, 0, Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars[dragResult.me]);
					Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.splice(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0), 1);
					Dialog.list.formationShuffleDialog.functions.reflesh();
				}
			});
		},
		shuffleFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationShuffleDialog.isActive) {
				let formation = AllFormations.formationsList[Dialog.list.formationShuffleDialog.functions.formationId];
				let isTerminated = formation.isTerminated;
				let terminatedOn = formation.terminatedOn;
				AllFormations.releaseFormation(Dialog.list.formationShuffleDialog.functions.formationId);
				let newFormationId = AllFormations.addFormation(Dialog.list.formationShuffleDialog.functions.tentativeFormation);
				//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
				if (isTerminated) {
					AllFormations.releaseFormation(newFormationId, terminatedOn);
				}
				Dialog.list.formationShuffleDialog.off();
				reflesh();
				Dialog.list.formationDetealDialog.functions.display(newFormationId);
			}
		}
	}, true);

	//以下、設定系

	//年月上下限を設定:stym
	new Dialog("settingYearMonthDialog", "年月上下限の設定", `<table class="input-area"><tr><td>年月下限</td><td><span class="time-inputs"><input id="stym-min-y" class="yearmonth-y" type="number">年<input id="stym-min-m" class="yearmonth-m" type="number">月</span></td></tr><tr><td>年月上限</td><td><span class="time-inputs"><input id="stym-max-y" class="yearmonth-y" type="number">年<input id="stym-max-m" class="yearmonth-m" type="number">月</span></td></tr></table>`, [{ "content": "設定", "event": `Dialog.list.settingYearMonthDialog.functions.updateYearMonthLimitation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.settingYearMonthDialog.off();`, "icon": "close" }], {
		display: function () {
			document.getElementById("stym-max-y").value = maxYearMonth.year;
			document.getElementById("stym-max-m").value = maxYearMonth.month;
			document.getElementById("stym-min-y").value = minYearMonth.year;
			document.getElementById("stym-min-m").value = minYearMonth.month;
			Dialog.list.settingYearMonthDialog.on();
		},
		updateYearMonthLimitation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.settingYearMonthDialog.isActive) {
				minYearMonth.update(Number(document.getElementById("stym-min-y").value), Number(document.getElementById("stym-min-m").value));
				maxYearMonth.update(Number(document.getElementById("stym-max-y").value), Number(document.getElementById("stym-max-m").value));
				setInputMaxAndMin();
				Dialog.list.settingYearMonthDialog.off();
			}
		}
	});

	//JSON直接編集:jsed
	new Dialog("editJSONDialog", "JSON直接編集", `<p class="dialog-warn warning">このデータの書き換えを誤ると、当アプリで作成･編集した全てのデータに影響を及ぼし、最悪の場合はデータを読み込めなくなります。バックアップは個人の責任で確実に行ってください。</p><textarea id="jsed-main"></textarea>`, [{ "content": "保存", "event": `Dialog.list.editJSONDialog.functions.save()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.editJSONDialog.off();`, "icon": "close" }], {
		display: function () {
			document.getElementById("jsed-main").value = generateJSON();
			Dialog.list.editJSONDialog.on();
		},
		save: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.editJSONDialog.isActive) {
				Dialog.list.confirmDialog.functions.display(Message.list["MC001"], () => {
					Dialog.list.editJSONDialog.off();
					//正常に読み込めなかった場合、自画面を再表示
					if (!loadListsFromJSON(document.getElementById("jsed-main").value)) {
						Dialog.list.editJSONDialog.functions.display();
					}
				});
			}
		}
	});


	//ヘルプダイアログ:help
	new Dialog("helpDialog", "ヘルプ", `
	<div class="mku-tab-container" id="help-tab">
		<div class="mku-tab-content" tab-title="編成表マネージャ概要">
			<h2>このアプリについて</h2>
			<p>鉄道車両の編成について、改番履歴や編成組成･解除の履歴を含めた編成表データセットと、それを動的に確認できるUIです。スライダーで年代を任意に設定しながら、その時々の編成を確認することができます。</p>
			<p>本アプリはサーバとの通信は一切行っておらず、本アプリで製作したデータは皆さんのPC内で完結しています。バックアップ等はご自身の責任において行っていただくようお願いいたします。</p>
			<h2>推奨環境</h2>
			<p>PCの最新版GoogleChromeでのご利用を推奨します。スマートフォン等のタッチデバイスでの動作の保証はいたしかねます。</p>
			<h2>謝辞</h2>
			<ul>
			<li>ボタン等の各種アイコンに「<a href="https://kudakurage.com/ligature_symbols/" target="_blank">Ligature Symbols</a>」を利用させていただきました。</li>
			<li>ソートに「<a href="https://github.com/bubkoo/natsort" target="_blank">natsort</a>」を利用させていただきました。</li>
			</ul>
			<p>以上、皆様に御礼申し上げます。</p>
			<h2>お問い合わせ</h2>
			<p>バグ報告･ご意見･ご要望･ご質問は<a href="https://twitter.com/KasumiTrans" target="_blank">Twitter</a>または<a href="mailto:morooka@kasu.me" target="_blank">メール</a>までお願いいたします。</p>
			<p>変更履歴は<a href="https://github.com/kasu-me/formation-manager" target="_blank">GitHub</a>をご覧ください。</p>
			<p>© 2023 M_Kasumi</p>
		</div>
		<div class="mku-tab-content" tab-title="編成･車両">
			<p>本アプリで重要となるのが「編成」および「車両」の概念です。本アプリでこれら2種類がどのように定義され、どのように扱われているかを解説します。</p>
			<h2>編成</h2>
			<p>本アプリでいう「編成」は、【「車両」を順番に並べ、名前(編成番号)を付けたデータの塊】として定義されます。同じ「車両」を同じ順番に並べたものが、本アプリでいうところの「同じ編成」ということになります。「編成」には固有の「編成ID」が付与されます。</p>
			<p>なお、「編成番号」は「編成」の一属性にすぎません。アプリ上では異なる「編成」として扱われるものが同じ「編成番号」を持つこともあり得ます。「編成番号」「車両の並び順」「組成年月」など、これら全てを含めた"データの塊"こそが本アプリでの「編成」の本質です。</p>
			<p>したがって、以下のような場合には「同じ編成」とは呼べなくなり、「編成」は解除されます。</p>
			<ul>
				<li>「編成番号」が変更された場合</li>
				<li>「編成」を構成する「車両」が変更された場合(廃車･脱車など)</li>
				<li>「編成」を構成する「車両」の並び順が変更された場合(組み替えなど)</li>
			</ul>
			<p>一方で、「編成」を構成する「車両」の番号が変更されただけでの場合は、「編成」は解除されません。これは、後述する「車両」の定義によるもので、番号が異なっていても「車両」が同じであれば「同じ車両」と見做すためです。</p>
			<p>現実に存在する鉄道車両であるE233系0番台のグリーン車組み込み準備工事を例に挙げましょう。同系列のうち、T編成は工事前後でサハE233-500形の組込位置が変わっているため、編成番号は同じでも「編成」は別物として扱われます。一方で、H編成ではモハE233-200形の番号がモハE233-800形に変更となっていますが、これらは「同じ車両」である上に、組込位置も変わっていないため、工事前後でも同じ「編成」として扱われます。</p>
			<p>後述の「車両」と異なり、「編成」の状態は「組成」と「解除」の2種類だけで、他の操作を加えることはできません。「編成番号」の変更も、実際には「編成」を解除したうえで新たに別番号の「編成」を組成しています。これは「編成」の状態に連続性を見出すことが非常に難しいためです。例えば、「1-2-3-4」という編成が「1-2」と「3-4」に分割された場合、どちらの編成が最初の編成の後継編成と言えるでしょう？どちらとも言い難い(あるいはどちらとも言える)ことがお分かりだと思います。このような事情から、本アプリでは「編成」に連続性は持たせず、一世一代のものとして扱うことになっています。</p>
			<h2>車両</h2>
			<p>本アプリでいう「車両」とは、【製造されてから廃車になるまでのデータの塊】です。現実世界で言うところの車籍と似たような概念だと考えてOKです。「車両」には固有の「車両ID」が付与されます。</p>
			<p>「車両番号」は「車両」の一属性にすぎず、「車両番号」が変わっても「車両ID」が同じであれば「同じ車両」です。「車両」には、その「車両」の今までの番号がすべて記録されており、番号が違っていても「同じ車両」であればその履歴を辿ることができます。</p>
			<p>また、「編成」は「形式」に所属していますが、「車両」は「形式」に所属していません。そのため、「形式」を跨いだ組み替えを行うことができるようになっています。</p>
		</div>
		<div class="mku-tab-content" tab-title="編成テンプレート">
			<h2>概要</h2>
			<p>一般的に、編成に組成される車両の番号はなんらかの規則性に基づいていることがほとんどです。そんな場合、車両番号を1両ずつ入力しているのでは面倒です。そこで本アプリは、その規則性を「一般式」として予めテンプレートに登録しておいて、そのテンプレートに基づいて編成を作成することができる機能を有しています。</p>
			<p>編成テンプレートは、「編成テンプレート」→「テンプレート作成」ボタンから作成することができます。</p>
			<h2>一般式の入力</h2>
			<p>車両番号の一般式は、「何本目の編成か」をnで表した場合、nの関数として考えると分かりやすいです。以下、様々なパターンを想定して記法を解説します。なお、編成番号の一般式も、車両番号の一般式と同じ要領で入力しますが、「1両目の番号+F」という形式である場合は省略可能です。</p>
			<h3>一般式(基本)</h3>
			<p>ある鉄道会社に、1編成目が「1001-1501」、2編成目が「1002-1502」であるグループがあったとします。千位で大まかなグループを表し、百位で細かいグループを表し、十位と一位で何本目の編成かを表している、よくあるスタイルです。</p>
			<p>これらの編成の車両番号の一般式は、第n編成の場合、「1000+n」および「1500+n」と表現することができます。</p>
			<p>このように、一般式に単にnを足すだけでよい場合、「テンプレート作成」ダイアログの「車両番号の一般式」欄には、「1000」とだけ入力し、「追加」ボタンを押してください。次の車両も同様に、「1500」と入力し、「追加」してください。</p>
			<p>ここまで正常に完了すると、下段に「編成テンプレートから作成できる編成のトップナンバーのプレビュー」が表示され、「1001-1501」の編成が表示されているはずです。</p>
			<h3>一般式(応用①)</h3>
			<p>では、別の鉄道会社に、1編成目が「2001-2002」、2編成目が「2003-2004」であるグループがあったとします。偶数と奇数を対にする、これまたよくあるスタイルです。</p>
			<p>これらの編成の車両番号の一般式は、第n編成の場合、「2000+n*2-1」および「2000+n*2」と表現することができます。</p>
			<p>このような場合、先程よりも複雑な記法が必要となります。まず、「テンプレート作成」ダイアログの「車両番号の一般式」欄には、「n=>2000+n*2-1」と入力する必要があります。これはJavaScriptの「アロー関数」と呼ばれる記法です。まず「n=>」の部分で「以下をnの関数としますよ」と宣言しています。次に、「2000+n*2-1」のように一般式を入力します。このように入力したら、「追加」ボタンを押してください。次の車両も同様に、「n=>2000+n*2」と入力し、「追加」してください。</p>
			<p>ここまで正常に完了すると、下段に「編成テンプレートから作成できる編成のトップナンバーのプレビュー」が表示され、「2001-2002」の編成が表示されているはずです。</p>
			<h3>一般式(応用②)</h3>
			<p>では、別の鉄道会社に、1編成目が「クモハ3001-クハ3501」、2編成目が「クモハ3002-クハ3502」であるグループがあったとします。車両の属性を表す記号など、数字以外の要素が付いたスタイルです。</p>
			<p>これらの編成の車両番号の数字部分の一般式は、第n編成の場合、「3000+n」および「3500+n」と表現することができます。</p>
			<p>しかし、今回は数字以外の文字が含まれているため、数字だけを記入する記法は使えません。このような場合も、応用①と同様にアロー関数を使った記法を使う必要があります。</p>
			<p>まず、「テンプレート作成」ダイアログの「車両番号の一般式」欄には、「n=>"クモハ"+(3000+n)」と入力する必要があります。「クモハ」と「3000+n」を「+」で結んだ形になりますが、クオーテーションを使うことで、数値と数値以外の文字を明確に区別します。このように入力したら、「追加」ボタンを押してください。</p>
			<p>次の車両も同様に、「n=>"クハ"+(3500+n)」と入力し、「追加」してください。</p>
			<p>ここまで正常に完了すると、下段に「編成テンプレートから作成できる編成のトップナンバーのプレビュー」が表示され、「クハ3001-クハ3501」の編成が表示されているはずです。</p>
			<h2>編成テンプレートを作成</h2>
			<p>入力が終わったら、「編成テンプレート作成」ボタンを押して完成です。</p>
			<h2>編成テンプレートから編成を作成</h2>
			<p>編成テンプレートから編成を作成するには、「編成テンプレート」ダイアログで使用するテンプレートを選び、「テンプレートを使用」ボタンを押します。</p>
			<p>「編成テンプレートから編成作成」ダイアログの「番号」入力欄に、「何本目の編成か」を入力します。前述の一般式の説明でいうところの「n」に相当する数字です。</p>
			<p>入力した状態で「編成作成」ボタンを押すと、編成を作成することができます。</p>
		</div>
		<div class="mku-tab-content" tab-title="JSON">
			<h2>保存</h2>
			<p>本アプリで作成したデータを保存したい場合、「JSON保存」ボタンを押すことで保存が可能です。本アプリで編集中のデータはブラウザの更新ボタンを押下すると消えてしまうため、定期的にJSONとして保存しておくことをおすすめします。</p>
			<h2>読込</h2>
			<p>PC上に存在するJSONファイルから読み込みを行います。編集中のデータが存在する状態でこの操作を実行すると、編集中のデータはすべて消えてしまいますので、必ず保存を行ってから読み込みを行うようにしてください。</p>
		</div>
	</div>`, [{ "content": "閉じる", "event": `Dialog.list.helpDialog.off();`, "icon": "close" }], {
	}, true);

	//アラート:alrt
	new Dialog("alertDialog", "警告", `<img src="./js/alert.svg" class="dialog-icon"><div id="alrt-main"></div>`, [{ "content": "OK", "event": `Dialog.list.alertDialog.off()`, "icon": "check" }], {
		display: function (message) {
			document.getElementById("alrt-main").innerHTML = message;
			Dialog.list.alertDialog.on();
			Dialog.list.alertDialog.buttons.querySelector("button[icon='check']").focus();
		}
	}, true);

	//確認:cnfm
	new Dialog("confirmDialog", "確認", `<img src="./js/confirm.svg" class="dialog-icon"><div id="cnfm-main"></div>`, [{ "content": "OK", "event": `Dialog.list.confirmDialog.functions.callback();Dialog.list.confirmDialog.off()`, "icon": "check" }, { "content": "NO", "event": `Dialog.list.confirmDialog.functions.interruption();Dialog.list.confirmDialog.off()`, "icon": "close" }], {
		display: function (message, callback, interruption) {
			document.getElementById("cnfm-main").innerHTML = message;
			Dialog.list.confirmDialog.functions.callback = callback;
			Dialog.list.confirmDialog.functions.interruption = interruption || Dialog.list.confirmDialog.functions.interruption;
			Dialog.list.confirmDialog.on();
			Dialog.list.confirmDialog.buttons.querySelector("button[icon='check']").focus();
		},
		callback: function () { },
		interruption: function () { }
	}, true);

	//情報:info
	new Dialog("infoDialog", "情報", `<img src="./js/info.svg" class="dialog-icon"><div id="info-main"></div>`, [{ "content": "OK", "event": `Dialog.list.infoDialog.off()`, "icon": "close" }], {
		display: function (message) {
			document.getElementById("info-main").innerHTML = message;
			Dialog.list.infoDialog.on();
			Dialog.list.infoDialog.buttons.querySelector("button[icon='check']").focus();
		}
	}, true);
})