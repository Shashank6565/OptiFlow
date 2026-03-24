let canvas = document.getElementById("intersection")
let ctx = canvas.getContext("2d")

let active = "A"
let state = "green"
let timer = 10

function drawRoads(){
ctx.fillStyle="#374151"
ctx.fillRect(240,0,80,520)
ctx.fillRect(0,240,520,80)

ctx.strokeStyle="white"
ctx.setLineDash([10,10])
ctx.beginPath()
ctx.moveTo(260,0)
ctx.lineTo(260,520)
ctx.moveTo(0,260)
ctx.lineTo(520,260)
ctx.stroke()
ctx.setLineDash([])
}

function drawSignal(x,y,lane){
let colors={red:"#400",yellow:"#440",green:"#040"}

if(lane==active){
if(state=="green") colors.green="lime"
if(state=="yellow") colors.yellow="yellow"
if(state=="red") colors.red="red"
}else{
colors.red="red"
}

drawLight(x,y,colors.red)
drawLight(x,y+15,colors.yellow)
drawLight(x,y+30,colors.green)
}

function drawLight(x,y,color){
ctx.beginPath()
ctx.arc(x,y,6,0,Math.PI*2)
ctx.fillStyle=color
ctx.fill()
}

function drawTimer(){
ctx.fillStyle="white"
ctx.font="18px Arial"
ctx.fillText(timer+"s",250,260)
}

function drawLabels(){
ctx.fillStyle="white"
ctx.font="14px Arial"
ctx.fillText("Lane A",240,20)
ctx.fillText("Lane B",470,250)
ctx.fillText("Lane C",240,510)
ctx.fillText("Lane D",10,250)
}

function render(){
ctx.clearRect(0,0,520,520)

drawRoads()

drawSignal(230,210,"D")
drawSignal(290,210,"B")
drawSignal(230,300,"C")
drawSignal(290,300,"A")

drawTimer()
drawLabels()

requestAnimationFrame(render)
}

function setLane(l){
active=l
state="green"
timer=10
document.getElementById("greedy").innerText="Greedy Selected: Lane "+l
}

function switchTab(id){
document.querySelectorAll(".panel").forEach(p=>p.style.display="none")
document.getElementById(id).style.display="block"
}

switchTab("auto")

let cycle=["A","B","C","D"]
let i=0

setInterval(()=>{
active=cycle[i]
state="green"
timer=10
i=(i+1)%4
},8000)

setInterval(()=>{
timer--
if(timer<=0){
if(state=="green"){
state="yellow"
timer=3
}else if(state=="yellow"){
state="red"
timer=2
}else{
state="green"
timer=10
}
}
},1000)

render()