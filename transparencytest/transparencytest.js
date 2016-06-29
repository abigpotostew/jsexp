/* 
 * Gray-Scott
 *
 * A solver of the Gray-Scott model of reaction diffusion.
 *
 * ©2012 pmneila.
 * p.mneila at upm.es
 */

//

// Canvas.
var canvas;
var canvasQ;
var canvasWidth;
var canvasHeight;

var mMouseX, mMouseY;
var mMouseDown = false;

var mRenderer;
var mScene, mAnimationScene;
var mCamera;
var frames=[];
var currentFrameIdx=-1;
var numFrames=0;

var mUniforms;
var mLastTime = 0;

var tOtherBuffer, currentDrawSource, tOffBuffer, tBlankTexture, tCombineBuffer;

var state,lastState;
var states = {DRAW:0,ANIMATE:1};

var mDrawMaterial, mScreenMaterial,mCombineMaterial;
var mScreenQuad;

var mToggled = false;

var mMinusOnes = new THREE.Vector2(-1, -1);
var mMinusTens = new THREE.Vector2(-10, -10);

var animationQuads = [];


(function(){

init = function()
{
    init_controls();
    
    canvasQ = $('#myCanvas');
    canvas = canvasQ.get(0);
    
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmousemove = onMouseMove;
    
    mRenderer = new THREE.WebGLRenderer({canvas: canvas/*, preserveDrawingBuffer: true*/});
    mRenderer.setClearColor(0x111111, 0.0);
    mRenderer.autoClear = true;

    mScene = new THREE.Scene();
    mCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    mCamera.position.z = 100;
    mScene.add(mCamera);

    mAnimationScene = new THREE.Scene();
    mAnimationScene.add (mCamera);

    
    mUniforms = {
        screenWidth: {type: "f", value: undefined},
        screenHeight: {type: "f", value: undefined},
        drawSource: {type: "t", value: undefined},
        otherSource : {type: "t", value: undefined},
        //delta: {type: "f", value: 1.0},
        //feed: {type: "f", value: feed},
        //kill: {type: "f", value: kill},
        brush: {type: "v2", value: new THREE.Vector2(-10, -10)},
        //color1: {type: "v4", value: new THREE.Vector4(0, 0, 0.0, 0)},
    };
    //mColors = [mUniforms.color1, mUniforms.color2, mUniforms.color3, mUniforms.color4, mUniforms.color5];
    //$("#gradient").gradient("setUpdateCallback", onUpdatedColor);
    
    mDrawMaterial = new THREE.ShaderMaterial({
            uniforms: mUniforms,
            vertexShader: document.getElementById('standardVertexShader').textContent,
            fragmentShader: document.getElementById('drawFragmentShader').textContent,
        });
    mDrawMaterial.transparent = true;
    mScreenMaterial = new THREE.ShaderMaterial({
                uniforms: mUniforms,
                vertexShader: document.getElementById('standardVertexShader').textContent,
                fragmentShader: document.getElementById('screenFragmentShader').textContent,
            });
    mScreenMaterial.transparent = true;
    mCombineMaterial = new THREE.ShaderMaterial({
                uniforms: mUniforms,
                vertexShader: document.getElementById('standardVertexShader').textContent,
                fragmentShader: document.getElementById('combineFragmentShader').textContent,
            });
    mCombineMaterial.transparent = true;
    
    state = states.DRAW;
    lastState = states.DRAW;

    /*var plane = new THREE.PlaneGeometry(1.0, 1.0);
    mScreenQuad = new THREE.Mesh (plane, mScreenMaterial);//new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);
    mScene.add(mScreenQuad);*/

    /*var bg = new THREE.Mesh (new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff00ff )}));//, mScreenMaterial);
    bg.position.z=-99;
    mScene.add(bg);*/
    
    resize(canvas.clientWidth, canvas.clientHeight);
    

    



    var plane2 = new THREE.PlaneGeometry(.5, .5);
    var mat2 = new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff00ff )});
    mat2.transparent = true;
    mat2.opacity = .5;
    var mScreenQuad2 = new THREE.Mesh (plane2, mat2);//new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);
    mScreenQuad2.position.x = .5;
    mAnimationScene.add(mScreenQuad2);

    var plane3 = new THREE.PlaneGeometry(.75, .75);
    var mat3 = new THREE.MeshBasicMaterial({color : new THREE.Color( 0x0000ff )});
    mat3.transparent = true;
    mat3.opacity = .5
    var mScreenQuad3 = new THREE.Mesh (plane3, mat3);//new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);
    mScreenQuad3.position.z = -1;
    mAnimationScene.add(mScreenQuad3);

    
    mRenderer.setClearColor(0x111111, 0.0);
    mRenderer.autoClear = true;
        //step animate logic
        //animationQuads
    mRenderer.render(mAnimationScene, mCamera, tDrawSource);


    //backg
    var plane = new THREE.PlaneGeometry(.75, .75);
    var mat99 = new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff00ff )});
    mat99.map = tDrawSource.texture;
    mat99.transparent = true;
    mScreenQuad = new THREE.Mesh (plane, mat99); //new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);

    mScene.add (mScreenQuad);

    var bgplane = new THREE.PlaneGeometry(1, 1);
    var bgmat = new THREE.MeshBasicMaterial({color : new THREE.Color( 0x00ff00 )});
    var bgquad = new THREE.Mesh (bgplane, bgmat);//new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);
    bgquad.position.z = -1000;
    mScene.add (bgquad);

    render(0);
    //mUniforms.brush.value = new THREE.Vector2(0.5, 0.5);
    mLastTime = new Date().getTime();
    requestAnimationFrame(render);
    console.log("init");


}

frame1 = function()
{   
    setCurrentFrame(0);
    mRenderer.clear();
}

frame2 = function()
{
    setCurrentFrame(1);
    mRenderer.clear();
}

var getFrameAt = function(i)
{
    return frames[i];
}
var setCurrentFrame =function(i)
{
    currentFrameIdx = i;
    currentDrawSource = getFrameAt(i);
}

var resize = function(width, height)
{
    console.log("resize");
    // Set the new shape of canvas.
    canvasQ.width(width);
    canvasQ.height(height);
    
    // Get the real size of canvas.
    canvasWidth = canvasQ.width();
    canvasHeight = canvasQ.height();
    
    mRenderer.setSize(canvasWidth, canvasHeight);
    

    var createFrame = function(isFrame)
    {
    	var out = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight,
                        {minFilter: THREE.LinearFilter,
                         magFilter: THREE.LinearFilter,
                         format: THREE.RGBAFormat,
                         type: THREE.FloatType});
        if(isFrame)++numFrames;
        return out;
    }

    // TODO: Possible memory leak?
    tDrawSource = createFrame();
    //tOtherBuffer = createFrame();
    tOffBuffer = createFrame(); // temporary buffer to draw to. used in main loop
    tBlankTexture = createFrame(); //used to clear frames. don't draw to this



    
    mUniforms.screenWidth.value = canvasWidth;
    mUniforms.screenHeight.value = canvasHeight;
    mUniforms.brush.value = mMinusOnes;
}

var render = function(time)
{
    var dt = (time - mLastTime)/20.0;
    if(dt > 0.8 || dt<=0)
        dt = 0.8;
    mLastTime = time;
    
    //
    //mUniforms.delta.value = dt;
    //mUniforms.feed.value = feed;
    //mUniforms.kill.value = kill;
    
    //var currentFrame = null;
    //currentDrawSource = getFrameAt (currentFrameIdx);

    mRenderer.setClearColor(0x111111, 0.0);
    mRenderer.autoClear = true;
        //step animate logic
        //animationQuads
    mRenderer.render(mScene, mCamera);
    



    requestAnimationFrame(render);
}

var setupAnimationScene = function (scene, quadList)
{
    var makeQuadContainer = function(plane,mat,quad)
    {
        var out = {plane:plane, mat:mat, quad:quad};
        out.dispose=function(self)
        {
            self.quad = null;
            self.mat = null;
            self.plane = null;
        }
        return out;
    }
    var n = numFrames;
    for(var i=0;i<numFrames;++i)
    {
        var plane = new THREE.PlaneGeometry(1.0, 1.0);
        var mat = new THREE.MeshBasicMaterial( {color: new THREE.Color(i==0?1:0,i==1?1:0,0.,0.)})
        mat.transparent = true;
        mat.map = getFrameAt(i).texture;
        var quad = new THREE.Mesh (plane, mat);//new THREE.MeshBasicMaterial({color : new THREE.Color( 0xff0000 )}));//, mScreenMaterial);
        quad.position.z = -i; // for transparency to work
        scene.add (quad);
        quadList.push (makeQuadContainer (plane,mat,quad));
    }
}

startAnimation = function()
{
    state = states.ANIMATE;
}

startDrawing = function()
{
    state = states.DRAW;
}

loadPreset = function(idx)
{
    feed = presets[idx].feed;
    kill = presets[idx].kill;
    worldToForm();
}

var updateUniformsColors = function()
{
    var values = $("#gradient").gradient("getValuesRGBS");
    for(var i=0; i<values.length; i++)
    {
        var v = values[i];
        mColors[i].value = new THREE.Vector4(v[0], v[1], v[2], v[3]);
    }
    
    mColorsNeedUpdate = false;
}

var onUpdatedColor = function()
{
    mColorsNeedUpdate = true;
    updateShareString();
}

var onMouseMove = function(e)
{
    var ev = e ? e : window.event;
    
    mMouseX = ev.pageX - canvasQ.offset().left; // these offsets work with
    mMouseY = ev.pageY - canvasQ.offset().top; //  scrolled documents too
    
    if(mMouseDown)
        mUniforms.brush.value = new THREE.Vector2(mMouseX/canvasWidth, 1-mMouseY/canvasHeight);
}

var onMouseDown = function(e)
{
    var ev = e ? e : window.event;
    mMouseDown = true;
    
    mUniforms.brush.value = new THREE.Vector2(mMouseX/canvasWidth, 1-mMouseY/canvasHeight);
}

var onMouseUp = function(e)
{
    mMouseDown = false;
}

var cleanBuffer = function(buffer)
{
    mUniforms.drawSource.value = tBlankTexture.texture;
    mRenderer.render(mScene, mCamera, buffer, true);
}

clean = function()
{
    mUniforms.brush.value = new THREE.Vector2(-10, -10);
    //currentDrawSource.clear();
    cleanBuffer (currentDrawSource);
}

snapshot = function()
{
    var dataURL = canvas.toDataURL("image/png");
    window.open(dataURL, "name-"+Math.random());
}

// resize canvas to fullscreen, scroll to upper left 
// corner and try to enable fullscreen mode and vice-versa
fullscreen = function() {

    var canv = $('#myCanvas');
    var elem = canv.get(0);
    
    if(isFullscreen())
    {
        // end fullscreen
        if (elem.cancelFullscreen) {
            elem.cancelFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
    
    if(!isFullscreen())
    {
        // save current dimensions as old
        window.oldCanvSize = {
            width : canv.width(), 
            height: canv.height()
        };
        
        // adjust canvas to screen size
        resize(screen.width, screen.height);
        
        // scroll to upper left corner
        $('html, body').scrollTop(canv.offset().top);
        $('html, body').scrollLeft(canv.offset().left);
        
        // request fullscreen in different flavours
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }
}

var isFullscreen = function()
{
    return document.mozFullScreenElement ||
        document.webkitCurrentFullScreenElement ||
        document.fullscreenElement;
}

$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(ev) {
    // restore old canvas size
    if(!isFullscreen())
        resize(window.oldCanvSize.width, window.oldCanvSize.height);
});

var worldToForm = function()
{
    //document.ex.sldReplenishment.value = feed * 1000;
    $("#sld_replenishment").slider("value", feed);
    $("#sld_diminishment").slider("value", kill);
}

var init_controls = function()
{
    /*$("#sld_replenishment").slider({
        value: feed, min: 0, max:0.1, step:0.001,
        change: function(event, ui) {$("#replenishment").html(ui.value); feed = ui.value; updateShareString();},
        slide: function(event, ui) {$("#replenishment").html(ui.value); feed = ui.value; updateShareString();}
    });
    $("#sld_replenishment").slider("value", feed);
    $("#sld_diminishment").slider({
        value: kill, min: 0, max:0.073, step:0.001,
        change: function(event, ui) {$("#diminishment").html(ui.value); kill = ui.value; updateShareString();},
        slide: function(event, ui) {$("#diminishment").html(ui.value); kill = ui.value; updateShareString();}
    });
    $("#sld_diminishment").slider("value", kill);
    */
    $('#share').keypress(function (e) {
        if (e.which == 13) {
            parseShareString();
            return false;
        }
    });
    
    $("#btn_clear").button({
        icons : {primary : "ui-icon-document"},
        text : false
    });
    $("#btn_snapshot").button({
        icons : {primary : "ui-icon-image"},
        text : false
    });
    $("#btn_fullscreen").button({
        icons : {primary : "ui-icon-arrow-4-diag"},
        text : false
    });
    
    $("#notworking").click(function(){
        $("#requirement_dialog").dialog("open");
    });
    $("#requirement_dialog").dialog({
        autoOpen: false
    });
}

alertInvalidShareString = function()
{
    $("#share").val("Invalid string!");
    setTimeout(updateShareString, 1000);
}

parseShareString = function()
{
    var str = $("#share").val();
    var fields = str.split(",");
    
    if(fields.length != 12)
    {
        alertInvalidShareString();
        return;
    }
    
    var newFeed = parseFloat(fields[0]);
    var newKill = parseFloat(fields[1]);
    
    if(isNaN(newFeed) || isNaN(newKill))
    {
        alertInvalidShareString();
        return;
    }
    
    var newValues = [];
    for(var i=0; i<5; i++)
    {
        var v = [parseFloat(fields[2+2*i]), fields[2+2*i+1]];
        
        if(isNaN(v[0]))
        {
            alertInvalidShareString();
            return;
        }
        
        // Check if the string is a valid color.
        if(! /^#[0-9A-F]{6}$/i.test(v[1]))
        {
            alertInvalidShareString();
            return;
        }
        
        newValues.push(v);
    }
    
    //$("#gradient").gradient("setValues", newValues);
    //feed = newFeed;
    //kill = newKill;
    worldToForm();
}

updateShareString = function()
{
    var str = "".concat(feed, ",", kill);
    
    var values = $("#gradient").gradient("getValues");
    for(var i=0; i<values.length; i++)
    {
        var v = values[i];
        str += "".concat(",", v[0], ",", v[1]);
    }
    $("#share").val(str);
}

})();
