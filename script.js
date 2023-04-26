const form = document.querySelector('form');
const numbersInput = document.querySelector('#numbers');
const wmataRadio = document.querySelector('input[value="wmata"]');
const rideonRadio = document.querySelector('input[value="rideon"]');
const art = document.querySelector('input[value="art"]');

const wmataRanges = [
  { min: 4600, max: 4700, url: '/buses/wmata/22xd40' },
  { min: 4500, max: 4598, url: '/buses/wmata/21xd40' },
  { min: 5500, max: 5541, url: '/buses/wmata/21xd60' },
  { min: 3275, max: 3349, url: '/buses/wmata/20xn40' },
  { min: 4475, max: 4499, url: '/buses/wmata/20xd40' },
  { min: 4450, max: 4474, url: '/buses/wmata/19xd40' },
  { min: 3200, max: 3274, url: '/buses/wmata/19xn40' },
  { min: 5481, max: 5492, url: '/buses/wmata/18xde60' },
];

const rideonRanges = [
  { min: 5747, max: 5770, url: '/buses/rideon/11glfa' },
];

const artRanges = [
  { min: "5271A", max: "5275A", url: '/buses/art/0735lfw'},
];

function validateInput() {
  const inputNumber = parseInt(numbersInput.value);
  let isValid = false;
  let redirectUrl = '';

  if (wmataRadio.checked) {
    for (let range of wmataRanges) {
      if (inputNumber >= range.min && inputNumber <= range.max) {
        isValid = true;
        redirectUrl = range.url;
        break;
      }
    }
  } else if (rideonRadio.checked) {
    for (let range of rideonRanges) {
      if (inputNumber >= range.min && inputNumber <= range.max) {
        isValid = true;
        redirectUrl = range.url;
        break;
      }
    }
  } else if (art.checked) {
    for (let range of artRanges) {
      if (inputNumber >= range.min && inputNumber <= range.max) {
        isValid = true;
        redirectUrl = range.url;
      }
    }
  }

  if (isValid) {
    window.location.href = redirectUrl;
  } else {
    alert('Either the bus identification number is unsupported or you have chosen the incorrect company. Please ensure you have selected the correct company!');
  }
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  validateInput();
});
