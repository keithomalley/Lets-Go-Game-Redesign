var count=0;
var score=0;

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    // disables field button cannot pass score through to next level
    //document.getElementById("score").disabled = true;
}

function drop(ev) {
    ev.preventDefault();
    // data refers to elem being dragged
    var data = ev.dataTransfer.getData("text");
    //val of item
    var val = document.getElementById(data).getAttribute("value");
    //access textbox
    var current = document.getElementById('score');
    //convert to text before append
    var textnode = document.createTextNode(val);

    if((data !== "stapler") && (data !== "pencil") && (data !== "book")){
      ev.target.appendChild(document.getElementById(data));

      // dynamic style
      document.getElementById(data).style.height = "100%";
      document.getElementById(data).style.width = "30%";
      document.getElementById(data).style.background = "#038BCC";
      document.getElementById(data).style.float = "right";

      ev.target.appendChild(textnode);
      var audio = new Audio('sounds/success1.wav');
      audio.play();

      count=count+1;
      //score added
      score=score+5;
      current.value = score;

    } else {
      var audio = new Audio('sounds/wrong1.wav');
      audio.play();
    }

    if(count===4){
      document.getElementById('arrow').style.display = 'inline-block';
    }
}
