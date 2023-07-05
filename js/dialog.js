class Dialog {
	static area;
	static list = {};

	//new Dialog("ID","タイトル","本文",[{"event":"ボタン1のイベント","content":"ボタン1の本文"},{"event":"ボタン2のイベント","content":"ボタン2の本文"},...]);
	constructor(id, dialogTitle, message, buttons) {
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

	//形式一覧:sed
	new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式追加", "event": ``, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.seriesDispDialog.off();`, "icon": "close" }]);

	//編成テンプレート一覧:fort
	new Dialog("formationTemplatesDialog", "編成テンプレート一覧", `<div class="table-container"></div>`, [{ "content": "テンプレート作成", "event": `displayCreateFormationTemplateDialog()`, "icon": "add" }, { "content": "閉じる", "event": `Dialog.list.formationTemplatesDialog.off();`, "icon": "close" }]);

	//編成を作成:fora
	new Dialog("formationAddingDialog", "編成を作成", ``, [{ "content": "編成テンプレートから作成", "event": `displayTemplates()`, "icon": "add" }, { "content": "編成に所属していない車両から作成", "event": `displayNotFormatedCars()`, "icon": "add" }, { "content": "キャンセル", "event": `Dialog.list.formationAddingDialog.off();`, "icon": "close" }]);

	//編成テンプレートから編成作成:fromt
	new Dialog("createFormationFromTemplateDialog", "編成テンプレートから編成作成", `
		<p><label><span>番号:</span><input id="fromt-car-number" type="number" value="1" onchange="createFormationFromTemplateDialogUpdateTable(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))" onkeyup="createFormationFromTemplateDialogUpdateTable(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))"></label></p>
		<p><label><span>所属:</span><input id="fromt-car-belongs-to"></label></p>
		<div id="fromt-opening">
		</div>
		<div id="fromt-template-legend"></div>
		<p>
			<button onclick="displayTemplates()">他のテンプレートを使う</button>
		</p>
	`, [{ "content": "編成作成", "event": `fromtCreate()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromTemplateDialog.off();`, "icon": "close" }]);

	//編成に所属していない車両から編成作成:forfc
	new Dialog("createFormationFromFloatingCarsDialog", "編成に所属していない車両から編成作成", `
	<p>※車両が選択された状態で現在年月を操作すると選択がリセットされます</p>
	<p><label><span>形式:</span><select id="forfc-series" oninput="refleshNewFormationTable()"></select></label></p>
	<p><label><span>編成番号:</span><input id="forfc-formation-name" oninput="refleshNewFormationTable()"></label></p>
	<p><label><span>所属:</span><input id="forfc-car-belongs-to"></label></p>
	<div id="forfc-not-formated-cars-table"></div>
	<div id="forfc-new-formated-cars-table"></div>
	<div id="forfc-new-formation"></div>
	<div id="forfc-formation-opening"></div>
	<div id="forfc-template-legend"></div>
`, [{ "content": "編成作成", "event": `forfcCreate()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationFromFloatingCarsDialog.off();`, "icon": "close" }]);

	//編成テンプレートを作成:cref
	new Dialog("createFormationTemplateDialog", "編成テンプレートを作成", `形式:<select id="cref-series" onchange="refleshNewFormationTemplateTable()"></select><p>車両番号の一般式:<input id="cref-carnumber"><button onclick="tentativeFormationTemplate.addCarNumber(document.getElementById('cref-carnumber').value);refleshNewFormationTemplateTable();document.getElementById('cref-carnumber').value='';document.getElementById('cref-carnumber').focus()" class="lsf-icon" icon="add">追加</button></p><div id="cref-new-formated-template-table"></div>`, [{ "content": "編成作成", "event": ``, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.createFormationTemplateDialog.off();`, "icon": "close" }]);

	new Dialog("confirmJSONDialog", "確認", `JSON読み込みを実施すると現在のデータはクリアされます。本当に読み込んでよろしいですか？`, [{ "content": "はい", "event": `continueReadJSON()`, "icon": "check" }, { "content": "キャンセル", "event": `document.querySelector('#jsonReader').value='';tmpJSON='';Dialog.list.confirmJSONDialog.off();`, "icon": "close" }]);

	//車両の詳細:cardt
	new Dialog("carDetealDialog", "車両の詳細", `<div id="cardt-main"></div>`, [{ "content": "廃車", "event": `dropCar()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.carDetealDialog.off();`, "icon": "close" }]);

	//車両の改番:carrn
	new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `renumberCar()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.carRenumberDialog.off();`, "icon": "close" }]);

	//編成の詳細:fmdt
	new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div>`, [{ "content": "編成解除", "event": `releaseFormation()`, "icon": "clear" }, { "content": "編成内の車両をまとめて廃車", "event": `releaseFormationAndDropAllCars()`, "icon": "delete" }, { "content": "閉じる", "event": `Dialog.list.formationDetealDialog.off();`, "icon": "close" }]);

	//編成の改名:fmrn
	new Dialog("formationRenameDialog", "編成の改名", `<div id="fmrn-main"></div>`, [{ "content": "改名", "event": `renameFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `Dialog.list.formationRenameDialog.off();`, "icon": "close" }]);
})