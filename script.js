function startt() {
	var a = parseInt($("#numbers").prop("value"));
	if (a == NaN) {
		alert("This is an invalid bus identification number or is pre-2018 which isn't supported yet.");
		return;
	}
	else if (a >= 4600 && a <= 4700) {
		document.location.href = "https://businfo.madebyesmel.com/22xd40";
	}

	else if (a >= 4500 && a <= 4598) {
		window.location.href = "https://businfo.madebyesmel.com/21xd40";
	}

	else if (a >= 5500 && a <= 5541) {
		document.location.href = "https://businfo.madebyesmel.com/21xd60";
	}

	else if (a >= 3275 && a <= 3349) {
		document.location.href = "https://businfo.madebyesmel.com/20xn40";
	}

	else if (a >= 4475 && a <= 4499) {
		document.location.href = "https://businfo.madebyesmel.com/20xd40";
	}

	else if (a >= 4450 && a <= 4474) {
		document.location.href = "https://businfo.madebyesmel.com/19xd40";
	}

	else if (a >= 3200 && a <= 3274) {
		document.location.href = "https://businfo.madebyesmel.com/19xn40";
	}

	else if (a >= 5481 && a <= 5492) {
		document.location.href = "https://businfo.madebyesmel.com/18xde60";
	}

	else {
		alert("This is an invalid bus identification number or is pre-2018 which isn't supported yet.");
	}
}
