class Drag {
	static dragContainer;
	static setElements(targetElements, callbackFunc) {
		targetElements.forEach((elem, i) => {
			let dragResult = { "me": i, "to": -1, "direction": 0 };
			elem.addEventListener("mousedown", (e) => {
				elem.classList.add("selected");
				elem.classList.add("selected-origin");

				Drag.dragContainer.style.width = `${elem.parentNode.clientWidth + 2}px`;
				Drag.dragContainer.style.height = `${elem.parentNode.clientHeight + 2}px`;

				Drag.dragContainer.style.top = `${elem.parentNode.getBoundingClientRect().top}px`;
				Drag.dragContainer.style.left = `${elem.parentNode.getBoundingClientRect().left}px`;

				let offsetX = e.clientX - elem.parentNode.getBoundingClientRect().left;
				let offsetY = e.clientY - elem.parentNode.getBoundingClientRect().top;

				Drag.dragContainer.innerHTML = elem.innerHTML;

				document.body.appendChild(Drag.dragContainer);

				let moveMouse = (e) => {
					Drag.dragContainer.style.left = `${e.clientX - offsetX}px`;
					Drag.dragContainer.style.top = `${e.clientY - offsetY}px`;

					targetElements.forEach((elem, i) => {
						if (!elem.classList.contains("selected-origin")) {
							elem.classList.remove("left-border");
							elem.classList.remove("right-border");
							let elemL = elem.parentNode.getBoundingClientRect().left;
							let elemC = elemL + elem.parentNode.clientWidth / 2;
							let elemR = elemL + elem.parentNode.clientWidth;
							if (elemL < e.clientX && e.clientX < elemC) {
								elem.classList.add("left-border");
								dragResult.to = i;
								dragResult.direction = 0;
							} else if (elemC < e.clientX && e.clientX < elemR) {
								elem.classList.add("right-border");
								dragResult.to = i;
								dragResult.direction = 1;
							}
						}
					});
				};
				document.addEventListener("mousemove", moveMouse);
				document.addEventListener("mouseup", () => {
					document.removeEventListener("mousemove", moveMouse);
					document.body.removeChild(Drag.dragContainer);
					targetElements.forEach((elem) => {
						elem.classList.remove("selected-origin");
						elem.classList.remove("selected");
						elem.classList.remove("left-border");
						elem.classList.remove("right-border");
					});
					callbackFunc(dragResult);
				}, { once: true });
			});
		});
	}
}
Drag.dragContainer = document.createElement("div");
Drag.dragContainer.id = "drag-container";
Drag.dragContainer.style.position = "absolute";
Drag.dragContainer.style.top = 0;
Drag.dragContainer.style.left = 0;
Drag.dragContainer.style.border = "1px solid #000";
Drag.dragContainer.style.backgroundColor = "#fff";
Drag.dragContainer.style.cursor = "grabbing";
Drag.dragContainer.style.zIndex = "9999999";
Drag.dragContainer.style.userSelect = "none";
Drag.dragContainer.style.padding = "0.15em 0.5em";