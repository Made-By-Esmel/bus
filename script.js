function start() {
  var numbersInput = document.getElementById("numbers").value;

  var busNumbers = {
    '4600-4700': '/buses/wmata/22xd40',
    '4500-4598': '/buses/wmata/21xd40',
    '5500-5541': '/buses/wmata/21xd60',
    '3275-3349': '/buses/wmata/20xn40',
    '4475-4499': '/buses/wmata/20xd40',
    '4450-4474': '/buses/wmata/19xd40',
    '3200-3274': '/buses/wmata/19xn40',
    '5481-5492': '/buses/wmata/18xde60',
    '5747-5770': '/buses/rideon/11glfa'
  };

  for (var range in busNumbers) {
    var start = parseInt(range.split('-')[0]);
    var end = parseInt(range.split('-')[1]);
    if (numbersInput >= start && numbersInput <= end) {
      window.location.href = busNumbers[range];
      return;
    }
  }

  alertInvalidNumber();
}

function alertInvalidNumber() {
  alert("This is an invalid bus identification number or is pre-2018 which isn't supported yet.");
}

var input = document.getElementById("numbers");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    start();
  }
});
