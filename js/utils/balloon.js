window.addEventListener("load", () => {
	let balloon = document.createElement("div");
	balloon.id = "mku-balloon";
	document.body.appendChild(balloon);
	let removeBalloon = () => {
		balloon.classList.remove("on");
		balloon.innerHTML = "";
		balloon.style.top = 0;
		balloon.style.left = 0;
	}
	let showBalloon = (elem) => {
		let message = elem.getAttribute("mku-balloon-message");
		elem.addEventListener("mouseenter", (e) => {
			balloon.innerHTML = message;
			balloon.classList.add("on");
			balloon.style.top = `${elem.getBoundingClientRect().top - balloon.clientHeight - 7 + window.scrollY}px`;
			balloon.style.left = `${(elem.getBoundingClientRect().left + elem.getBoundingClientRect().right) / 2 - 14}px`;
		});
		elem.addEventListener("mouseleave", removeBalloon);
	}
	document.querySelectorAll(".mku-balloon").forEach(showBalloon);
	window.addEventListener("wheel", removeBalloon);
	window.addEventListener("scroll", removeBalloon);

	const observer = new MutationObserver((mutations) => {
		for (let mutation of mutations) {
			for (let node of mutation.addedNodes) {
				if (!(node instanceof HTMLElement)) continue;
				if (node.classList.contains("mku-balloon")) {
					showBalloon(node);
				}
				for (let elem of node.querySelectorAll('.mku-balloon')) {
					showBalloon(elem);
				}
			}
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
});