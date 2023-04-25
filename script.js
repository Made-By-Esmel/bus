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

window.onload = function () {
  alert("We are working very hard on giving you the best visit. However, this service has been taken down to complete some important edits, we believe you will like the new UI even better than you do now! See you soon!");
  window.location = "https://wmata.info";
}