// This is a JavaScript file
var fileUpload = document.getElementById('fileUpload');
var container = document.getElementById('map-container');
var canvas  = document.getElementById('real-map');
var ctx = canvas.getContext('2d');
var test = 'test';
ResetHammerVariables();

ctx.fillRect(canvas.width/2,canvas.height/2,25,25);

function readImage() {
    console.log('File is being read')
    
    if ( this.files && this.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
           var img = new Image();
           img.src = e.target.result;
           img.onload = function() {
               if(this.width<window.innerWidth){
                   canvas.width = this.width;
                   canvas.height = this.height;
                   canvas.style.width = window.innerWidth-32+'px';
                   canvas.style.height = (this.height/this.width)*window.innerWidth+'px';
                   ctx.drawImage(img, 0, 0);
                   ResetHammerVariables();
                   canvas.style.transform = 'translate3d(0px, 0px, 0px)';
                   console.log('1Too Small!');
                   
               }else{
                    canvas.width = this.width;
                    canvas.height= this.height;
                    canvas.style.width = this.width+'px';
                    canvas.style.height = this.height+'px';
                    ctx.drawImage(img, 0, 0);
                    ResetHammerVariables();
                    canvas.style.transform = 'translate3d(0px,0px,0px)';
                    console.log('canvas.style.width is type '+typeof(parseInt(canvas.style.width))+' and has value '+parseInt(canvas.style.width));
                    
               };
           };
        };
        FR.readAsDataURL(this.files[0]);
    }
}

fileUpload.onchange = readImage




/*
// Solution ONE
// This Actually Works but the pinch center is not taken into account
var screen = container;
var el = canvas;

var START_X = 0;
var START_Y = 0;

var ticking = false;
transform = {translate: { x: 0, y: 0 },scale: 1};
var timer;

var mc = new Hammer.Manager(el);

var pinch = new Hammer.Pinch({ threshold: 0 });
var pan = new Hammer.Pan({ threshold: 0, pointers: 0 });

mc.add([pinch, pan]);

pinch.recognizeWith(pan);

mc.on("panstart panmove", onPan);
mc.on("pinchstart pinchmove", onPinch);
mc.on("panend", onPanEnd);

function updateElementTransform() {
        var value = [
	        'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
	        'scale(' + transform.scale + ', ' + transform.scale + ')',
	    ];

	    value = value.join(" ");
	    el.style.transform = value;
	    ticking = false;
	}

function requestElementUpdate() {
        if(!ticking) {
	        window.requestAnimationFrame(updateElementTransform);
	        ticking = true;
	    }
	}

function onPan(ev) {
        
	    transform.translate = {
	        x: START_X + ev.deltaX,
	        y: START_Y + ev.deltaY
	    };
	    requestElementUpdate();
	}
    
function onPanEnd(ev){
    START_X = transform.translate.x;
    START_Y = transform.translate.y;
    console.log('pinch ended: START_X = '+START_X+',START_Y = '+START_Y);
    requestElementUpdate();
}

var initScale = 1;
    function onPinch(ev) {
        console.log('were scaling too');
	    if(ev.type == 'pinchstart') {
	        initScale = transform.scale || 1;
	    }

	    transform.scale = initScale * ev.scale;

	    requestElementUpdate();
	}

*/

//Solution TWO
var MIN_SCALE = 1; // 1=scaling when first loaded
var MAX_SCALE = 64;
      // HammerJS fires "pinch" and "pan" events that are cumulative in nature and not
      // deltas. Therefore, we need to store the "last" values of scale, x and y so that we can
      // adjust the UI accordingly. It isn't until the "pinchend" and "panend" events are received
      // that we can set the "last" values.
      // Our "raw" coordinates are not scaled. This allows us to only have to modify our stored
      // coordinates when the UI is updated. It also simplifies our calculations as these
      // coordinates are without respect to the current scale.
      


var imgWidth = null;
var imgHeight = null;
var viewportWidth = null;
var viewportHeight = null;
var scale = null;
var lastScale = null;
var x = 0;
var lastX = 0;
var y = 0;
var lastY = 0;
var pinchCenter = null;
imgWidth = canvas.width;
imgHeight = canvas.height;
viewportWidth = canvas.parentElement.offsetWidth;
scale = viewportWidth/imgWidth;
lastScale = scale;
viewportHeight = canvas.parentElement.offsetHeight;
curWidth = imgWidth*scale;
curHeight = imgHeight*scale;



var mc = new Hammer.Manager(container);
mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(mc.get('pan'));

function ResetHammerVariables(){
    console.log('Variable Reset');
    imgWidth = null;
    imgHeight = null;
    viewportWidth = null;
    viewportHeight = null;
    scale = null;
    lastScale = null;
    x = 0;
    lastX = 0;
    y = 0;
    lastY = 0;
    pinchCenter = null;
    imgWidth = canvas.width;
    imgHeight = canvas.height;
    viewportWidth = canvas.offsetWidth;
    scale = viewportWidth/imgWidth;
    lastScale = scale;
    viewportHeight = canvas.parentElement.offsetHeight;
    curWidth = imgWidth*scale;
    curHeight = imgHeight*scale;
}
mc.on('pan', function (e) {
          translate(e.deltaX, e.deltaY);
        });
mc.on('panend', function (e) {
          updateLastPos();
        });
mc.on('pinch', function (e) {
          // We only calculate the pinch center on the first pinch event as we want the center to
          // stay consistent during the entire pinch
          if (pinchCenter === null) {
            pinchCenter = rawCenter(e);
            var offsetX = pinchCenter.x*scale - (-x*scale + Math.min(viewportWidth, curWidth)/2);
            var offsetY = pinchCenter.y*scale - (-y*scale + Math.min(viewportHeight, curHeight)/2);
            pinchCenterOffset = { x: offsetX, y: offsetY };
          }
          // When the user pinch zooms, she/he expects the pinch center to remain in the same
          // relative location of the screen. To achieve this, the raw zoom center is calculated by
          // first storing the pinch center and the scaled offset to the current center of the
          // image. The new scale is then used to calculate the zoom center. This has the effect of
          // actually translating the zoom center on each pinch zoom event.
          var newScale = restrictScale(scale*e.scale);
          var zoomX = pinchCenter.x*newScale - pinchCenterOffset.x;
          var zoomY = pinchCenter.y*newScale - pinchCenterOffset.y;
          var zoomCenter = { x: zoomX/newScale, y: zoomY/newScale };
          zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
        });
mc.on('pinchend', function (e) {
          updateLastScale();
          updateLastPos();
          pinchCenter = null;
        });
mc.on('doubletap', function (e) {
          var c = rawCenter(e);
          zoomAround(2, c.x, c.y);
        });

      // Traverse the DOM to calculate the absolute position of an element
var absolutePosition = function (el) {
        var x = 0, y = 0;
        while (el !== null) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent;
        }
        return { x: x, y: y };
      };
var restrictScale = function (scale) {
        if (scale < MIN_SCALE) {
          scale = MIN_SCALE;
        } else if (scale > MAX_SCALE) {
          scale = MAX_SCALE;
        }
        return scale;
      };
var restrictRawPos = function (pos, viewportDim, imgDim) {
        if (pos < viewportDim/scale - imgDim) { // too far left/up?
          pos = viewportDim/scale - imgDim;
        } else if (pos > 0) { // too far right/down?
          pos = 0;
        }
        return pos;
      };
var updateLastPos = function (deltaX, deltaY) {
        lastX = x;
        lastY = y;
      };
var translate = function(deltaX, deltaY) {
        // We restrict to the min of the viewport width/height or current width/height as the
        // current width/height may be smaller than the viewport width/height
        //var newX = restrictRawPos(lastX + deltaX/scale,Math.min(viewportWidth, curWidth), imgWidth);
        var newX = lastX + deltaX/scale;
        x = newX;
        //img.style.marginLeft = Math.ceil(newX*scale) + 'px';
        //var newY = restrictRawPos(lastY + deltaY/scale,Math.min(viewportHeight, curHeight), imgHeight);
        var newY = lastY + deltaY/scale;
        y = newY;
        //img.style.marginTop = Math.ceil(newY*scale) + 'px';
        canvas.style.transform = 'translate3d('+Math.ceil(newX*scale)+'px, '+Math.ceil(newY*scale)+'px,0)';
      };
var zoom = function(scaleBy) {
        scale = restrictScale(lastScale*scaleBy);
        curWidth = imgWidth*scale;
        curHeight = imgHeight*scale;
        canvas.style.width = Math.ceil(curWidth) + 'px';
        canvas.style.height = Math.ceil(curHeight) + 'px';
        // Adjust margins to make sure that we aren't out of bounds
        translate(0, 0);
      };
var rawCenter = function (e) {
        var pos = absolutePosition(container);
        // We need to account for the scroll position
        var scrollLeft = window.pageXOffset ? window.pageXOffset : document.body.scrollLeft;
        var scrollTop = window.pageYOffset ? window.pageYOffset : document.body.scrollTop;
        var zoomX = -x + (e.center.x - pos.x + scrollLeft)/scale;
        var zoomY = -y + (e.center.y - pos.y + scrollTop)/scale;
        return { x: zoomX, y: zoomY };
      };
var updateLastScale = function () {
        lastScale = scale;
      };
var zoomAround = function (scaleBy, rawZoomX, rawZoomY, doNotUpdateLast) {
        // Zoom
        zoom(scaleBy);
        // New raw center of viewport
        var rawCenterX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var rawCenterY = -y + Math.min(viewportHeight, curHeight)/2/scale;
        // Delta
        var deltaX = (rawCenterX - rawZoomX)*scale;
        var deltaY = (rawCenterY - rawZoomY)*scale;
        // Translate back to zoom center
        translate(deltaX, deltaY);
        if (!doNotUpdateLast) {
          updateLastScale();
          updateLastPos();
        }
      };
var zoomCenter = function (scaleBy) {
        // Center of viewport
        var zoomX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var zoomY = -y + Math.min(viewportHeight, curHeight)/2/scale;
        zoomAround(scaleBy, zoomX, zoomY);
      };
var zoomIn = function () {
        zoomCenter(2);
      };
var zoomOut = function () {
        zoomCenter(1/2);
      };