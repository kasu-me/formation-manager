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
new Message("MA012", "車両番号の一般式が不正です。入力方法が分からない場合はヘルプを確認してください。");
new Message("MA013", "入力された正規表現に誤りがあります。");
//Information Message
new Message("MI001", "編成番号の重複があります。編成名：${name}");
//Confirm Message
new Message("MC001", "この操作を実行すると現在のデータはクリアされます。本当に読み込んでよろしいですか？");
new Message("MC002", "${formationName}を${now}付で編成解除します。");
new Message("MC003", "${formationName}内の車両${carLength}両を${now}付で全て廃車します。");
new Message("MC004", "${carNumber}号車を${now}付で廃車します。");
new Message("MC005", "前回自動的にセーブされたデータが残っています。読み込みますか？");
new Message("MC006", "編成テンプレートを削除します。");
new Message("MC007", "選択した${count}件の${type}マスタデータを削除します。<br>廃車や編成解除とは違い、${type}を最初から存在しなかったものとする操作です。この操作は取り消せません。よろしいですか？");
new Message("MC008", "サンプルデータを読み込みますか？");
new Message("MC009", "現在のデータをすべて破棄し、新しい編成表を作成します。この操作は取り消せません。よろしいですか？");
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
	const natSorter = natsort();

	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式作成", "event": `Dialog.list.createSeriesDialog.functions.display()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }], {
		//形式一覧ダイアログを表示
		display: function () {
			let seriesList = AllSerieses.seriesesList;
			let table = new Table();
			const seriesIds = Object.keys(seriesList).sort((f1, f2) => {
				return natSorter(seriesList[f1].name, seriesList[f2].name);
			});

			table.setAttributes({ "class": "horizontal-stripes row-hover-hilight" });
			for (let seriesId of seriesIds) {
				table.addRow();
				table.addCell(`${seriesList[seriesId].name}`, { "class": `formation-name${seriesList[seriesId].isHidden ? " hidden" : ""}` });
				table.addCell(`${seriesList[seriesId].description}`, { "class": "formation-template-name" });
				table.addCell(`<label for="sed-series-ishidden-${seriesId}" class="mku-checkbox-container mku-balloon" mku-balloon-message="編成表上での「${seriesList[seriesId].name}」の表示･非表示を切り替えます。"><input id="sed-series-ishidden-${seriesId}" type="checkbox" ${!seriesList[seriesId].isHidden ? "checked" : ""} onchange="AllSerieses.seriesesList[${seriesId}].isHidden=!this.checked;this.parentNode.parentNode.parentNode.querySelector('td').classList.toggle('hidden');"></label><button class="lsf-icon" icon="pen" onclick="Dialog.list.createSeriesDialog.functions.display(${seriesId})">編集</button>`, { "class": "buttons" });
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
				table.addCell(`<button class="lsf-icon" icon="pen" onclick="Dialog.list.createFormationTemplateDialog.functions.display(${formationTemplateId})">編集</button><button class="lsf-icon" icon="copy" onclick="Dialog.list.createFormationTemplateDialog.functions.display(${formationTemplateId},true)">複製</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.confirmDialog.functions.display(Message.list['MC006'],()=>{Dialog.list.formationTemplatesDialog.functions.deleteFormationTemplate(${formationTemplateId})})">削除</button>`, { "class": "buttons" });
				table.addCell(`<button class="lsf-icon" icon="forward" onclick="Dialog.list.createFormationFromTemplateDialog.functions.display(${formationTemplateId})">使用</button>`, { "class": "buttons" });
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
		<td><input id="fromt-car-number" type="number" value="1" onchange="Dialog.list.createFormationFromTemplateDialog.functions.refresh(Dialog.list.formationAddingDialog.functions.formationTemplateId,Number(this.value))" onkeyup="Dialog.list.createFormationFromTemplateDialog.functions.refresh(Dialog.list.formationAddingDialog.functions.formationTemplateId,Number(this.value))"></td>
	</tr>
	<tr>
		<td><span>所属</span></td>
		<td><input id="fromt-car-belongs-to"></td>
	</tr>
	<tr>
		<td><span>備考</span></td>
		<td><textarea id="fromt-car-remark"></textarea></td>
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
				Dialog.list.createFormationFromTemplateDialog.functions.refresh(x, Number(document.getElementById("fromt-car-number").value));
				Dialog.list.createFormationFromTemplateDialog.on();
				document.getElementById("fromt-car-number").focus();
			}
		},
		//編成テンプレートから編成を作成ダイアログのプレビューをリフレッシュ
		refresh: function (x, y) {
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
					const nextNum = Number(document.getElementById("fromt-car-number").value) + 1;
					document.getElementById("fromt-car-number").value = nextNum;
					Dialog.list.createFormationFromTemplateDialog.functions.refresh(Dialog.list.formationAddingDialog.functions.formationTemplateId, nextNum);
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
			<select id="forfc-series" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh()"></select>
		</td>
	</tr>
	<tr>
		<td>
			<span>編成番号</span>
		</td>
		<td>
			<input id="forfc-formation-name" oninput="Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh()">
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
			<textarea id="forfc-car-remark"></textarea>
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
				table.addCell(`<a href="javascript:void(0)" onclick="if(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id})==-1){Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.push(${id})}else{Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.indexOf(${id}),1)}this.parentNode.classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh()">${AllCars.carsList[id].number}</a>`, { "class": "car", "id": `forfc-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.getElementById("forfc-not-formated-cars-table").innerHTML = table.generateTable();
			Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh();
			Dialog.list.createFormationFromFloatingCarsDialog.on();
		},
		//作成予定の編成プレビューをリフレッシュ
		refresh: function () {
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setSeries(document.getElementById("forfc-series").value);
			Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.setName(document.getElementById("forfc-formation-name").value);

			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table formation-view" });
			table.setSubtitle("作成される編成のプレビュー");
			table.addRow();
			table.addCell(`編成番号:${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.name}`, { "colspan": Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.length });
			for (let i in Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars) {
				if (i % 10 == 0) { table.addRow() }
				table.addCell(`<span>${AllCars.carsList[Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]].number}</span><p><a href="javascript:void(0)" onclick="Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(${i},1);document.getElementById('forfc-car-${Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[i]}').classList.toggle('selected');Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh()" class="lsf preview-delete-button" title="削除">delete</a></p>`, { "class": "preview-car" });
			}
			table.addBlankCellToRowIn(0, true);
			document.getElementById("forfc-new-formated-cars-table").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#forfc-new-formated-cars-table td.preview-car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(dragResult.to + dragResult.direction, 0, Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars[dragResult.me]);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.tentativeFormation.cars.splice(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0), 1);
					Dialog.list.createFormationFromFloatingCarsDialog.functions.refresh();
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
					}
				}
			}
		}
	});

	//編成テンプレートを作成･編集:cref
	new Dialog("createFormationTemplateDialog", "編成テンプレートの作成･編集･複製", `<table class="input-area"><tr><td>形式</td><td><select id="cref-series" onchange="Dialog.list.createFormationTemplateDialog.functions.refresh()"></select></td></tr><tr><td>テンプレートの説明</td><td><input id="cref-name" oninput="Dialog.list.createFormationTemplateDialog.functions.refresh();"></td></tr><tr><td>編成番号の一般式</td><td><input id="cref-formationnumber" oninput="try{Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.formationName=this.value;Dialog.list.createFormationTemplateDialog.functions.refresh()}catch(e){}"></td></tr><tr><td>車両番号の一般式</td><td><input id="cref-carnumber" onkeyup="if(event.keyCode==13){document.getElementById('cref-add-number-button').click()}"><button id="cref-add-number-button" onclick="Dialog.list.createFormationTemplateDialog.functions.addCarNumber()" class="lsf-icon" icon="add">追加</button></td></tr></table><div id="cref-new-formated-template-table" class="element-bottom-of-input-area"></div>`, [{ "content": "確定", "event": `Dialog.list.createFormationTemplateDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "クリア", "event": `Dialog.list.createFormationTemplateDialog.functions.clearInputs();Dialog.list.createFormationTemplateDialog.functions.refresh();`, "icon": "clear" }, { "content": "キャンセル", "event": `Dialog.list.createFormationTemplateDialog.off();`, "icon": "close" }], {
		tentativeFormationTemplate: new FormationTemplate(),
		tentativeFormationTemplateId: 0,
		isExisting: false,
		isCopyMode: false,
		editingCarIndex: -1,
		observer: new MutationObserver((mutations) => {
			document.getElementById("cref-carnumber").value = "";
			Dialog.list.createFormationTemplateDialog.functions.exitEditMode();
		}),
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
			Dialog.list.createFormationTemplateDialog.functions.refresh();
			Dialog.list.createFormationTemplateDialog.on();
		},
		//作成予定の編成テンプレートプレビューをリフレッシュ
		refresh: function () {
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
					table.addCell(`<span>${Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.carNumbers[i](1)}</span><p><a href="javascript:void(0)" onclick="Dialog.list.createFormationTemplateDialog.functions.enterEditMode(${i})" class="lsf preview-edit-button" title="編集">pen</a><a href="javascript:void(0)" onclick="Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.deleteCarNumber(${i});Dialog.list.createFormationTemplateDialog.functions.refresh()" class="lsf preview-delete-button" title="削除">delete</a></p>`, { "class": "preview-car" });
				}
				table.addBlankCellToRowIn(0, true);
			}
			document.getElementById("cref-new-formated-template-table").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#cref-new-formated-template-table td.preview-car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumberTo(Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawCarNumbers[dragResult.me], dragResult.to + dragResult.direction);
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.deleteCarNumber(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0));
					Dialog.list.createFormationTemplateDialog.functions.refresh();
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
		addCarNumber: function () {
			if (Dialog.list.createFormationTemplateDialog.functions.editingCarIndex >= 0) {
				try {
					//編集モードの場合
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumberTo(document.getElementById("cref-carnumber").value, Dialog.list.createFormationTemplateDialog.functions.editingCarIndex);
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.deleteCarNumber(Dialog.list.createFormationTemplateDialog.functions.editingCarIndex + 1);
					//編集モード解除
					document.getElementById("cref-carnumber").value = "";
					Dialog.list.createFormationTemplateDialog.functions.exitEditMode();
					Dialog.list.createFormationTemplateDialog.functions.refresh();
				} catch (e) {
					Dialog.list.alertDialog.functions.display(Message.list["MA012"]);
				}
			} else {
				//編集モードでない場合
				try {
					Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.addCarNumber(document.getElementById("cref-carnumber").value);
					Dialog.list.createFormationTemplateDialog.functions.refresh();
					document.getElementById("cref-carnumber").value = "";
				} catch (e) {
					Dialog.list.alertDialog.functions.display(Message.list["MA012"]);
				}
			}
			document.getElementById("cref-carnumber").focus();
		},
		//既存車番編集モードに入る
		enterEditMode: function (carIndex) {
			let tds = document.querySelectorAll("#cref-new-formated-template-table td.preview-car");
			tds.forEach((td, i) => {
				if (i == carIndex) {
					td.classList.add('editing');
				} else {
					td.classList.remove('editing');
				}
			});
			Dialog.list.createFormationTemplateDialog.functions.editingCarIndex = carIndex;
			document.getElementById("cref-carnumber").value = Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate.rawCarNumbers[Dialog.list.createFormationTemplateDialog.functions.editingCarIndex];
			document.getElementById("cref-add-number-button").innerHTML = "更新";
			document.getElementById("cref-add-number-button").setAttribute("icon", "pen");

			//テーブルの状態を監視し、変化があれば編集モードを解除する
			Dialog.list.createFormationTemplateDialog.functions.observer.observe(document.querySelector("#cref-new-formated-template-table"), { childList: true, subtree: true });
		},
		//既存車番編集モード解除
		exitEditMode: function () {
			Dialog.list.createFormationTemplateDialog.functions.observer.disconnect();
			document.getElementById("cref-add-number-button").innerHTML = "追加";
			document.getElementById("cref-add-number-button").setAttribute("icon", "add");
			Dialog.list.createFormationTemplateDialog.functions.editingCarIndex = -1;
		},
		resetDialog: function () {
			Dialog.list.createFormationTemplateDialog.functions.clearInputs();
			Dialog.list.createFormationTemplateDialog.dialogTitle.innerHTML = "";
			Dialog.list.createFormationTemplateDialog.buttons.querySelector("button").innerHTML = "確定";
			Dialog.list.createFormationTemplateDialog.functions.isExisting = false;
			Dialog.list.createFormationTemplateDialog.functions.isCopyMode = false;
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplateId = 0;
			Dialog.list.createFormationTemplateDialog.functions.editingCarIndex = -1;
		},
		clearInputs: function () {
			Dialog.list.createFormationTemplateDialog.functions.tentativeFormationTemplate = new FormationTemplate();
			document.getElementById("cref-name").value = "";
			document.getElementById("cref-carnumber").value = "";
			document.getElementById("cref-formationnumber").value = "";
		}
	});

	//形式を作成･編集:crsr
	new Dialog("createSeriesDialog", "形式の作成･編集", `<table class="input-area"><tr><td>形式名</td><td><input id="crsr-series-name"></td></tr><tr><td>説明</td><td><textarea id="crsr-series-description"></textarea></td></tr><tr><td>編成を表示する</td><td><label for="crsr-series-ishidden" class="mku-checkbox-container"><input id="crsr-series-ishidden" type="checkbox" checked></label></td></tr></table>`, [{ "content": "確定", "event": `Dialog.list.createSeriesDialog.functions.createFormationTemplate()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createSeriesDialog.off();`, "icon": "close" }], {
		tentativeSeries: null,
		display: function (x) {
			Dialog.list.createSeriesDialog.functions.clearInputs();
			if (x != undefined) {
				//既存形式
				Dialog.list.createSeriesDialog.dialogTitle.innerHTML = "形式の編集";
				Dialog.list.createSeriesDialog.functions.tentativeSeries = AllSerieses.seriesesList[x];
				document.getElementById("crsr-series-name").value = Dialog.list.createSeriesDialog.functions.tentativeSeries.name;
				let description = Dialog.list.createSeriesDialog.functions.tentativeSeries.description;
				document.getElementById("crsr-series-description").value = description == "　" ? "" : description;
				document.getElementById("crsr-series-ishidden").checked = !Dialog.list.createSeriesDialog.functions.tentativeSeries.isHidden;
			} else {
				//新規形式
				Dialog.list.createSeriesDialog.dialogTitle.innerHTML = "形式の作成";
				Dialog.list.createSeriesDialog.functions.tentativeSeries = null;
			}
			Dialog.list.createSeriesDialog.on();
			document.getElementById("crsr-series-name").focus();
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
	new Dialog("createCarDialog", "車両作成", `<table class="input-area"><tr><td>車両番号</td><td><input id="crcar-carNumber"></td></tr><tr><td>備考</td><td><textarea id="crcar-carRemark"></textarea></td></tr></table><p class="element-bottom-of-input-area"><label for="crcar-continue" class="mku-checkbox-container small"><input id="crcar-continue" type="checkbox"></label><label for="crcar-continue">連続で作成</label></p>`, [{ "content": "作成", "event": `Dialog.list.createCarDialog.functions.createCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createCarDialog.off();`, "icon": "close" }], {
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
				const carNumber = document.getElementById("crcar-carNumber").value;
				if (carNumber == "") {
					Dialog.list.alertDialog.functions.display(Message.list["MA007"]);
				} else if (carNumber.startsWith("nextNumber(") && carNumber.endsWith(")")) {
					Dialog.list.createCarDialog.functions.addCarExecute((new Function(`return ${carNumber}`))());
				} else {
					Dialog.list.createCarDialog.functions.addCarExecute(carNumber);
				}
			}
		},
		addCarExecute: function (carNumber) {
			let carId = AllCars.addCar(new Car(carNumber, now, null, document.getElementById("crcar-carRemark").value));
			if (!document.getElementById("crcar-continue").checked) {
				Dialog.list.createCarDialog.off();
				Dialog.list.carDetealDialog.functions.display(carId);
			} else {
				Dialog.list.createCarDialog.functions.display();
			}
		}
	});
	document.getElementById("crcar-carNumber").addEventListener("keypress", (e) => {
		if (e.key == "Enter") {
			Dialog.list.createCarDialog.functions.createCar();
		}
	});

	//車両の詳細:cardt
	new Dialog("carDetealDialog", "車両の詳細", `<div id="cardt-main"></div>`, [{ "content": "廃車", "event": `dropCar()`, "icon": "delete", "id": "cardt-drop-button" }, { "content": "閉じる", "event": `Dialog.list.carDetealDialog.off();`, "icon": "close" }], {
		//車両の詳細ダイアログを表示
		display: function (x) {
			let table = new Table();
			let car = AllCars.carsList[x];
			table.setSubtitle(`<p class="car-name"><b><span id="cardt-car-number">${car.numberInTime(now)}</span>号車</b><button class="lsf-icon" icon="pen" onclick="Dialog.list.carRenumberDialog.functions.display()">改番</button><span class="car-status lsf-icon ${car.isActive ? "" : "dropped"}">${car.isActive ? "現役" : `${car.droppedOn.toString()}廃車`}</span>${car.isConserved ? `<span class="car-status conserved">保存車</span></p>` : ""}`);
			table.setAttributes({ "class": "horizontal-stripes" });
			//所属編成を探す
			let formation = AllFormations.searchByCarId(x, now);
			//所属編成歴
			let formations = AllFormations.searchAllByCarId(x);
			let formationsText = formations.length == 0 ? `編成に所属したことがありません` : `<ul>`;
			let terminatedOnBefore = car.manufacturedOn;
			for (let i in formations) {
				if (terminatedOnBefore.serial != AllFormations.formationsList[formations[i]].formatedOn.serial) {
					formationsText += `<li>無所属<small> (${terminatedOnBefore.toStringWithLink()}～${AllFormations.formationsList[formations[i]].formatedOn.toStringWithLink()})</small></li>`;
				}
				formationsText += `<li><a href="javascript:Dialog.list.formationDetealDialog.functions.display(${formations[i]})">${AllFormations.formationsList[formations[i]].name}</a><small> (${AllFormations.formationsList[formations[i]].formatedOn.toStringWithLink()}～${AllFormations.formationsList[formations[i]].isTerminated ? AllFormations.formationsList[formations[i]].terminatedOn.toStringWithLink() : ""})</small></li>`;
				terminatedOnBefore = AllFormations.formationsList[formations[i]].terminatedOn;
			}
			if (formations.length > 0 && AllFormations.formationsList[formations.at(-1)].isTerminated) {
				formationsText += `<li>無所属<small> (${terminatedOnBefore.toStringWithLink()}～)</small></li>`;
			}
			formationsText = `<ul>${formationsText}</ul>`;
			//車歴
			let oldNumbers = car.oldNumbers;
			let oldNumbersText = ``;
			for (let i in oldNumbers) {
				oldNumbersText += `<li>${oldNumbers[i].number} <small>(${i != 0 ? oldNumbers[i - 1].renumberedOn.toStringWithLink() : car.manufacturedOn.toStringWithLink()}～${oldNumbers[i].renumberedOn.toStringWithLink()})</small></li>`;
			}
			oldNumbersText = `<ul>${oldNumbersText}<li>${car.number} <small>(${oldNumbers.length > 0 ? `${oldNumbers.at(-1).renumberedOn.toStringWithLink()}` : `${car.manufacturedOn.toStringWithLink()}`}～${car.isDropped ? car.droppedOn.toStringWithLink() : ""})</small></li></ul>`;

			table.addRow();
			table.addCell("車両ID");
			table.addCell(x, { "id": "cardt-car-id" });
			table.addRow();
			table.addCell("製造年月");
			table.addCell(car.manufacturedOn.toStringWithLink());
			if (!car.isActive) {
				table.addRow();
				table.addCell("廃車年月");
				table.addCell(car.droppedOn.toStringWithLink());
				table.addRow();
				table.addCell(`保存`);
				table.addCell(`<label for="cardt-conserve" class="mku-checkbox-container small"><input id="cardt-conserve" type="checkbox"${car.isConserved ? " checked" : ""} onchange="Dialog.list.carDetealDialog.functions.conserve(AllCars.carsList[${x}],this.checked)"></label>`);
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
			table.addCell(`${car.remark == undefined || car.remark == "" ? "" : `<span>${car.remark}</span>`}<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('car',${x})">編集</button>`, { "class": "remark" });
			document.getElementById("cardt-main").innerHTML = table.generateTable();
			//要素の表示制御
			document.getElementById("cardt-drop-button").disabled = !car.isActive;
			Dialog.list.carDetealDialog.on();
		},
		conserve: function (car, isConserved) {
			if (isConserved) {
				car.conserve();
			} else {
				car.unconserve();
			}
			setTimeout(refresh, 100);
		}

	});

	//車両の改番:carrn
	new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `Dialog.list.carRenumberDialog.functions.renumberCar();refresh()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.carRenumberDialog.off();Dialog.list.carDetealDialog.functions.display(Dialog.list.carDetealDialog.functions.carId)`, "icon": "close" }], {
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
				Dialog.list.carDetealDialog.functions.display(Dialog.list.carDetealDialog.functions.carId);
			}
		}
	}, true);

	//備考編集:edrm
	new Dialog("editRemarkDialog", "備考の編集", `<table class="input-area"><tr><td id="edrm-title"></td><td><textarea id="edrm-remark"></textarea></td></tr></table>`, [{ "content": "決定", "event": `Dialog.list.editRemarkDialog.functions.setRemark()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.editRemarkDialog.off();`, "icon": "close" }], {
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
						Dialog.list.carDetealDialog.functions.display(Dialog.list.editRemarkDialog.functions.id);
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

	//備考一括編集:edmrm
	new Dialog("editMultipleRemarkDialog", "備考の一括編集", `<p><span id="edmrm-type"></span>に対して一括で備考の設定を行います。</p><table class="input-area"><tr><td id="edmrm-title">備考</td><td><textarea id="edmrm-remark"></textarea></td></tr></table>`, [{ "content": "上書き", "event": `Dialog.list.editMultipleRemarkDialog.functions.setRemark('overwrite')`, "icon": "pen" }, { "content": "追加", "event": `Dialog.list.editMultipleRemarkDialog.functions.setRemark('add')`, "icon": "add" }, { "content": "キャンセル", "event": `Dialog.list.editMultipleRemarkDialog.off();`, "icon": "close" }], {
		ids: 0,
		type: 0,
		//備考編集ダイアログを表示
		display: function (type, x) {
			Dialog.list.editMultipleRemarkDialog.functions.type = type;
			Dialog.list.editMultipleRemarkDialog.functions.ids = x;
			switch (Dialog.list.editMultipleRemarkDialog.functions.type) {
				case "car":
					document.getElementById("edmrm-type").innerHTML = `${Dialog.list.editMultipleRemarkDialog.functions.ids.length}件の車両`;
					break;
				case "formation":
					document.getElementById("edmrm-type").innerHTML = `${Dialog.list.editMultipleRemarkDialog.functions.ids.length}件の編成`;
					break;
			}
			Dialog.list.editMultipleRemarkDialog.on();
			document.getElementById("edmrm-remark").focus();
		},
		//備考編集
		setRemark: function (mode) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.editMultipleRemarkDialog.isActive) {
				switch (Dialog.list.editMultipleRemarkDialog.functions.type) {
					case "car":
						Dialog.list.editMultipleRemarkDialog.functions.ids.forEach((id) => {
							AllCars.carsList[id].remark = (mode != "overwrite" ? AllCars.carsList[id].remark : "") + document.getElementById("edmrm-remark").value;
						});
						break;
					case "formation":
						Dialog.list.editMultipleRemarkDialog.functions.ids.forEach((id) => {
							AllFormations.formationsList[id].remark = (mode != "overwrite" ? AllFormations.formationsList[id].remark : "") + document.getElementById("edmrm-remark").value;
						});
						break;
				}
			}
			switch (Dialog.list.editMultipleRemarkDialog.functions.type) {
				case "car":
					Dialog.list.manageAllCarsDialog.functions.createTable();
					break;
				case "formation":
					Dialog.list.manageAllFormationsDialog.functions.createTable();
					break;
			}
			Dialog.list.editMultipleRemarkDialog.functions.type = 0;
			Dialog.list.editMultipleRemarkDialog.functions.id = 0;
			document.getElementById("edmrm-remark").value = "";
			Dialog.list.editMultipleRemarkDialog.off();
		}
	}, true);

	//編成の詳細:fmdt
	new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div><div id="fmdt-remark">備考：<span id="fmdt-remark-remark"></span><span id="fmdt-remark-button"></span></div>`, [{ "content": "車両入替", "event": `Dialog.list.formationShuffleDialog.functions.display(Dialog.list.formationDetealDialog.functions.formationId)`, "icon": "shuffle" }, { "content": "編成解除", "event": `Dialog.list.formationDetealDialog.functions.releaseFormation()`, "icon": "clear", "id": "fmdt-release-button" }, { "content": "まとめて廃車", "event": `Dialog.list.formationDetealDialog.functions.releaseFormationAndDropAllCars()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.formationDetealDialog.off();`, "icon": "close" }], {
		formationId: 0,
		//編成の詳細ダイアログを表示
		display: function (x) {
			Dialog.list.formationDetealDialog.functions.formationId = x;
			let table = new Table();
			table.setAttributes({ "class": "formation-view" });
			let formation = AllFormations.formationsList[x];
			table.setSubtitle(`<p class="car-name"><b><span id="fmdt-formation-number">${formation.name}</span></b> (${AllSerieses.seriesesList[formation.seriesId].name}) (${formation.formatedOn.toStringWithLink()}～${formation.isTerminated ? `${formation.terminatedOn.toStringWithLink()}` : ``})<button class="lsf-icon" icon="pen" onclick="Dialog.list.formationRenameDialog.functions.display()">名称変更</button></p>`);
			table.addRow();
			table.addCell(`${formation.cars.length}両編成<small>(編成ID:${x})</small>`, { "colspan": formation.cars.length, "class": "formation-id" });
			table.addRow();
			for (let i in formation.cars) {
				table.addCell(Formatter.link(formation.cars[i], AllCars.carsList[formation.cars[i]].numberInTime(now)));
			}
			let html = table.generateTable();
			document.getElementById("fmdt-main").innerHTML = html;
			document.getElementById("fmdt-remark-remark").innerHTML = formation.remark == undefined ? "" : formation.remark;
			document.getElementById("fmdt-remark-button").innerHTML = `<button class="lsf-icon" icon="pen" onclick="Dialog.list.editRemarkDialog.functions.display('formation',${x})">編集</button>`;
			//要素の表示制御
			document.getElementById("fmdt-release-button").disabled = formation.isTerminated;
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
				let newFormationId = AllFormations.addFormation(new Formation(formation.seriesId, document.getElementById("fmrn-formation-name").value, formation.cars, formation.belongsTo, now, formation.remark))
				//元の編成が未来で解除されていた編成の場合、今作成した編成をその年月で編成解除
				if (isTerminated) {
					AllFormations.releaseFormation(newFormationId, terminatedOn);
				}
				Dialog.list.formationRenameDialog.off();
				Dialog.list.formationDetealDialog.functions.display(newFormationId);
			}
		}
	}, true);

	//編成内車両の入れ替え:fmsh
	new Dialog("formationShuffleDialog", "編成内車両の入れ替え", `<div id="fmsh-main"></div><hr style="margin: 2em auto;"><div id="fmsh-not-formated-cars-table"></div>`, [{ "content": "確定", "event": `Dialog.list.formationShuffleDialog.functions.shuffleFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationShuffleDialog.off();Dialog.list.formationDetealDialog.functions.display(Dialog.list.formationShuffleDialog.functions.formationId)`, "icon": "close" }], {
		formationId: 0,
		tentativeFormation: new Formation(),
		tentativeNotFormatedCarIds: [],
		display: function (x) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationDetealDialog.isActive) {
				Dialog.list.formationShuffleDialog.functions.formationId = x;
				let tmpFormation = AllFormations.formationsList[x];
				Dialog.list.formationShuffleDialog.functions.tentativeFormation = new Formation(tmpFormation.seriesId, tmpFormation.name, [...tmpFormation.cars], tmpFormation.belongsTo, now, tmpFormation.remark);
				Dialog.list.formationShuffleDialog.functions.tentativeNotFormatedCarIds = listUpNotFormatedCarIds();
				Dialog.list.formationShuffleDialog.functions.refresh();
				Dialog.list.formationShuffleDialog.on();
			}
		},
		refresh: function () {
			Dialog.list.formationShuffleDialog.functions.createTentativeFormationTable();
			Dialog.list.formationShuffleDialog.functions.createNotFormatedCarsTable();
		},
		createTentativeFormationTable: function () {
			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
			table.setSubtitle("ドラッグで車両順序を変更");
			let maxCellCount = 10;
			for (let id of Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<span>${AllCars.carsList[id].numberInTime(now)}</span><p><a href="javascript:void(0)" onclick="Dialog.list.formationShuffleDialog.functions.removeCar(${id})" class="lsf preview-delete-button" title="削除">delete</a></p>`, { "class": "car preview-car", "id": `fmsh-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.getElementById("fmsh-main").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#fmsh-main td.car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.splice(dragResult.to + dragResult.direction, 0, Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars[dragResult.me]);
					Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.splice(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0), 1);
					Dialog.list.formationShuffleDialog.functions.refresh();
				}
			});
		},
		createNotFormatedCarsTable: function () {
			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
			table.setSubtitle("編成に所属していない車両一覧");
			let maxCellCount = 10;
			let carIds = Dialog.list.formationShuffleDialog.functions.tentativeNotFormatedCarIds;
			for (let id of carIds) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<a href="javascript:void(0)" onclick="if(Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.indexOf(${id})==-1){Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars.push(${id});Dialog.list.formationShuffleDialog.functions.tentativeNotFormatedCarIds.splice(Dialog.list.formationShuffleDialog.functions.tentativeNotFormatedCarIds.indexOf(${id}),1)}Dialog.list.formationShuffleDialog.functions.refresh()">${AllCars.carsList[id].number}</a>`, { "class": "car", "id": `fmsh-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.getElementById("fmsh-not-formated-cars-table").innerHTML = table.generateTable();
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
				Dialog.list.formationDetealDialog.functions.display(newFormationId);
			}
		},
		removeCar: function (carId) {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationShuffleDialog.isActive) {
				let cars = Dialog.list.formationShuffleDialog.functions.tentativeFormation.cars;
				if (cars.includes(carId)) {
					cars.splice(cars.indexOf(carId), 1);
					Dialog.list.formationShuffleDialog.functions.tentativeNotFormatedCarIds.push(carId);
					Dialog.list.formationShuffleDialog.functions.refresh();
				}
			}
		}
	}, true);

	//以下、設定系

	//全般設定:gnst
	new Dialog("generalSettingDialog", "全般設定", `<div class="mku-tab-container" id="setting-tab">
		<div class="mku-tab-content" tab-title="年月上下限">
			<table class="input-area">
				<tr>
					<td>年月下限</td>
					<td><span class="time-inputs"><input id="gnst-min-y" class="yearmonth-y" type="number">年<input id="gnst-min-m" class="yearmonth-m" type="number">月</span></td>
				</tr>
				<tr>
					<td>年月上限</td>
					<td><span class="time-inputs"><input id="gnst-max-y" class="yearmonth-y" type="number">年<input id="gnst-max-m" class="yearmonth-m" type="number">月</span></td>
				</tr>
			</table>
		</div>
		<div class="mku-tab-content" tab-title="自動セーブ">
			<table class="input-area">
				<tr>
					<td>自動セーブ実施</td>
					<td><label for="gnst-autosave-enabled" class="mku-checkbox-container"><input id="gnst-autosave-enabled" type="checkbox"></label></td>
				</tr>
				<tr>
					<td>実施間隔</td>
					<td><input type="number" id="gnst-autosave-interval" min="1"><p style="margin-bottom:0;">※アプリが重い場合などこの数値を上げてください</p></td>
				</tr>
			</table>
		</div>
		<div class="mku-tab-content" tab-title="色テーマ">
			<div class="color-container">
				<div id="gnst-color0" class="color-preview"></div>
				<div id="gnst-color1" class="color-preview"></div>
				<div id="gnst-color2" class="color-preview"></div>
				<div id="gnst-color3" class="color-preview"></div>
				<div id="gnst-color4" class="color-preview"></div>
				<div id="gnst-color5" class="color-preview"></div>
				<div id="gnst-color6" class="color-preview"></div>
			</div>
			<input type="color" id="gnst-colorpicker" oninput="Dialog.list.generalSettingDialog.functions.changeColor()" value="#5c3d7e"><button onclick="document.getElementById('gnst-colorpicker').value='#5c3d7e';Dialog.list.generalSettingDialog.functions.changeColor()">リセット</button>
		</div>
		<div class="mku-tab-content" tab-title="高度な設定">
			<table class="input-area">
				<tr>
					<td>記号</td>
					<td><input placeholder="正規表現" id="gnst-car-sym-pattern"><p style="margin-bottom:0;">※この正規表現に合致する文字は編成表上で小さく表示されます</p></td>
				</tr>
				<tr>
					<td>重複チェック対象</td>
					<td><input placeholder="正規表現" id="gnst-car-num-pattern"><p style="margin-bottom:0;">※この正規表現に合致する文字を車両番号とみなし、重複チェックを実施します</p></td>
				</tr>
			</table>
		</div>
	</div>`, [{ "content": "適用", "event": `Dialog.list.generalSettingDialog.functions.apply();`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.generalSettingDialog.off(); `, "icon": "close" }], {
		cssProperties: {
			"--formation-table-main-border": "#5c3d7e",
			"--sub-light-color": "#dcccee",
			"--button-face": "#4c2d5e",
			"--button-face-hover": "#8c6eae",
			"--button-face-active": "#6c4e86",
			"--table-alternate-color-1": "#fdfbff",
			"--table-alternate-color-2": "#f7f0ff",
		},
		display: function () {
			//初期値投入
			document.getElementById("gnst-max-y").value = maxYearMonth.year;
			document.getElementById("gnst-max-m").value = maxYearMonth.month;
			document.getElementById("gnst-min-y").value = minYearMonth.year;
			document.getElementById("gnst-min-m").value = minYearMonth.month;

			document.getElementById("gnst-autosave-enabled").checked = settings.isAutoSaveEnabled;
			document.getElementById("gnst-autosave-interval").value = settings.autoSaveInterval;

			document.getElementById("gnst-car-sym-pattern").value = settings.carSymPattern;
			document.getElementById("gnst-car-num-pattern").value = settings.carNumPattern;

			Dialog.list.generalSettingDialog.functions.changeColor();

			Dialog.list.generalSettingDialog.on();
		},
		//年月上下限設定適用
		updateYearMonthLimitation: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			minYearMonth.update(Number(document.getElementById("gnst-min-y").value), Number(document.getElementById("gnst-min-m").value));
			maxYearMonth.update(Number(document.getElementById("gnst-max-y").value), Number(document.getElementById("gnst-max-m").value));
			setInputMaxAndMin();
		},
		//自動セーブ設定適用
		updateAutosave: function () {
			settings.isAutoSaveEnabled = document.getElementById("gnst-autosave-enabled").checked;
			let interval = Number(document.getElementById("gnst-autosave-interval").value);
			if (interval > 0) {
				settings.autoSaveInterval = interval;
			}
		},
		//色
		changeColor: function () {
			let cssProperties = Dialog.list.generalSettingDialog.functions.cssProperties;
			const color = new Color(document.getElementById("gnst-colorpicker").value);
			const colorPreviews = document.querySelectorAll(".color-preview");
			const root = document.querySelector(":root");
			let i = 0;
			for (let cssPropertyName in cssProperties) {
				const convertedColor = Color.convertColorHSL(color, new Color(cssProperties["--formation-table-main-border"]), new Color(cssProperties[cssPropertyName]));
				colorPreviews[i].style.backgroundColor = convertedColor;
				//root.style.setProperty(cssPropertyName, convertedColor);
				i++;
			}
		},
		//高度設定適用
		updateAdvancedSettings: function () {
			const carSymPattern = document.getElementById("gnst-car-sym-pattern").value;
			const carNumPattern = document.getElementById("gnst-car-num-pattern").value;
			try {
				new RegExp(carSymPattern);
				new RegExp(carNumPattern);
			} catch (e) {
				return false;
			}
			settings.carSymPattern = carSymPattern;
			settings.carNumPattern = carNumPattern;
			return true;
		},
		//適用
		apply: function () {
			if (Dialog.list.generalSettingDialog.functions.updateAdvancedSettings()) {
				Dialog.list.generalSettingDialog.functions.updateYearMonthLimitation();
				Dialog.list.generalSettingDialog.functions.updateAutosave();
				autoSave(true);
				refresh();
				Dialog.list.generalSettingDialog.off();
			} else {
				Dialog.list.alertDialog.functions.display(Message.list["MA013"]);
			}
		},
	}, true);

	//編成表マスタ管理:mnfd
	new Dialog("formationDataManagementDialog", "編成表マスタ管理", `<ul class="dialog-buttons-list">
			<li><button onclick="Dialog.list.manageAllFormationsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="list">全編成マスタデータ管理</button></li>
			<li><button onclick="Dialog.list.manageAllCarsDialog.functions.display()" class="lsf-icon dialog-main-button" icon="list">全車両マスタデータ管理</button></li>
			<li><button onclick="Dialog.list.editJSONDialog.functions.display()" class="lsf-icon dialog-main-button" icon="pen">JSON直接編集</button></li>
		</ul>`, [{ "content": "リセット", "event": `Dialog.list.formationDataManagementDialog.functions.clear();`, "icon": "clear" }, { "content": "終了", "event": `Dialog.list.formationDataManagementDialog.off();`, "icon": "close" }], {
		clear: function () {
			Dialog.list.confirmDialog.functions.display(Message.list["MC009"], () => {
				resetAllLists();
				Dialog.list.formationDataManagementDialog.off();
				refresh();
			});
		}
	});

	let loader = `<div id="loaderparent"><div class="loader">loading...</div></div>`;

	//全車両管理:mnalc
	new Dialog("manageAllCarsDialog", "全車両マスタデータ管理", `<p class="management-dialog-searchbox-container">
			<span><input placeholder="車両番号" id="mnalc-search-keyword" onkeypress="if(event.keyCode==13){document.getElementById('mnalc-search-button').click();}"><button class="lsf-icon" icon="search" onclick="Dialog.list.manageAllCarsDialog.functions.searchQuery=document.getElementById('mnalc-search-keyword').value;Dialog.list.manageAllCarsDialog.functions.createTable()" id="mnalc-search-button">検索</button></span><span><label class="button lsf-icon mku-balloon" mku-balloon-message="製造と同時に廃車されているなど、削除しても問題のない車両のみを抽出して表示します。" icon="eye"><input type="checkbox" id="mnalc-only-useless" onchange="Dialog.list.manageAllCarsDialog.functions.createTable()">無用車両のみ表示</label></span>
		</p>
		<p id="mnalc-search-status">読込中...</p>
		<div id="mnalc-table"></div>`, [{ "content": "備考一括編集", "event": `Dialog.list.editMultipleRemarkDialog.functions.display('car',Array.from(document.querySelectorAll('.mnalc-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('car-id')}));`, "icon": "pen", "disabled": "disabled", "id": "mnalc-remarkall" }, { "content": "一括削除", "event": `Dialog.list.manageAllCarsDialog.functions.deleteCars(Array.from(document.querySelectorAll('.mnalc-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('car-id')}));`, "icon": "delete", "disabled": "disabled", "id": "mnalc-deleteall" }, { "content": "終了", "event": `Dialog.list.manageAllCarsDialog.off();`, "icon": "close" }], {
		scrollTop: 0,
		display: function () {
			document.getElementById('mnalc-search-keyword').value = Dialog.list.manageAllCarsDialog.functions.searchQuery;
			document.getElementById("mnalc-search-status").innerHTML = "読込中...";
			document.getElementById("mnalc-table").innerHTML = loader;
			Dialog.list.manageAllCarsDialog.on();
			Dialog.list.manageAllCarsDialog.functions.createTable();
		},
		createTable: function () {
			document.getElementById("mnalc-table").innerHTML = loader;
			setTimeout(() => {
				let table = new Table();
				table.setAttributes({ "class": "row-hover-hilight management-dialog-objects-list horizontal-stripes" });
				table.addRow();
				table.addCell("<input type='checkbox'>");
				table.addCell("車両ID");
				table.addCell("車両番号(最新)");
				table.addCell("製造");
				table.addCell("廃車");
				table.addCell("保存");
				table.addCell("備考");
				table.addCell("操作");
				AllCars.carsList.forEach((car, carId) => {
					if (Dialog.list.manageAllCarsDialog.functions.isFiltered(car)) {
						table.addRow();
						table.addCell(`<input type='checkbox' class='mnalc-raw-select' car-id='${carId}'>`);
						table.addCell(carId);
						table.addCell(car.number);
						table.addCell(car.manufacturedOn);
						table.addCell(!car.isActive ? car.droppedOn : "-");
						table.addCell(car.isConserved ? "保存" : "-");
						table.addCell(...formatRemark(car.remark));
						table.addCell(`<button class="lsf-icon" icon="search" onclick="Dialog.list.carDetealDialog.functions.display(${carId});">詳細</button><button class="lsf-icon" icon="pen" onclick="Dialog.list.editCarMasterDialog.functions.display(${carId})">編集</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.manageAllCarsDialog.functions.deleteCars([${carId}])">削除</button>`);
					}
				});
				document.getElementById("mnalc-table").innerHTML = table.generateTable();
				setTableCheckboxEvents(document.getElementById("mnalc-table"), [document.getElementById("mnalc-deleteall"), document.getElementById("mnalc-remarkall")]);
				TableSort.addSortButtonToTable(document.getElementById("mnalc-table"));
				document.getElementById("mnalc-search-status").innerHTML = `${(Dialog.list.manageAllCarsDialog.functions.searchQuery == "" ? "全" : `車両番号に<b>"${Dialog.list.manageAllCarsDialog.functions.searchQuery}"</b>を含む`)}${document.getElementById("mnalc-only-useless").checked ? `無用` : ``}車両を表示中 (全${table.rows.length - 1}件)${(Dialog.list.manageAllCarsDialog.functions.searchQuery != "" ? `<button class="lsf-icon" icon="delete" style="margin-left:0.5em;" onclick="document.getElementById('mnalc-search-keyword').value='';document.getElementById('mnalc-search-button').click();">検索クエリを削除</button>` : "")}`;
				let tableContainer = document.getElementById("mnalc-table").querySelector(".generated-table-container");
				tableContainer.addEventListener("scroll", () => {
					Dialog.list.manageAllCarsDialog.functions.scrollTop = tableContainer.scrollTop;
				});
				setTimeout(() => { tableContainer.scrollTop = Dialog.list.manageAllCarsDialog.functions.scrollTop; }, 0);
			}, 0);
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
		searchQuery: "",
		isFiltered: function (car) {
			let isShowingUselessCar = document.getElementById("mnalc-only-useless").checked;
			if ((isShowingUselessCar && !(car.isDropped && car.droppedOn.serial == car.manufacturedOn.serial)) || (Dialog.list.manageAllCarsDialog.functions.searchQuery != "" && car.number.search(new RegExp(Dialog.list.manageAllCarsDialog.functions.searchQuery)) == -1)) {
				return false;
			} else {
				return true;
			}
		}
	});

	//全編成管理:mnalf
	new Dialog("manageAllFormationsDialog", "全編成マスタデータ管理", `<p class="management-dialog-searchbox-container">
					<span><input placeholder="編成番号" id="mnalf-search-keyword" onkeypress="if(event.keyCode==13){document.getElementById('mnalf-search-button').click();}"><button class="lsf-icon" icon="search" onclick="Dialog.list.manageAllFormationsDialog.functions.searchQuery=document.getElementById('mnalf-search-keyword').value;Dialog.list.manageAllFormationsDialog.functions.createTable()" id="mnalf-search-button">検索</button></span><span><label class="button lsf-icon mku-balloon" mku-balloon-message="組成と同時に解除されているなど、削除しても問題のない編成のみを抽出して表示します。" icon="eye"><input type="checkbox" id="mnalf-only-useless" onchange="Dialog.list.manageAllFormationsDialog.functions.createTable()">無用編成のみ表示</label></span>
				</p>
				<p id="mnalf-search-status">読込中...</p>
				<div id="mnalf-table"></div>`, [{ "content": "備考一括編集", "event": `Dialog.list.editMultipleRemarkDialog.functions.display('formation',Array.from(document.querySelectorAll('.mnalf-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('formation-id')}));`, "icon": "pen", "disabled": "disabled", "id": "mnalf-remarkall" }, { "content": "一括削除", "event": `Dialog.list.manageAllFormationsDialog.functions.deleteFormations(Array.from(document.querySelectorAll('.mnalf-raw-select')).filter((checkbox)=>{return checkbox.checked}).map((checkbox)=>{return checkbox.getAttribute('formation-id')}));`, "icon": "delete", "disabled": "disabled", "id": "mnalf-deleteall" }, { "content": "終了", "event": `Dialog.list.manageAllFormationsDialog.off();`, "icon": "close" }], {
		scrollTop: 0,
		display: function () {
			document.getElementById('mnalf-search-keyword').value = Dialog.list.manageAllFormationsDialog.functions.searchQuery;
			document.getElementById("mnalf-search-status").innerHTML = "読込中...";
			document.getElementById("mnalf-table").innerHTML = loader;
			Dialog.list.manageAllFormationsDialog.on();
			Dialog.list.manageAllFormationsDialog.functions.createTable();
		},
		createTable: function () {
			document.getElementById("mnalf-table").innerHTML = loader;
			setTimeout(() => {
				let table = new Table();
				table.setAttributes({ "class": "row-hover-hilight management-dialog-objects-list horizontal-stripes" });
				table.addRow();
				table.addCell("<input type='checkbox'>");
				table.addCell("編成ID");
				table.addCell("形式");
				table.addCell("編成番号");
				table.addCell("車両数");
				table.addCell("組成年月");
				table.addCell("解除年月");
				table.addCell("備考");
				table.addCell("操作");
				AllFormations.formationsList.forEach((formation, formationId) => {
					if (Dialog.list.manageAllFormationsDialog.functions.isFiltered(formation)) {
						table.addRow();
						table.addCell(`<input type='checkbox' class='mnalf-raw-select' formation-id='${formationId}'>`);
						table.addCell(formationId);
						table.addCell(AllSerieses.seriesesList[formation.seriesId].name);
						table.addCell(formation.name);
						table.addCell(formation.cars.length);
						table.addCell(formation.formatedOn);
						table.addCell(formation.isTerminated ? formation.terminatedOn : "-");
						table.addCell(...formatRemark(formation.remark));
						table.addCell(`<button class="lsf-icon" icon="search" onclick="Dialog.list.formationDetealDialog.functions.display(${formationId});">詳細</button><button class="lsf-icon" icon="pen" onclick="Dialog.list.editFormationMasterDialog.functions.display(${formationId})">編集</button><button class="lsf-icon" icon="delete" onclick="Dialog.list.manageAllFormationsDialog.functions.deleteFormations([${formationId}])">削除</button>`);
					}
				})
				document.getElementById("mnalf-table").innerHTML = table.generateTable();
				setTableCheckboxEvents(document.getElementById("mnalf-table"), [document.getElementById("mnalf-deleteall"), document.getElementById("mnalf-remarkall")]);
				TableSort.addSortButtonToTable(document.getElementById("mnalf-table"));
				document.getElementById("mnalf-search-status").innerHTML = `${(Dialog.list.manageAllFormationsDialog.functions.searchQuery == "" ? "全" : `編成番号に<b>"${Dialog.list.manageAllFormationsDialog.functions.searchQuery}"</b>を含む`)}${document.getElementById("mnalf-only-useless").checked ? `無用` : ``}編成を表示中 (全${table.rows.length - 1}件)${(Dialog.list.manageAllFormationsDialog.functions.searchQuery != "" ? `<button class="lsf-icon" icon="delete" style="margin-left:0.5em;" onclick="document.getElementById('mnalf-search-keyword').value='';document.getElementById('mnalf-search-button').click();">検索クエリを削除</button>` : "")}`;
				let tableContainer = document.getElementById("mnalf-table").querySelector(".generated-table-container");
				tableContainer.addEventListener("scroll", () => {
					Dialog.list.manageAllFormationsDialog.functions.scrollTop = tableContainer.scrollTop;
				});
				setTimeout(() => { tableContainer.scrollTop = Dialog.list.manageAllFormationsDialog.functions.scrollTop; }, 0);
			}, 0);
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
		searchQuery: "",
		isFiltered: function (formation) {
			let isShowingUselessCar = document.getElementById("mnalf-only-useless").checked;
			if ((isShowingUselessCar && (!(formation.isTerminated && formation.terminatedOn.serial == formation.formatedOn.serial) && !(formation.cars.length == 0))) || (Dialog.list.manageAllFormationsDialog.functions.searchQuery != "" && formation.name.search(new RegExp(Dialog.list.manageAllFormationsDialog.functions.searchQuery)) == -1)) {
				return false;
			} else {
				return true;
			}
		}
	});

	function formatRemark(remark) {
		if (remark == "" || remark == undefined) {
			return ["-"];
		} else {
			const maxChar = 3;
			let result = [remark.substr(0, maxChar)];
			if (remark.length > maxChar) {
				result[0] += "…"
				result.push({ "class": "mku-balloon", "mku-balloon-message": remark })
			}
			return result;
		}
	}

	//表+チェックボックスで行選択
	function setTableCheckboxEvents(tableContainer, buttons) {
		//全件選択チェックボックス
		let selectAllCheckBox = tableContainer.querySelector("tr td input[type='checkbox']");
		//各行のチェックボックス
		let checkboxes = tableContainer.querySelectorAll("tr:not(:nth-child(1)) td input[type='checkbox']");
		//最後にチェックした行
		let lastCheckedRow = -1;
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
			buttons.forEach((button) => {
				button.disabled = !checkedAtLeastOnce;
			});
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
				lastCheckedRow = findElementIndex(tableContainer.querySelectorAll("tr:not(:nth-child(1)) td input[type='checkbox']"), checkBox);
				switchElementsByCheckedStatus();
			});
		});

		//各行をクリックでチェックボックスをチェック
		tableContainer.querySelectorAll("tr:not(:nth-child(1)) td:not(:first-child):not(:last-child)").forEach((td) => {
			td.addEventListener("click", (e) => {
				if (e.shiftKey && lastCheckedRow != -1) {
					window.getSelection().removeAllRanges();
					let checkboxes = tableContainer.querySelectorAll("tr:not(:nth-child(1)) td input[type='checkbox']");
					let thisCheckBoxIndex = findElementIndex(checkboxes, td.parentNode.querySelector("input[type='checkbox']"));
					let start = Math.min(lastCheckedRow, thisCheckBoxIndex);
					let end = Math.max(lastCheckedRow, thisCheckBoxIndex);
					let direction = checkboxes[lastCheckedRow].checked;
					checkboxes[lastCheckedRow].click();
					for (let i = start; i <= end; i++) {
						if (checkboxes[i].checked != direction) {
							checkboxes[i].click();
						}
					}
				} else {
					td.parentNode.querySelector("input[type='checkbox']").click();
				}
				window.getSelection().removeAllRanges();
			});
		});

		let findElementIndex = (from, target) => {
			return [].slice.call(from).indexOf(target);
		};
		switchElementsByCheckedStatus();
	}

	//車両マスタデータ編集:edmsc
	new Dialog("editCarMasterDialog", "車両マスタデータ編集", `
						<table class="input-area">
							<tr><td>車両ID</td><td id="edmsc-car-id"></td></tr>
							<tr><td>車両番号</td><td><input id="edmsc-car-number"></td></tr>
							<tr><td>製造</td><td><span class="time-inputs"><input id="edmsc-manufactured-y" class="yearmonth-y" type="number">年<input id="edmsc-manufactured-m" class="yearmonth-m" type="number">月</span></td></tr>
								<tr><td>廃車</td><td><span class="time-inputs"><input id="edmsc-dropped-y" class="yearmonth-y" type="number">年<input id="edmsc-dropped-m" class="yearmonth-m" type="number">月</span><label for="edmsc-car-isdropped" class="mku-checkbox-container inline"><input id="edmsc-car-isdropped" type="checkbox"></label></td></tr>
									<tr><td>保存</td><td><label for="edmsc-car-isconserved" class="mku-checkbox-container inline"><input id="edmsc-car-isconserved" type="checkbox" disabled></label></td></tr>
									<tr><td>備考</td><td><textarea id="edmsc-car-remark"></textarea></td></tr>
									<tr><td>旧車番</td><td>
										<table class="input-area">
											<tr><td>対象</td><td><select id="edmsc-oldcar-indexes" onchange="Dialog.list.editCarMasterDialog.functions.updateOldNumbersSelectBox(Number(this.value))"></select></td></tr>
											<tr><td>番号</td><td><input id="edmsc-oldcar-number" oninput="Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers[Number(document.getElementById('edmsc-oldcar-indexes').value)].number=this.value"></td></tr>
											<tr><td>改番年月</td><td><span class="time-inputs"><input id="edmsc-oldnumber-renumbered-y" class="yearmonth-y" type="number" oninput="Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers[Number(document.getElementById('edmsc-oldcar-indexes').value)].year=Number(this.value);">年<input id="edmsc-oldnumber-renumbered-m" class="yearmonth-m" type="number" oninput="Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers[Number(document.getElementById('edmsc-oldcar-indexes').value)].month=Number(this.value);">月</span></td></tr>
											</table>
											</td></tr>
									</table>
										<p class="element-bottom-of-input-area"><label for="edmsc-open-deteal-after-end" class="mku-checkbox-container small"><input id="edmsc-open-deteal-after-end" type="checkbox"></label><label for="edmsc-open-deteal-after-end">操作終了後車両詳細ウインドウを開く</label></p>
										`, [{ "content": "詳細ウインドウ", "event": `Dialog.list.carDetealDialog.functions.display(Dialog.list.editCarMasterDialog.functions.carId)`, "icon": "search" }, { "content": "保存", "event": `Dialog.list.editCarMasterDialog.functions.save()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.editCarMasterDialog.functions.finish();`, "icon": "close" }], {
		carId: 0,
		display: function (x) {
			Dialog.list.editCarMasterDialog.functions.clearInputs();
			Dialog.list.editCarMasterDialog.functions.carId = x;
			let car = AllCars.carsList[x];
			document.getElementById("edmsc-car-id").innerHTML = x;
			document.getElementById("edmsc-car-number").value = car.number;
			document.getElementById("edmsc-manufactured-y").value = car.manufacturedOn.year;
			document.getElementById("edmsc-manufactured-m").value = car.manufacturedOn.month;
			document.getElementById("edmsc-car-isdropped").checked = !car.isActive;
			document.getElementById("edmsc-car-isconserved").checked = car.isConserved;
			document.getElementById("edmsc-car-remark").value = car.remark;
			Dialog.list.editCarMasterDialog.functions.updateIsDroppedToggle();
			if (!car.isActive) {
				document.getElementById("edmsc-dropped-y").value = car.droppedOn.year;
				document.getElementById("edmsc-dropped-m").value = car.droppedOn.month;
			} else {
				document.getElementById("edmsc-dropped-y").value = "";
				document.getElementById("edmsc-dropped-m").value = "";
			}
			let oldNumbersSelectBox = document.getElementById("edmsc-oldcar-indexes");
			Dialog.list.editCarMasterDialog.functions.oldNumbers = car.oldNumbers;
			for (let i in car.oldNumbers) {
				let option = document.createElement("option");
				option.value = i;
				option.innerHTML = car.oldNumbers[i].number;
				oldNumbersSelectBox.appendChild(option);
				Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers.push({ "number": car.oldNumbers[i].number, "year": car.oldNumbers[i].renumberedOn.year, "month": car.oldNumbers[i].renumberedOn.month });
			}
			if (car.oldNumbers.length > 0) {
				Dialog.list.editCarMasterDialog.functions.updateOldNumbersSelectBox(Number(oldNumbersSelectBox.value));
				oldNumbersSelectBox.disabled = false;
				document.getElementById("edmsc-oldcar-number").disabled = false;
				document.getElementById("edmsc-oldnumber-renumbered-y").disabled = false;
				document.getElementById("edmsc-oldnumber-renumbered-m").disabled = false;
			} else {
				oldNumbersSelectBox.disabled = true;
				document.getElementById("edmsc-oldcar-number").disabled = true;
				document.getElementById("edmsc-oldnumber-renumbered-y").disabled = true;
				document.getElementById("edmsc-oldnumber-renumbered-m").disabled = true;
			}
			Dialog.list.editCarMasterDialog.on();
		},
		clearInputs: function () {
			document.getElementById("edmsc-oldcar-indexes").innerHTML = "";
			Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers = [];
		},
		updateIsDroppedToggle: function () {
			let checkbox = document.getElementById("edmsc-car-isdropped");
			let year = document.getElementById("edmsc-dropped-y");
			let month = document.getElementById("edmsc-dropped-m");
			let conservedCheckBox = document.getElementById("edmsc-car-isconserved");
			if (checkbox.checked) {
				year.disabled = false;
				month.disabled = false;
				conservedCheckBox.disabled = false;
			} else {
				year.disabled = true;
				month.disabled = true;
				conservedCheckBox.disabled = true;
			}
		},
		tentativeOldNumbers: [],
		updateOldNumbersSelectBox: function (x) {
			let carOldNumber = Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers[x];
			document.getElementById("edmsc-oldcar-number").value = carOldNumber.number;
			document.getElementById("edmsc-oldnumber-renumbered-y").value = carOldNumber.year;
			document.getElementById("edmsc-oldnumber-renumbered-m").value = carOldNumber.month;
		},
		save: function () {
			let car = AllCars.carsList[Dialog.list.editCarMasterDialog.functions.carId];
			car.updateMasterData(document.getElementById("edmsc-car-number").value, new YearMonth(Number(document.getElementById("edmsc-manufactured-y").value), Number(document.getElementById("edmsc-manufactured-m").value)), document.getElementById("edmsc-car-isdropped").checked ? new YearMonth(Number(document.getElementById("edmsc-dropped-y").value), Number(document.getElementById("edmsc-dropped-m").value)) : null, Dialog.list.editCarMasterDialog.functions.tentativeOldNumbers, document.getElementById("edmsc-car-isconserved").checked);
			car.remark = document.getElementById("edmsc-car-remark").value;
			Dialog.list.editCarMasterDialog.functions.finish();
		},
		finish: function () {
			if (document.getElementById("edmsc-open-deteal-after-end").checked) {
				Dialog.list.carDetealDialog.functions.display(Dialog.list.editCarMasterDialog.functions.carId);
			} else {
				Dialog.list.manageAllCarsDialog.functions.display();
			}
			refresh();
		}
	});
	document.getElementById("edmsc-car-isdropped").addEventListener("change", Dialog.list.editCarMasterDialog.functions.updateIsDroppedToggle);
	Dialog.list.editCarMasterDialog.functions.updateIsDroppedToggle();

	//編成マスタデータ編集:edmsf
	new Dialog("editFormationMasterDialog", "編成マスタデータ編集", `
										<table class="input-area">
											<tr><td>編成ID</td><td id="edmsf-formation-id"></td></tr>
											<tr><td>形式</td><td><select id="edmsf-series"></select></td></tr>
											<tr><td>編成名</td><td><input id="edmsf-formation-number"></td></tr>
											<tr><td>所属車両</td><td><span id="edmsf-formation-car-count"></span>両<button onclick="Dialog.list.formationMasterCarsEditDialog.functions.display(Dialog.list.editFormationMasterDialog.functions.formationId)" id="edmsf-cars-edit-button" class="lsf-icon" icon="pen">編集</button></td></tr>
											<tr><td>組成</td><td><span class="time-inputs"><input id="edmsf-formated-y" class="yearmonth-y" type="number">年<input id="edmsf-formated-m" class="yearmonth-m" type="number">月</span></td></tr>
												<tr><td>解除</td><td><span class="time-inputs"><input id="edmsf-terminated-y" class="yearmonth-y" type="number">年<input id="edmsf-terminated-m" class="yearmonth-m" type="number">月</span><label for="edmsf-formation-isterminated" class="mku-checkbox-container inline"><input id="edmsf-formation-isterminated" type="checkbox"></label></td></tr>
													<tr><td>備考</td><td><textarea id="edmsf-formation-remark"></textarea></td></tr>
												</table>
													<p class="element-bottom-of-input-area"><label for="edmsf-open-deteal-after-end" class="mku-checkbox-container small"><input id="edmsf-open-deteal-after-end" type="checkbox"></label><label for="edmsf-open-deteal-after-end">操作終了後編成詳細ウインドウを開く</label></p>
													`, [{ "content": "詳細ウインドウ", "event": `Dialog.list.formationDetealDialog.functions.display(Dialog.list.editFormationMasterDialog.functions.formationId)`, "icon": "search" }, { "content": "保存", "event": `Dialog.list.editFormationMasterDialog.functions.save()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.editFormationMasterDialog.functions.finish();`, "icon": "close" }], {
		formationId: 0,
		cars: [],
		display: function (x, isHoldCar) {
			Dialog.list.editFormationMasterDialog.functions.clearInputs();
			Dialog.list.editFormationMasterDialog.functions.formationId = x;
			let formation = AllFormations.formationsList[x];
			if (!Boolean(isHoldCar)) {
				Dialog.list.editFormationMasterDialog.functions.cars = Array.from(formation.cars);
			}
			document.getElementById("edmsf-formation-id").innerHTML = x;
			document.getElementById("edmsf-series").value = formation.seriesId;
			document.getElementById("edmsf-formation-number").value = formation.name;
			document.getElementById("edmsf-formation-car-count").innerHTML = Dialog.list.editFormationMasterDialog.functions.cars.length;
			document.getElementById("edmsf-formated-y").value = formation.formatedOn.year;
			document.getElementById("edmsf-formated-m").value = formation.formatedOn.month;
			document.getElementById("edmsf-formation-isterminated").checked = formation.isTerminated;
			document.getElementById("edmsf-formation-remark").value = formation.remark;
			Dialog.list.editFormationMasterDialog.functions.updateIsTerminatedToggle();
			if (formation.isTerminated) {
				document.getElementById("edmsf-terminated-y").value = formation.terminatedOn.year;
				document.getElementById("edmsf-terminated-m").value = formation.terminatedOn.month;
			} else {
				document.getElementById("edmsf-terminated-y").value = "";
				document.getElementById("edmsf-terminated-m").value = "";
			}
			Dialog.list.editFormationMasterDialog.on();
		},
		clearInputs: function () {
			setSeriesesToSelectBox(document.getElementById("edmsf-series"));
		},
		updateIsTerminatedToggle: function () {
			let checkbox = document.getElementById("edmsf-formation-isterminated");
			let year = document.getElementById("edmsf-terminated-y");
			let month = document.getElementById("edmsf-terminated-m");
			if (checkbox.checked) {
				year.disabled = false;
				month.disabled = false;
			} else {
				year.disabled = true;
				month.disabled = true;
			}
		},
		save: function () {
			let formation = AllFormations.formationsList[Dialog.list.editFormationMasterDialog.functions.formationId];
			formation.updateMasterData(Number(document.getElementById("edmsf-series").value), document.getElementById("edmsf-formation-number").value, new YearMonth(Number(document.getElementById("edmsf-formated-y").value), Number(document.getElementById("edmsf-formated-m").value)), document.getElementById("edmsf-formation-isterminated").checked ? new YearMonth(Number(document.getElementById("edmsf-terminated-y").value), Number(document.getElementById("edmsf-terminated-m").value)) : null);
			formation.updateMasterCars(Dialog.list.editFormationMasterDialog.functions.cars);
			formation.remark = document.getElementById("edmsf-formation-remark").value;
			Dialog.list.editFormationMasterDialog.functions.finish();
		},
		finish: function () {
			if (document.getElementById("edmsf-open-deteal-after-end").checked) {
				Dialog.list.formationDetealDialog.functions.display(Dialog.list.editFormationMasterDialog.functions.formationId);
			} else {
				Dialog.list.manageAllFormationsDialog.functions.display();
			}
			refresh();
		}
	});
	document.getElementById("edmsf-formation-isterminated").addEventListener("change", Dialog.list.editFormationMasterDialog.functions.updateIsTerminatedToggle);
	Dialog.list.editFormationMasterDialog.functions.updateIsTerminatedToggle();


	//編成マスタデータ内車両の編集:msfmsh
	new Dialog("formationMasterCarsEditDialog", "編成マスタ内車両の編集", `<div id="msfmsh-main"></div><p><select id="msfmsh-cars-selectbox"></select><button class="lsf-icon" id="msfmsh-car-adding-button" icon="add" onclick="Dialog.list.formationMasterCarsEditDialog.functions.addCar(Number(document.getElementById('msfmsh-cars-selectbox').value))">車両追加</button></p>`, [{ "content": "確定", "event": `Dialog.list.formationMasterCarsEditDialog.functions.finish()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationMasterCarsEditDialog.off();Dialog.list.editFormationMasterDialog.functions.display(Dialog.list.formationMasterCarsEditDialog.functions.formationId)`, "icon": "close" }], {
		formationId: 0,
		cars: [],
		display: function (x) {
			Dialog.list.formationMasterCarsEditDialog.functions.formationId = x;
			Dialog.list.formationMasterCarsEditDialog.functions.cars = Array.from(Dialog.list.editFormationMasterDialog.functions.cars);
			Dialog.list.formationMasterCarsEditDialog.functions.refresh();
			Dialog.list.formationMasterCarsEditDialog.on();
		},
		refresh: function () {
			setCarsToSelectBox(document.getElementById("msfmsh-cars-selectbox"), Dialog.list.formationMasterCarsEditDialog.functions.cars);
			let table = new Table();
			table.setAttributes({ "class": "vertical-stripes not-formated-car-table" });
			table.setSubtitle("ドラッグで車両順序を変更");
			let maxCellCount = 10;
			for (let id of Dialog.list.formationMasterCarsEditDialog.functions.cars) {
				if (table.cellCountOfLastRow % maxCellCount == 0) {
					table.addRow();
				}
				table.addCell(`<span>${AllCars.carsList[id].number} (ID:${id})</span><p><a href="javascript:void(0)" onclick="Dialog.list.formationMasterCarsEditDialog.functions.removeCar(${table.cellCountOfLastRow})" class="lsf preview-delete-button" title="削除">delete</a></p>`, { "class": "car preview-car", "id": `msfmsh-car-${id}` });
			}
			table.addBlankCellToRowRightEnd();
			document.getElementById("msfmsh-main").innerHTML = table.generateTable();
			Drag.setElements(document.querySelectorAll("#msfmsh-main td.car span"), (dragResult) => {
				if (dragResult.to != -1) {
					Dialog.list.formationMasterCarsEditDialog.functions.cars.splice(dragResult.to + dragResult.direction, 0, Dialog.list.formationMasterCarsEditDialog.functions.cars[dragResult.me]);
					Dialog.list.formationMasterCarsEditDialog.functions.cars.splice(dragResult.me + ((dragResult.to < dragResult.me) ? 1 : 0), 1);
					Dialog.list.formationMasterCarsEditDialog.functions.refresh();
				}
			});
		},
		addCar: function (carId) {
			Dialog.list.formationMasterCarsEditDialog.functions.cars.push(carId);
			Dialog.list.formationMasterCarsEditDialog.functions.refresh();
		},
		removeCar: function (carCount) {
			Dialog.list.formationMasterCarsEditDialog.functions.cars.splice(carCount, 1)
			Dialog.list.formationMasterCarsEditDialog.functions.refresh();
		},
		finish: function () {
			//親ダイアログが表示されている状態以外での実行を禁止
			if (Dialog.list.formationMasterCarsEditDialog.isActive) {
				Dialog.list.editFormationMasterDialog.functions.cars = Array.from(Dialog.list.formationMasterCarsEditDialog.functions.cars);
				Dialog.list.formationMasterCarsEditDialog.off();
				Dialog.list.editFormationMasterDialog.functions.display(Dialog.list.formationMasterCarsEditDialog.functions.formationId, true);
			}
		}
	}, true);

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
	new Dialog("confirmDialog", "確認", `<img src="./js/confirm.svg" class="dialog-icon"><div id="cnfm-main"></div>`, [{ "content": "OK", "event": `Dialog.list.confirmDialog.functions.callback();Dialog.list.confirmDialog.off()`, "icon": "check" }, { "content": "NO", "event": `Dialog.list.confirmDialog.off();Dialog.list.confirmDialog.functions.interruption();`, "icon": "close" }], {
		display: function (message, callback, interruption) {
			document.getElementById("cnfm-main").innerHTML = message;
			Dialog.list.confirmDialog.functions.callback = callback || function () { };
			Dialog.list.confirmDialog.functions.interruption = interruption || function () { };
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