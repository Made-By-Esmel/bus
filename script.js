// document.querySelector("#submitbutton").removeEventListener("click");
// document.querySelector("#submitbutton").addEventListener("click", function (event) {
//   const numberInput = document.querySelector("#numbers").value;
//   const redirectUrl = getRedirectUrl(numberInput);

//   if (numberInput === "") {
//     return;
//   }

//   if (redirectUrl) {
//     window.open("https://bus.wmata.info" + redirectUrl, "_blank");
//   } else {
//     alert("This is an invalid bus identification number or is pre-2018 which isn't supported yet.");
//     event.preventDefault();
//   }
// });

// const redirectUrls = {
//   "4600-4700": "/buses/wmata/22xd40",
//   "4500-4598": "/buses/wmata/21xd40",
//   "5500-5541": "/buses/wmata/21xd60",
//   "3275-3349": "/buses/wmata/20xn40",
//   "4475-4499": "/buses/wmata/20xd40",
//   "4450-4474": "/buses/wmata/19xd40",
//   "3200-3274": "/buses/wmata/19xn40",
//   "5481-5492": "/buses/wmata/18xde60",
//   "5747-5770": "/buses/rideon/11glfa"
// };

// function getRedirectUrl(numberInput) {
//   for (const range in redirectUrls) {
//     const [start, end] = range.split("-");
//     if (numberInput >= start && numberInput <= end) {
//       return redirectUrls[range];
//     }
//   }
//   return null;
// }

const form = document.querySelector('form');
const numbersInput = document.querySelector('#numbers');
const wmataRadio = document.querySelector('input[value="wmata"]');
const rideonRadio = document.querySelector('input[value="rideon"]');
const art = document.querySelector('input[value="rideon"]');

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
  { min: 5271, max: 5275, url: '/buses/art/0735lfw'},
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
    alert('This is an invalid bus identification number or is pre-2018 which isn\'t fully supported yet.');
  }
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  validateInput();
});
