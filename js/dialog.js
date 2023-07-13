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
			buttonContent += `<button onclick="${buttons[i]["event"]}" class="dialog-main-button${classes}"${attributes}>${buttons[i]["content"]}</button>`;
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
});