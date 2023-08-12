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
new Message("MA010", "車両番号の重複があります。");
new Message("MA011", "同じ車両が複数の編成に組成されています。");
//Confirm Message
new Message("MC001", "この操作を実行すると現在のデータはクリアされます。本当に読み込んでよろしいですか？");
new Message("MC002", "${formationName}を${now}付で編成解除します。");
new Message("MC003", "${formationName}内の車両${carLength}両を${now}付で全て廃車します。");
new Message("MC004", "${carNumber}号車を${now}付で廃車します。");
new Message("MC005", "前回自動的にセーブされたデータが残っています。読み込みますか？");
new Message("MC006", "編成テンプレートを削除します。");
new Message("MC007", "選択した${count}件の${type}マスタデータを削除します。<br>廃車や編成解除とは違い、${type}を最初から存在しなかったものとする操作です。この操作は取り消せません。よろしいですか？");
//Symbol
new Message("MS001", `<style type="text/css">
.wn_st1{fill:#ff0000;}
.wn_st0{fill:#ffebeb;}
</style>
<svg version="1.1" id="レイヤー_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
	y="0px" viewBox="0 0 768 680.8" style="enable-background:new 0 0 768 680.8;height: 1em; transform:translateY(1px);margin-right:0.25em;" xml:space="preserve">
	<path class="wn_st1" d="M760,592.3L435.1,29.5c-22.7-39.3-79.5-39.3-102.2,0L8,592.3c-22.7,39.3,5.7,88.5,51.1,88.5h649.9
		C754.3,680.8,782.7,631.6,760,592.3z"/>
	<g>
		<g>
			<path class="wn_st0" d="M333,507.8H435V608H333V507.8z M431.8,268.6l-25.4,200.2h-46.2l-24.7-200.2V143.8h96.2L431.8,268.6
				L431.8,268.6z"/>
		</g>
	</g>
</svg>`);

//以下、ダイアログ定義
window.addEventListener("load", function () {
	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式作成", "event": `Dialog.list.createSeriesDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }], {
		//形式一覧ダイアログを表示
		display: function () {
			let seriesList = AllSerieses.seriesesList;
			let table = new Table();
			table.setAttributes({ "class": "horizontal-stripes row-hover-hilight" });
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
			table.setAttributes({ "class": "horizontal-stripes row-hover-hilight" });
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
	new Dialog("formationAddingDialog", "編成作成", `<ul class="dialog-buttons-list"><li><button onclick="Dialog.list.formationTemplatesDialog.functions.display()" class="lsf-icon dialog-main-button" icon="add">編成テンプレートから作成</button></li><li><button onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="add">編成に所属していない車両から作成</button></li></ul>`, [{ "content": "キャンセル", "event": `Dialog.list.formationAddingDialog.off();`, "icon": "close" }]);

	//編成テンプレートから編成作成:fromt
	new Dialog("createFormationFromTemplateDialog", "編成テンプレートから編成作成", `<table class="input-area">
	<tr>
		<td>番号</td>
		<td><input id="fromt-car-number" type="number" value="1" onchange="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Dialog.list.formationAddingDialog.functions.formationTemplateId,Number(this.value))" onkeyup="Dialog.list.createFormationFromTemplateDialog.functions.reflesh(Dialog.list.formationAddingDialog.functions.formationTemplateId,Number(this.value))"></td>
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
	<p class="element-bottom-of-input-area"><label for="fora-continue" class="mku-checkbox-container small"><input id="fora-continue" type="checkbox"></label><label for="fora-continue">連続で作成</label></p>
		<div id="fromt-template-legend"></div>
		<p>
			<button onclick="Dialog.list.formationTemplatesDialog.functions.display()" class="lsf-icon" icon="shuffle">他のテンプレートを使う</button>
		</p>
	`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromTemplateDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromTemplateDialog.off();`, "icon": "close" }], {
		formationTemplateId: 0,
		//編成テンプレートから編成を作成ダイアログを表示
		display: function (x) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationTemplatesDialog.isActive) {
				Dialog.list.formationAddingDialog.functions.formationTemplateId = x;
				document.getElementById("fromt-car-remark").value = "";
				Dialog.list.createFormationFromTemplateDialog.functions.reflesh(x, Number(document.getElementById("fromt-car-number").value));
				Dialog.list.createFormationFromTemplateDialog.on();
				document.getElementById("fromt-car-number").focus();
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
			document.getElementById("fromt-template-legend").innerHTML = table.generateTable();
		},
		//編成テンプレートから編成を作成
		createFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.createFormationFromTemplateDialog.isActive) {
				let formationInfo = AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(Dialog.list.formationAddingDialog.functions.formationTemplateId), Number(document.getElementById("fromt-car-number").value), document.getElementById("fromt-car-belongs-to").value);
				AllFormations.formationsList[formationInfo.formationId].remark = document.getElementById("fromt-car-remark").value;
				if (!document.getElementById("fora-continue").checked) {
					Dialog.list.createFormationFromTemplateDialog.off();
					Dialog.list.formationDetealDialog.functions.display(formationInfo.formationId);
				} else {
					reflesh();
					document.getElementById("fromt-car-number").focus();
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
	<div id="forfc-template-legend"></div>
		`, [{ "content": "編成作成", "event": `Dialog.list.createFormationFromFloatingCarsDialog.functions.createFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromFloatingCarsDialog.off();`, "icon": "close" }], {
		tentativeFormation: new Formation(),
		//編成されていない車両から編成作成ダイアログを表示
		display: function () {
			document.getElementById("forfc-formation-name").value = "";
			document.getElementById("forfc-car-belongs-to").value = "";
			document.getElementById("forfc-car-remark").value = "";
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation = new Formation(0, "", [], "", now);
			setSeriesesToSelectBox(document.getElementById("forfc-series"));
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
			document.getElementById("forfc-not-formated-cars-table").innerHTML = table.generateTable();
			Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh();
			Dialog.list.createFormationFromFloatingCarsDialog.on();
		},
		//作成予定の編成プレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setSeries(document.getElementById("forfc-series").value);
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setName(document.getElementById("forfc-formation-name").value);

			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
			table.setSubtitle("作成される編成のプレビュー");
			table.addRow();
			table.addCell(`編成番号:${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.name}`, { "colspan": Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length });
			for (let i in Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars) {
				if (i % 10 == 0) { table.addRow() }
				table.addCell(`<span>${AllCars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]].number}</span><a href="javascript:void(0)" onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(${i},1);document.getElementById('forfc-car-${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]}').classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.reflesh()" class="lsf preview-delete-button" title="削除">delete</a>`, { "class": "preview-car" });
			}
			table.addBlankCellToRowIn(0, true);
			document.getElementById("forfc-new-formated-cars-table").innerHTML = table.generateTable();
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
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.remark = document.getElementById("forfc-car-remark").value;
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
			Dialog.list.createFormationTemplateDialog.functions.resetDialog();
			//セレクトボックスに形式名を投入
			setSeriesesToSelectBox(document.getElementById("cref-series"));
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
				document.getElementById("cref-series").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId;
				document.getElementById("cref-name").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name;
				document.getElementById("cref-formationnumber").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawFormationName || "";
			} else {
				Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "編成テンプレートの作成";
				Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "作成";
			}
			Dialog.list.createFormationTemplateDialog.functions.reflesh();
			Dialog.list.createFormationTemplateDialog.on();
		},
		//作成予定の編成テンプレートプレビューをリフレッシュ
		reflesh: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.seriesId = Number(document.getElementById("cref-series").value);
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.name = document.getElementById("cref-name").value;

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
			document.getElementById("cref-new-formated-template-table").innerHTML = table.generateTable();
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
						Dialog.list.createFormationTemplateDialog.functions.resetDialog();
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
		resetDialog: function () {
			Dialog.list.createFormationTemplateDialog.functions.clearInputs();
			Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "";
			Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "確定";
			Dialog.list.createFormationTemplateDialog.functions.isExisting = false;
			Dialog.list.createFormationTemplateDialog.functions.isCopyMode = false;
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplateId = 0;
		},
		clearInputs: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate = new FormationTemplate();
			document.getElementById("cref-name").value = "";
			document.getElementById("cref-carnumber").value = "";
			document.getElementById("cref-formationnumber").value = "";
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
			//所属編成歴
			let formations = AllFormations.searchAllByCarId(x);
			let formationsText = formations.length == 0 ? `編成に所属したことがありません` : `<ul>`;
			for (let i in formations) {
				formationsText += `<li><a href="javascript:Dialog.list.formationDetealDialog.functions.display(${formations[i]})">${AllFormations.formationsList[formations[i]].name}</a><small> (${AllFormations.formationsList[formations[i]].formatedOn.toStringWithLink()}～${AllFormations.formationsList[formations[i]].isTerminated ? AllFormations.formationsList[formations[i]].terminatedOn.toStringWithLink() : ""})</small></li>`;
			}
			formationsText = `<ul>${formationsText}</ul>`;
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
			table.addCell(`所属編成歴`);
			table.addCell(formationsText);
			table.addRow();
			table.addCell("改番歴");
			table.addCell(oldNumbersText);
			table.addRow();
			table.addCell("備考");
			table.addCell(`${AllCars.carsList[x].remark == undefined || AllCars.carsList[x].remark == "" ? "" : `<span>${AllCars.carsList[x].remark}</span>`}<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('car',${x})">編集</button>`, { "class": "remark" });
			document.getElementById("cardt-main").innerHTML = table.generateTable();
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
				Dialog.list.carDetealDialog.functions.carId = Number(document.getElementById("cardt-car-id").innerHTML);
				if (AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].isDroppedInTime(now)) {
					Dialog.list.alertDialog.functions.display(Message.list["MA004"]);
					return;
				}
				document.getElementById("carrn-main").innerHTML = `<table class="input-area"><tr><td>車両番号</td><td><input id="carrn-car-number" placeholder="${AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].number}" value="${AllCars.carsList[Dialog.list.carDetealDialog.functions.carId].number}">号車</td></tr></table>`;
				Dialog.list.carRenumberDialog.on();
				document.getElementById("carrn-car-number").focus();
			}
		},
		//車両を改番
		renumberCar: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.carRenumberDialog.isActive) {
				AllCars.renumberCar(Dialog.list.carDetealDialog.functions.carId, document.getElementById("carrn-car-number").value);
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
	new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div><div id="fmdt-remark">備考：<span id="fmdt-remark-remark"></span><span id="fmdt-remark-button"></span></div>`, [{ "content": "車両並替", "event": `Dialog.list.formationShuffleDialog.functions.display(Dialog.list.formationDetealDialog.functions.formationId)`, "icon": "shuffle" }, { "content": "編成解除", "event": `Dialog.list.formationDetealDialog.functions.releaseFormation()`, "icon": "clear" }, { "content": "まとめて廃車", "event": `Dialog.list.formationDetealDialog.functions.releaseFormationAndDropAllCars()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.formationDetealDialog.off();`, "icon": "close" }], {
		formationId: 0,
		//編成の詳細ダイアログを表示
		display: function (x) {
			Dialog.list.formationDetealDialog.functions.formationId = x;
			let table = new Table();
			table.setAttributes({ "class": "formation-view" });
			let formation = AllFormations.formationsList[x];
			table.setSubtitle(`<p class="car-name"><b><span id="fmdt-formation-number">${formation.name}</span></b> (${formation.formatedOn.toStringWithLink()}～${formation.isTerminated ? `${formation.terminatedOn.toStringWithLink()}` : ``})<button class="lsf-icon" icon="pen" onclick="Dialog.list.formationRenameDialog.functions.display()">名称変更</button></p>`);
			table.addRow();
			table.addCell(`編成ID:${x}`, { "colspan": formation.cars.length, "class": "formation-id" });
			table.addRow();
			for (let i in formation.cars) {
				table.addCell(Formatter.link(formation.cars[i], AllCars.carsList[formation.cars[i]].number));
			}
			let html = table.generateTable();
			document.getElementById("fmdt-main").innerHTML = html;
			document.getElementById("fmdt-remark-remark").innerHTML = formation.remark == undefined ? "" : formation.remark;
			document.getElementById("fmdt-remark-button").innerHTML = `<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('formation',${x})">編集</button>`
			Dialog.list.formationDetealDialog.on();
		},
		//編成を解除
		releaseFormation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				let formationId = Dialog.list.formationDetealDialog.functions.formationId;
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
				let formationId = Dialog.list.formationDetealDialog.functions.formationId;
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
				Dialog.list.formationRenameDialog.functions.formationId = Dialog.list.formationDetealDialog.functions.formationId;
				document.getElementById("fmrn-main").innerHTML = `<table class="input-area"><tr><td>編成番号</td><td><input id="fmrn-formation-name" placeholder="${AllFormations.formationsList[Dialog.list.formationRenameDialog.functions.formationId].name}" value="${AllFormations.formationsList[Dialog.list.formationRenameDialog.functions.formationId].name}"></td></tr></table>`
				Dialog.list.formationRenameDialog.on();
				document.getElementById("fmrn-formation-name").focus();
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
				let newFormationId = AllFormations.addFormation(new Formation(formation.seriesId, document.getElementById("fmrn-formation-name").value, formation.cars, formation.belongsTo, now))
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
			table.setSubtitle("ドラッグで車両順序を変更");
			let maxCellCount = 10;
			let carIds = listUpNotFormatedCarIds();
			for (let id of Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<span>${AllCars.carsList[id].number}</span>`, { "class": "car preview-car", "id": `fmsh-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.getElementById("fmsh-main").innerHTML = table.generateTable();
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

	//編成表データ管理:mnfd
	new Dialog("formationDataManagementDialog", "編成表データ管理", `<ul class="dialog-buttons-list">
		<li><button onclick="Dialog.list.manageAllCarsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="list">全車両マスタデータ管理</button></li>
		<li><button onclick="Dialog.list.manageAllFormationsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="list">全編成マスタデータ管理</button></li>
		<li><button onclick="Dialog.list.editJSONDialog.functions.display()" class="lsf-icon dialog-main-button" icon="pen">JSON直接編集</button></li>
	</ul>`, [{ "content": "終了", "event": `Dialog.list.formationDataManagementDialog.off();`, "icon": "close" }]);

	//全車両管理:mnalc
	new Dialog("manageAllCarsDialog", "全車両マスタデータ管理", `<p>
		<input><button class="lsf-icon" icon="search">検索</button>
	</p>
	<div id="mnalc-table"></div>`, [{ "content": "一括削除", "event": `Dialog.list.manageAllCarsDialog.functions.deleteCars(Array.from(document.querySelectorAll('.mnalc-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('car-id')}));`, "icon": "delete", "disabled": "disabled", "id": "mnalc-deleteall" }, { "content": "終了", "event": `Dialog.list.manageAllCarsDialog.off();`, "icon": "close" }], {
		display: function () {
			Dialog.list.manageAllCarsDialog.functions.filterTerms = {};
			Dialog.list.manageAllCarsDialog.functions.createTable();
			Dialog.list.manageAllCarsDialog.on();
		},
		createTable: function () {
			let table = new Table();
			table.setAttributes({ "class": "row-hover-hilight management-dialog-objects-list horizontal-stripes" });
			table.addRow();
			table.addCell("<input type='checkbox'>");
			table.addCell("車両ID");
			table.addCell("車両番号(最新)");
			table.addCell("製造");
			table.addCell("廃車");
			table.addCell("操作");
			AllCars.carsList.forEach((car, carId) => {
				table.addRow();
				table.addCell(`<input type='checkbox' class='mnalc-raw-select' car-id='${carId}'>`);
				table.addCell(carId);
				table.addCell(car.number);
				table.addCell(car.manufacturedOn);
				table.addCell(car.isDropped ? car.droppedOn : "-");
				table.addCell(`<button class="lsf-icon" icon="search" onclick="Dialog.list.carDetealDialog.functions.display(${carId});">詳細</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.manageAllCarsDialog.functions.deleteCars([${carId}])">削除</button>`);
			})
			document.getElementById("mnalc-table").innerHTML = table.generateTable();
			setTableCheckboxEvents(document.getElementById("mnalc-table"), document.getElementById("mnalc-deleteall"));
			TableSort.addSortButtonToTable(document.getElementById("mnalc-table"));
		},
		deleteCars: function (carIds) {
			Dialog.list.confirmDialog.functions.display(Message.list["MC007"].toString({ "type": "車両", "count": carIds.length }), () => {
				carIds.forEach((carId) => {
					carId = Number(carId);
					AllCars.makeBrank(carId);
					//この車両を参照している全編成からこの車両を脱車
					AllFormations.searchAllByCarId(carId).forEach((formationId) => {
						let carPosition = AllFormations.formationsList[Number(formationId)].cars.indexOf(carId);
						if (carPosition != -1) {
							AllFormations.formationsList[Number(formationId)].cars.splice(carPosition, 1);
						}
					});
				});
				Dialog.list.manageAllCarsDialog.functions.createTable();
			});
		},
		filterTerms: {

		},
		filterFunc: function (car) {
			return true;
		}
	});

	//全編成管理:mnalf
	new Dialog("manageAllFormationsDialog", "全編成マスタデータ管理", `<p>
		<input><button class="lsf-icon" icon="search">検索</button>
	</p>
	<div id="mnalf-table"></div>`, [{ "content": "一括削除", "event": `Dialog.list.manageAllFormationsDialog.functions.deleteFormations(Array.from(document.querySelectorAll('.mnalf-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('formation-id')}));`, "icon": "delete", "disabled": "disabled", "id": "mnalf-deleteall" }, { "content": "終了", "event": `Dialog.list.manageAllFormationsDialog.off();`, "icon": "close" }], {
		display: function () {
			Dialog.list.manageAllFormationsDialog.functions.filterTerms = {};
			Dialog.list.manageAllFormationsDialog.functions.createTable();
			Dialog.list.manageAllFormationsDialog.on();
		},
		createTable: function () {
			let table = new Table();
			table.setAttributes({ "class": "row-hover-hilight management-dialog-objects-list horizontal-stripes" });
			table.addRow();
			table.addCell("<input type='checkbox'>");
			table.addCell("編成ID");
			table.addCell("編成番号");
			table.addCell("車両数");
			table.addCell("形式");
			table.addCell("組成年月");
			table.addCell("解除年月");
			table.addCell("操作");
			AllFormations.formationsList.forEach((formation, formationId) => {
				table.addRow();
				table.addCell(`<input type='checkbox' class='mnalf-raw-select' formation-id='${formationId}'>`);
				table.addCell(formationId);
				table.addCell(formation.name);
				table.addCell(formation.cars.length);
				table.addCell(AllSerieses.seriesesList[formation.seriesId].name);
				table.addCell(formation.formatedOn);
				table.addCell(formation.terminatedOn == undefined ? "-" : formation.terminatedOn);
				table.addCell(`<button class="lsf-icon" icon="search" icon="search" onclick="Dialog.list.formationDetealDialog.functions.display(${formationId});">詳細</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.manageAllFormationsDialog.functions.deleteFormations([${formationId}])">削除</button>`);
			})
			document.getElementById("mnalf-table").innerHTML = table.generateTable();
			setTableCheckboxEvents(document.getElementById("mnalf-table"), document.getElementById("mnalf-deleteall"));
			TableSort.addSortButtonToTable(document.getElementById("mnalf-table"));
		},
		deleteFormations: function (formationIds) {
			Dialog.list.confirmDialog.functions.display(Message.list["MC007"].toString({ "type": "編成", "count": formationIds.length }), () => {
				formationIds.forEach((formationId) => {
					formationId = Number(formationId);
					AllFormations.makeBrank(formationId);
				});
				Dialog.list.manageAllFormationsDialog.functions.createTable();
			});
		},
		filterTerms: {

		},
		filterFunc: function (formation) {
			return true;
		}
	});

	//表+チェックボックスで行選択
	function setTableCheckboxEvents(tableContainer, button) {
		//全件選択チェックボックス
		let selectAllCheckBox = tableContainer.querySelector("tr td input[type='checkbox']");
		//各行のチェックボックス
		let checkboxes = tableContainer.querySelectorAll("tr:not(:nth-child(1)) td input[type='checkbox']");
		//各行のステータスに応じてボタンの活性･非活性を切り替え
		let switchElementsByCheckedStatus = () => {
			let checkedAtLeastOnce = false;
			let checkedAll = true;
			for (let i of checkboxes) {
				if (i.checked) {
					checkedAtLeastOnce = true;
				} else {
					checkedAll = false;
				}
			}
			button.disabled = !checkedAtLeastOnce;
			if (checkedAll) {
				selectAllCheckBox.checked = true;
			}
		}
		//全選択チェックボックスのイベント
		selectAllCheckBox.addEventListener("click", () => {
			tableContainer.querySelectorAll("tr:not(:nth-child(1)) input[type='checkbox']").forEach((checkbox) => {
				checkbox.checked = selectAllCheckBox.checked;
			});
			switchElementsByCheckedStatus();
		});

		//各行チェックボックスのイベント
		checkboxes.forEach((checkBox) => {
			checkBox.addEventListener("click", () => {
				if (!checkBox.checked) {
					selectAllCheckBox.checked = false;
				}
				switchElementsByCheckedStatus();
			});
		});

		//各行をクリックでチェックボックスをチェック
		tableContainer.querySelectorAll("tr:not(:nth-child(1)) td:not(:first-child):not(:last-child)").forEach((td) => {
			td.addEventListener("click", () => {
				td.parentNode.querySelector("input[type='checkbox']").click();
			});
		});
	}

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
	new Dialog("helpDialog", "ヘルプ", helpDialogContents, [{ "content": "閉じる", "event": `Dialog.list.helpDialog.off();`, "icon": "close" }], {}, true);

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