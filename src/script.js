//// ---- DAT.GUI CODE ---- ////
let params = { 
  horizontalVoronoiDivisions: 16,
  verticalVoronoiDivisions: 18,
  voronoiIrregularity: 0.2,
  shadeVariance: 0.3,
  hueStart: 150,
  hueEnd: 220,
  brightness: 70,
  saturation: 95,
  offset: 25,
  animationSpeed: 500,
  hideText: false,
  createNew: function(){
    resetVoronoiDesign();
  },
}

let gui = new dat.GUI();

gui.add(params, "horizontalVoronoiDivisions", 1, 50, 1).name("Horiz. Divisions").onChange(function() {
	resetVoronoiDesign();
});
gui.add(params, "verticalVoronoiDivisions", 1, 50, 1).name("Vert. Divisions").onChange(function() {
	resetVoronoiDesign();
});
gui.add(params, "voronoiIrregularity", 0, 0.5).name("Irregularity").onChange(function() {
	resetVoronoiDesign();
});
gui.add(params, "animationSpeed", 100, 1000, 1).name("Animation Speed");
let colourFolder = gui.addFolder("Colours");
colourFolder.add(params, "shadeVariance", 0, 0.99).name("Hue Variance").onChange(function() {
  createVoronoiPolygons();
  drawPolygons();
});
colourFolder.add(params, "hueStart", 0, 360, 1).name("Hue Start");
colourFolder.add(params, "hueEnd", 0, 360, 1).name("Hue End");
colourFolder.add(params, "saturation", 0, 100, 1).name("Saturation");
colourFolder.add(params, "brightness", 0, 100, 1).name("Brightness");
colourFolder.add(params, "offset", -100, 100, 1).name("Edge Offset");

gui.add(params, "hideText").name("Hide Text");

gui.add(params, "createNew").name("Generate New Design");

let delaunay, voronoi, polygons, voronoiPoints, scaledVoronoiPoints;

function setup(){
  createCanvas(windowWidth, windowHeight); 
  colorMode(HSB, 360, 100, 100, 1); 
  rectMode(CENTER);
  
  textSize(22);
  textAlign(CENTER);
  textStyle(BOLD);
  textFont('Courier New');
  
  resetVoronoiDesign();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  scaleVoronoiPoints();
  createVoronoiPolygons();
  drawPolygons();
}

function resetVoronoiDesign(){
  noiseSeed(frameCount);
  createVoronoiPoints();
  scaleVoronoiPoints();
  createVoronoiPolygons();
  drawPolygons();
}

function createVoronoiPoints(){
  voronoiPoints = [];
  //The following code is derived from this StackOverflow answer
  //https://stackoverflow.com/questions/3667927/do-randomly-generated-2d-points-clump-together-and-how-do-i-stop-it
  let randomnessFactor = params.voronoiIrregularity;

  for (let ySubDivisions = 0; ySubDivisions < params.verticalVoronoiDivisions; ++ySubDivisions){
    for (let xSubDivisions = 0; xSubDivisions < params.horizontalVoronoiDivisions; ++xSubDivisions){
      let regularity = 0.5 * (1 - randomnessFactor);
      let x = regularity + randomnessFactor * random(0, 1) + xSubDivisions / (params.horizontalVoronoiDivisions - 1);
      let y = regularity + randomnessFactor * random(0, 1) + ySubDivisions / (params.verticalVoronoiDivisions - 1);
      voronoiPoints.push([x - 0.5, y - 0.5]);
    }
  }
}

function scaleVoronoiPoints(){
  scaledVoronoiPoints = [];
  for (let i = 0; i < voronoiPoints.length; i++){
    scaledVoronoiPoints.push([voronoiPoints[i][0] * windowWidth, voronoiPoints[i][1] * windowHeight]);
  }
}

function createVoronoiPolygons(){
  delaunay = d3.Delaunay.from(scaledVoronoiPoints);
  voronoi = delaunay.voronoi([0, 0, windowWidth, windowHeight]);
  polygons = voronoi.cellPolygons();
}

function drawPolygons(){
  for (const cell of polygons){
    strokeWeight(0.6);
    let intensity = noise(cell[0][0] / (windowWidth * (1 - params.shadeVariance)), cell[0][1] / (windowHeight * (1 - params.shadeVariance)), frameCount / params.animationSpeed);
    let cellColour = color(lerp(params.hueStart, params.hueEnd, intensity), params.saturation, params.brightness);
    let strokeColour = color(lerp(params.hueStart, params.hueEnd, intensity), params.saturation, params.brightness + params.offset);
    fill(cellColour);
    stroke(strokeColour);
    
    beginShape();
    for (let i = 0; i < cell.length; i++){
      vertex(cell[i][0], cell[i][1]);
    }
    endShape();
  }
  
  if (params.hideText == false){
    drawText();
  }
}

function draw(){
  polygons = voronoi.cellPolygons();
  drawPolygons();
}

function drawText(){
  noStroke();
  //fill(250);
  //rect(windowWidth / 2 - 1, windowHeight - 29, 220, 30)
  fill(250);
  text("VORONOI CRYSTALS by Siddhant Khare", windowWidth / 2, windowHeight - 24);
}

