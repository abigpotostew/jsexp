PGraphics[] drawBuffers;

int currentBuffer = 0;
int bufferCt = 0;

PVector pMouse;

int state=0;
int DRAW=0;
int ANIM=1;

void setup(){
  size(500,500);
  initBuffers(2);
  pMouse = new PVector();
}

void initBuffers(int ct){
  bufferCt = ct;
  drawBuffers = new PGraphics[ct];
  for(int i=0; i<ct; ++i){
    drawBuffers[i] = createGraphics(width,height);
    drawBuffers[i].beginDraw();
    drawBuffers[i].background(255,0);
    drawBuffers[i].endDraw();
  }
}

void draw(){
  background(50);
  
  if (state==DRAW){
    drawState();
  }
  else {
    animateState();
  }
  
  pMouse.set (mouseX,mouseY);
}

void goToState(int state_id){
  state = state_id%2;
}

void drawState(){
  PGraphics current = getCurrBuffer();
  if (mousePressed){
    current.beginDraw();
    current.fill(255,0,255);
    current.strokeWeight(3);
    current.stroke(255,0,255);
    current.line (pMouse.x, pMouse.y, mouseX,mouseY);
    //current.ellipse(1f*mouseX, 1f*mouseY, 10.,10.);
    current.endDraw();
  }
  
  for(int i=0;i<drawBuffers.length;++i){
    image(drawBuffers[i],0,0);
  }
}

void animateState(){
  
  drawSmeared(drawBuffers, 10, 3, 1f/2.6, 2.5);

}

PGraphics getCurrBuffer(){
  return drawBuffers[currentBuffer];
}

void clearFrame(){
  PGraphics current = getCurrBuffer();
  current.beginDraw();
    current.background(255,0);
  current.endDraw();
}

void setFrame(int id){
  currentBuffer = (id-1)%bufferCt;
}

void drawSmeared(PGraphics[] frames, float numAngles, float numRepeats, float scale, float frameDistance){
  pushMatrix();
  translate(width/2,height/2);//move center
  float hw = width*scale, hh = height*scale;
  //float ka = 1f*anim.length()/numAngles;
  int idx=0;
  for(int i=0;i<numAngles;++i){
    for(int j=0;j<numRepeats;++j){
      idx = (int)(i*frameDistance) + frameCount + (int)(1f*bufferCt/numRepeats*j);
      image(frames[idx%bufferCt], -hw, -hh, hw, hh);
    }
    //idx = (frameCount)%bufferCt;
    //image(frames[idx], -hw, -hh, hw, hh);
    rotate(1f/numAngles*TWO_PI);
  }
  popMatrix();
}

void addFrame(){
  
}

void removeFrame(){
  
}