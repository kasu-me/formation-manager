class Dialog {
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
        dialogArea.appendChild(this.dialog);
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
			if(buttons[i]["icon"]==undefined || buttons[i]["icon"]==null){
				buttons[i]["icon"]="";
			}
			let attributes="";
			let classes="";
			for(let j in buttons[i]){
				if(j=="content" || j=="event"){
					continue;	
				}else if(j=="icon"){
					attributes+=` icon="${buttons[i]["icon"]}"`;
					classes+=` lsf-icon`;
				}else if(j=="class"){
					classes+=` ${buttons[i][j]}`;
				}else{
					attributes+=` ${j}=${buttons[i][j]}`;
				}
			}
            buttonContent += `<button onclick="${buttons[i]["event"]}" class="${classes}"${attributes}>${buttons[i]["content"]}</button>`;
        }
        this.buttons.innerHTML = buttonContent;
    }
    on() {
        Dialog.offAll();
    	Dialog.open(dialogArea);
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
        Dialog.close(dialogArea);
    }
    static open(div){
		div.classList.remove("off");
		div.classList.add("on");
	}
    static close(div){
		div.classList.remove("on");
		div.classList.add("off");
	}
}

let dialogArea;
let seriesDispDialog;
let formationAddingDialog;
let formationTemplatesDialog;
let createFormationFromTemplateDialog;
let confirmRefleshDialog;
let confirmJSONDialog;
let createFormationTemplateDialog;
let carDetealDialog;
let carRenumberDialog;
let formationDetealDialog;


window.addEventListener("load",function(){
	dialogArea = document.createElement("div");
	dialogArea.id="dialog-area";
	document.body.appendChild(dialogArea);
	
	//sed
	seriesDispDialog = new Dialog("seriesDispDialog", "形式一覧", `<div class="table-container"></div>`, [{ "content": "形式追加", "event": ``, "icon": "add" }, { "content": "閉じる", "event": `seriesDispDialog.off();`, "icon": "close" }]);
	//fort
	formationTemplatesDialog = new Dialog("formationTemplatesDialog", "編成テンプレート一覧", `<div class="table-container"></div>`, [{ "content": "テンプレート追加", "event": ``, "icon": "add" }, { "content": "閉じる", "event": `formationTemplatesDialog.off();`, "icon": "close" }]);
	//fora
	formationAddingDialog = new Dialog("formationAddingDialog", "編成を作成", ``, [{ "content": "編成テンプレートから作成", "event": `displayTemplates()`, "icon": "add" }, { "content": "編成に所属していない車両から作成", "event": ``, "icon": "add" }, { "content": "キャンセル", "event": `formationAddingDialog.off();`, "icon": "close" }]);
	//fromt
	createFormationFromTemplateDialog = new Dialog("createFormationFromTemplateDialog", "編成テンプレートから編成作成", `
		<p><label><span>番号:</span><input id="fromt-car-number" type="number" value="1" onchange="createFormationFromTemplateDialogUpdateTable(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))" onkeyup="createFormationFromTemplateDialogUpdateTable(Number(document.querySelector('#fromt-opening').innerHTML),Number(this.value))"></label></p>
		<p><label><span>所属:</span><input id="fromt-car-belongs-to"></label></p>
		<div id="fromt-opening">
		</div>
		<div id="fromt-template-legend"></div>
		<p>
			<button onclick="displayTemplates()">他のテンプレートを使う</button>
		</p>
	`, [{ "content": "編成作成", "event": `fromtCreate()`, "icon": "check" }, { "content": "キャンセル", "event": `createFormationFromTemplateDialog.off();`, "icon": "close" }]);
	
	//cref
	createFormationTemplateDialog = new Dialog("createFormationTemplateDialog", "編成テンプレートを作成", `<select id="cref-formationTemplateId"></select>`, [{ "content": "編成作成", "event": `displayTemplates()`, "icon": "check" }, { "content": "キャンセル", "event": `createFormationTemplateDialog.off();`, "icon": "close" }]);
	
	confirmJSONDialog=new Dialog("confirmJSONDialog","確認",`JSON読み込みを実施すると現在のデータはクリアされます。本当に読み込んでよろしいですか？`,[{"content":"はい","event":`continueReadJSON()`,"icon":"check"},{"content":"キャンセル","event":`document.querySelector('#jsonReader').value='';tmpJSON='';confirmJSONDialog.off();`,"icon":"close"}]);
	
	//cardt
	carDetealDialog = new Dialog("carDetealDialog", "車両の詳細", `<div id="cardt-main"></div>`, [{"content":"廃車","event":`dropCar()`,"icon":"delete"}, { "content": "閉じる", "event": `carDetealDialog.off();`, "icon": "close" }]);
	
	//carrn
	carRenumberDialog = new Dialog("carRenumberDialog", "車両の改番", `<div id="carrn-main"></div>`, [{ "content": "改番", "event": `renumberCar()`, "icon": "check" }, { "content": "キャンセル", "event": `carRenumberDialog.off();`, "icon": "close" }]);
	
	//fmdt
	formationDetealDialog = new Dialog("formationDetealDialog", "編成の詳細", `<div id="fmdt-main"></div>`, [{ "content": "編成解除", "event": `releaseFormation()`, "icon": "clear" },{"content":"編成内の車両をまとめて廃車","event":`releaseFormationAndDropAllCars()`,"icon":"delete"}, { "content": "閉じる", "event": `formationDetealDialog.off();`, "icon": "close" }]);
	
	//fmrn
	formationRenameDialog = new Dialog("formationRenameDialog", "編成の改名", `<div id="fmrn-main"></div>`, [{ "content": "改名", "event": `renameFormation()`, "icon": "check" }, { "content": "キャンセル", "event": `formationRenameDialog.off();`, "icon": "close" }]);
})