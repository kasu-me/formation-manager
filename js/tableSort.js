class TableSort {
	//表にソート機能を付与
	static addSortButtonToTable(targetTable) {
		//ヘッダの内容
		let tableHeaderRow = targetTable.querySelector("tr");
		let sortButtons = tableHeaderRow.querySelectorAll("td:not(:first-child):not(:last-child)");
		//各行の内容
		let rows = Array.from(targetTable.querySelectorAll("tr:not(:first-child)"));
		//ヘッダのi列目をソートボタンにする
		sortButtons.forEach((td, i) => {
			//ヘッダの1列目にソートボタンクラスを付与
			td.classList.add("tablesort-sort-button");
			//ヘッダのi列目にイベントを付与
			td.addEventListener("click", () => {
				//他ソートボタンのソート状態を解除
				sortButtons.forEach((sortButton, j) => {
					if (i != j) {
						sortButton.classList.remove("tablesort-sorted-column");
						sortButton.classList.remove("tablesort-desc");
					}
				});
				//ソート方向
				let sortMode = 1;
				//ソートボタンのクラス付与
				if (!td.classList.contains("tablesort-sorted-column") || td.classList.contains("tablesort-desc")) {
					//初ソートもしくは既にdescの場合descを解除
					td.classList.remove("tablesort-desc");
				} else {
					//既にascの場合descにセット
					td.classList.add("tablesort-desc");
					sortMode = -1;
				}
				//ソート済みクラス付与
				td.classList.add("tablesort-sorted-column");
				let natSorter = natsort();
				//各行のi列目の内容でソート
				rows.sort((a, b) => {
					return sortMode * natSorter(a.querySelectorAll("td:not(:first-child)")[i].innerHTML, b.querySelectorAll("td:not(:first-child)")[i].innerHTML);
				});
				rows.forEach((row) => {
					targetTable.querySelector("table").appendChild(row);
				});
			});
		});
	}
}