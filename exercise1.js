$(document).ready(function(){
    /* Hide the information section when clicking the hide-button */
    $("#hide").click(function(){
        $("#hidearea").toggle("fast");
    });
    /* White text-box for virtual bar code when not in focus */
    $("#code").blur(function(){
        $(this).css("background-color", "White");
    });
    /* Grey text-box for virtual bar code when in focus */
    $("#code").focus(function(){
        $(this).css("background-color", "LightGray");
    });
    /* Decode the code when clicking decode-button */
    document.getElementById("decode").onclick = function dec(){
        decode()
    }
});

/* Change text between "Hide" and "Show" */
function changeText(){
    var elem = document.getElementById("hide");
    if (elem.value=="Hide") {
        elem.value = "Show";
    }
    else {
        elem.value = "Hide";
    }
}

/* Decode the code */
function decode(){
    code = document.getElementById("code").value;
    /* Checks if the code version is 4 or 5 */
    if (code[0] == 4 || code[0] ==5) {
        /* Get the iban from the code and add needed spaces between numbers */
        $("#iban").val(code.slice(1, 3) + " " + code.slice(3, 7) + " " + code.slice(7, 11) + " " + code.slice(11, 15) + " " + code.slice(15, 17));
        /* Get euros from the code and take away zeros in the front */
        euros = code.slice(18, 23).replace(/^0+/, '');
        /* If the lenght of euros is 0, then euros are zero */
        if (euros.length == 0) {
            euros = 0;
        }
        /* Get cents from the code */
        cents = code.slice(23, 25);
        /* Amount is euros and cents combined */
        $("#amount").val(euros + "." + cents);
        /* Different ways to get the reference if the version is 4 or 5 */
        if (code[0] == 4) {
            /* Get reference from the code and take away zeros in the front */
            $("#reference").val(code.slice(29, 48).replace(/^0+/, ''));
        }
        else {
            /* Get reference from the code, add RF before the code and take away the zeros between */
            $("#reference").val("RF" + code.slice(25, 27) + " " + code.slice(27, 48).replace(/^0+/, ''));
        }
        /* Get year, moth and day from the code */
        year = code.slice(48, 50);
        month = code.slice(50, 52);
        day = code.slice(52, 54);
        /* If all are 00, then the date is None */
        if (day == "00" && month == "00" && year == "00"){
            $("#duedate").val("None");
        }
        /* Else the duedate is formatted */
        else {
            $("#duedate").val(day + "." + month + ".20" + year);
        }
        /* Generates the bar code */
        JsBarcode("#barcode", code, {format: "CODE128C"});
    }
    /* If the code version isn't 4 or 5, decoding can't be done and the text below appears */
    else {
        $("#iban").val("Invalid virtual bar code");
    }

}