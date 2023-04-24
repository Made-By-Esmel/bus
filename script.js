function start() {
  const numberInput = document.getElementById("numbers").value;
  console.log(numberInput);
  const redirectUrl = getRedirectUrl(numberInput);
  console.log(redirectUrl);
  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    alertInvalidNumber();
  }
}

function getRedirectUrl(numberInput) {
  if (numberInput >= 4600 && numberInput <= 4700) {
    return "/buses/wmata/22xd40";
  } else if (numberInput >= 4500 && numberInput <= 4598) {
    return "/buses/wmata/21xd40";
  } else if (numberInput >= 5500 && numberInput <= 5541) {
    return "/buses/wmata/21xd60";
  } else if (numberInput >= 3275 && numberInput <= 3349) {
    return "/buses/wmata/20xn40";
  } else if (numberInput >= 4475 && numberInput <= 4499) {
    return "/buses/wmata/20xd40";
  } else if (numberInput >= 4450 && numberInput <= 4474) {
    return "/buses/wmata/19xd40";
  } else if (numberInput >= 3200 && numberInput <= 3274) {
    return "/buses/wmata/19xn40";
  } else if (numberInput >= 5481 && numberInput <= 5492) {
    return "/buses/wmata/18xde60";
  } else if (numberInput >= 5747 && numberInput <= 5770) {
    return "/buses/rideon/11glfa";
  } else {
    return null;
  }
}


function alertInvalidNumber() {
  alert("This is an invalid bus identification number or is pre-2018 which isn't supported yet.");
}
