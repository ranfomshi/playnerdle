function myScript() {
  //clear container
  var c = document.getElementById("container");

  var count = 1;
  var row = 1;
  var col = 1;
  var limit = 2500;
  var rowLen = 50;
  var colLen = Math.round(limit / rowLen)
  var middleCol = Math.round(colLen/2)
  var middleRow = Math.round(rowLen/2)
  while (count <= limit) {
    //create and attach coloured dot
    var el = document.createElement("div");

    el.setAttribute("row", row);
    el.setAttribute("column", col);
    el.innerHTML = col + "," + row;
    el.style.fontSize = "4px";
    el.style.lineHeight = 2;
    el.style.textAlign = "center";

    //set distance variables
    var distanceFromCenterColumn = Math.round(col - (rowLen/2))
    if(distanceFromCenterColumn <0){distanceFromCenterColumn = distanceFromCenterColumn*-1}
    el.setAttribute("distancefromcentercol", distanceFromCenterColumn)
    var distanceFromCenterRow = Math.round(row - (colLen/2))
    if(distanceFromCenterRow <0){distanceFromCenterRow = distanceFromCenterRow*-1}
    el.setAttribute("distancefromcenterrow", distanceFromCenterRow)


    // var calc = (distanceFromCenterColumn/2)
    if (col >= Math.round(row*(Math.pow(col,2)/100))) {
      el.setAttribute("class", "moving");
    } else {
      el.setAttribute("class", "notMoving");
    }

    

    c.appendChild(el);
    c.style.border = "1px solid black";
    c.style.width = "600px";
    c.style.height = "600px";

    //increment the counter to know when to stop attaching dots
    count++;
    //set row and column numbers for next loop
    if (count % rowLen == 1) {
      row++;
    }
    col++;
    if (col > rowLen) {
      col = col - rowLen;
    }
    col = parseInt(col);
    row = parseInt(row);
  }
}




