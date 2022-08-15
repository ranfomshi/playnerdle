var color1 = '#000000' 
var color2 = '#1200ff'
var color3 = '#556677'
var type = 'delay'
var duration = 1
var ind = 0


function myScript() {
    //clear container
    var c = document.getElementById('container')
    c.innerHTML=""

    //set html inputs to start values
    document.getElementById('color1').setAttribute('value', color1)
    document.getElementById('color2').setAttribute('value', color2)
    document.getElementById('color3').setAttribute('value', color3)
    document.getElementById('duration').setAttribute('value', duration)
  
    var horizontal = (window.innerWidth/12)
    var verticle = (window.innerHeight/12)
    var amount = (horizontal)*(verticle)
    console.log(horizontal)
    console.log(amount)
    var count = 0
    var columnNumber = 1
    var rowNumber = 1
    var limit = amount
    while (count < limit) {
        //set colours
        document.documentElement.style.setProperty('--color1', color1);
        document.documentElement.style.setProperty('--color2', color2);
        document.documentElement.style.setProperty('--color3', color3);
        //create and attach coloured dot
        var el = document.createElement('div')
        el.setAttribute('class', 'moving')


        var differenceFromMiddle = (rowNumber - verticle/2)
        if(differenceFromMiddle>0){differenceFromMiddle = differenceFromMiddle*-1} 

        var differenceFromCenter = (columnNumber - horizontal/2)
        if(differenceFromCenter>0){differenceFromCenter = differenceFromCenter*-1}

        // some calcs
var calcs = [
    (columnNumber^count/horizontal),
    (verticle/columnNumber),
    ((horizontal/rowNumber+verticle/columnNumber)*(count/100))-200,
    ((verticle/columnNumber)*(count/100)),
    (Math.sqrt(rowNumber)+(columnNumber/10)),
    (((columnNumber/100)*(count%2+count/10))-count),
    ((count/100)-count/2),
    (count)-count/Math.random(),
    (Math.sqrt(differenceFromMiddle/count)),
    (differenceFromCenter+differenceFromMiddle),
    (differenceFromMiddle/(differenceFromCenter*count/1000)),
    (1+(differenceFromMiddle/100)),
    (differenceFromMiddle+(differenceFromMiddle/Math.sqrt(columnNumber))-100),
    (1+(differenceFromMiddle/100)+Math.sqrt(rowNumber)),
    (((count+(rowNumber/3))-count*(rowNumber/80)+(Math.random()/10))-100000),
    ((differenceFromMiddle/100)+columnNumber/100),
    ((differenceFromCenter/100)+(rowNumber/100)),
    ((columnNumber/10)*rowNumber%50/100),
    ((differenceFromMiddle*columnNumber)-100),
    (Math.sqrt(differenceFromCenter)-rowNumber/count*0.01),
    (differenceFromMiddle/differenceFromCenter*0.1-10),
    (differenceFromMiddle*differenceFromCenter*0.1-10),
    (differenceFromCenter+(differenceFromMiddle/(rowNumber*0.1))),
    ((count%2/100)*rowNumber%3),
    (Math.sqrt(count*(columnNumber*1))-4000),
    (Math.sqrt(rowNumber)+(differenceFromCenter/10)-200),
    (Math.sqrt(rowNumber^2)+(differenceFromCenter/10)-200),
    (differenceFromCenter+(differenceFromMiddle/10)),
    ((rowNumber/3)+columnNumber/differenceFromCenter^2),
    (rowNumber%2/2+columnNumber%2/2)
    ]
    document.getElementById('preset').setAttribute('max', calcs.length)
   

        //set animation delay / pattern
       var calculation= calcs[ind]
       
        // if(rowNumber>(verticle/2)){
        //     calculation = (((differenceFromMiddle/10)+Math.sqrt(rowNumber))-1000)*(rowNumber/5)
        // }
        el.setAttribute('style', 'background-color:'+
            getComputedStyle(document.documentElement).getPropertyValue('--color1')+
            '; animation-'+type+':'+calculation+'s;')
        
        el.setAttribute('columnNumber', columnNumber)
        el.setAttribute('rowNumber', rowNumber)
        c.appendChild(el)
        //increment the counter to know when to stop attaching dots
        count++
        //calculate the column number attribute and others for the next loop 
       if(columnNumber > horizontal-1){
           columnNumber = 1 
           rowNumber++
       }
       else{
           columnNumber++
       }
    }

}



function changeColor1(e){
    color1 = e.target.value
    document.documentElement.style.setProperty('--color1', color1);
}
function changeColor2(e){
    color2 = e.target.value
    document.documentElement.style.setProperty('--color2', color2);
}
function changeColor3(e){
    color3 = e.target.value
    document.documentElement.style.setProperty('--color3', color3);
}

function changeDuration(e){
    duration = e.target.value+'s'
    document.documentElement.style.setProperty('--duration', duration);
}

function changeCalc(e){
    ind = e.target.value
    myScript()
}

function changeTypeToDelay(e){
    type = e.target.value
    e.target.disabled = true
    myScript()
    document.getElementById('typeDuration').disabled= false
    document.getElementById('durationBlock').style.display = 'block'
}

function changeTypeToDuration(e){
    type = e.target.value
    e.target.disabled = true
    myScript()
    document.getElementById('typeDelay').disabled= false
    document.getElementById('durationBlock').style.display = 'none'
}

function setImage(e){
    document.getElementById('image').setAttribute('src', e.target.value)
}






