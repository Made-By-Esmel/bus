$(document).ready(function () {
    $("#submit").click(function startt() {
        var a = parseInt($("#num").prop("value"));
        if (a == NaN) {
            alert("Invalid number");
            return;
        } 
        else if (a >= 4600 && a <= 4700) {
            document.location.href = "/22xd40";
        }
        
        else if (a >= 4500 && a <= 4598) {
            document.location.href = "/21xd40";
        } 

        else if (a >= 5500 && a <= 5541) {
            document.location.href = "/21xd60";
        } 

        else if (a >= 3275 && a <= 3349) {
            document.location.href = "/20xn40";
        } 

        else if (a >= 4475 && a <= 4499) {
            document.location.href = "/20xd40";
        } 

        else if (a >= 4450 && a <= 4474) {
            document.location.href = "/19xd40";
        } 

        else if (a >= 3200 && a <= 3274) {
            document.location.href = "/19xn40";
        } 

        else if (a >= 5481 && a <= 5492) {
            document.location.href = "/18xde60";
        } 

        else {
            alert("Not a valid number");
        }
    });
});