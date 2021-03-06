window.onload = init;
window.onresize = resize;

var canvas = null;
var context = null;

var globalScale = 30.0;
var gravity = 0;

var squareSize = 5;
var squareSizeBig = 12;

var test = null;
var s1 = null;

var greenColor = "#00e8a9";


function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}


function init() {
  var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

  canvas = document.getElementById("canvas");
  test = document.getElementById("test");
  littleSquares = document.getElementsByClassName('square');
  context = canvas.getContext('2d');
  resize();

  var world = new b2World(
    new b2Vec2(0, 0) //gravity
    , true //allow sleep
  );

  var fixDef = new b2FixtureDef;
  fixDef.density = 1;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  var bodyDef = new b2BodyDef;

  //create walls border
  createWall(30, 30, canvas.width, 0.03);
  createWall(canvas.width-30, 0, 0.03, canvas.height);
  createWall(canvas.width / 2, canvas.height-30, canvas.width / 2, 0.03);
  createWall(30, 30, 0.03, canvas.height);

/*

  for (var i = 0; i < 4; ++i) {
    createNewShape((getPosition(littleSquares[i]).x + 5) / globalScale, (getPosition(littleSquares[i]).y + 5) / globalScale, squareSize, 0, 'rect', greenColor,true);
    // change style , add the invisible class!
    littleSquares[i].className += " hidden";
  }
*/

  //setup debug draw
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(canvas.getContext("2d"));
  debugDraw.SetDrawScale(globalScale);
  debugDraw.SetFillAlpha(0);
  debugDraw.SetLineThickness(2.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);

  (function loop() {
    update();
    requestAnimationFrame(loop);
  })();



  /* ------------------------------ INTERACTIVE EVENTS  ------------------------------ */


  var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
  var canvasPosition = getElementPosition(document.getElementById("canvas"));

  mouseX = -600;
  mouseY = -600;

  document.addEventListener("mousedown", function(e) {
    isMouseDown = true;
    handleMouseMove(e);
  }, true);

  document.addEventListener("mousemove", handleMouseMove, true);


  document.addEventListener("mouseup", function() {
    isMouseDown = false;
  }, true);


  //contact listener
  var contactListener = new Box2D.Dynamics.b2ContactListener;

  world.SetContactListener(contactListener);

  contactListener.BeginContact = function(contact) {
    var isMainA = contact.GetFixtureA().GetBody().GetUserData().isMain;
    var isMainB = contact.GetFixtureB().GetBody().GetUserData().isMain;

    if(isMainA || isMainB){
     // isMainA ? contact.GetFixtureB().GetBody().SetColor(greenColor) : contact.GetFixtureA().GetBody().SetColor(greenColor);
    }
  
  }
  contactListener.EndContact = function(contact) {
       //console.log(contact.GetFixtureA().GetBody().GetUserData());
  }
  contactListener.PostSolve = function(contact, impulse) {
      
  }
  contactListener.PreSolve = function(contact, oldManifold) {

  }


  function handleMouseMove(e) {
    mouseX = (e.clientX - canvasPosition.x) / globalScale;
    mouseY = (e.clientY - canvasPosition.y) / globalScale;
  };

  function getBodyAtMouse() {
    mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.1, mouseY - 0.1);
    aabb.upperBound.Set(mouseX + 0.1, mouseY + 0.1);

    // Query the world for overlapping shapes.

    selectedBody = null;
    world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
  }

  function getBodyCB(fixture) {
    if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
      if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
        selectedBody = fixture.GetBody();
        return false;
      }
    }
    return true;
  }



  /* ------------------------------ MAIN UPDATE  ------------------------------ */


  function update() {


    mouseListener();

    world.Step(
      1 / 60 //frame-rate
      , 100 //velocity iterations
      , 10 //position iterations
    );


    function updateCanvas() {

      var bodies = world.GetBodyList();
      var bodyCount = world.GetBodyCount();

      canvas.width = canvas.width;
      context.save();
      context.lineWidth = 1 / (globalScale / 2);
      context.setTransform(globalScale, 0, 0, globalScale, 0, 0);
      context.strokeStyle = '#ffffff';

      // Mouse Rect
      if (!newShape) {
        context.save();
        context.translate(mouseX, mouseY);
        context.rotate(45 * Math.PI / 180);
        //context.arc(0, 0, squareSizeBig * 2 / globalScale,0,2*Math.PI);
        context.stroke();
        context.strokeRect(0 - (squareSizeBig / globalScale), 0 - (squareSizeBig / globalScale), squareSizeBig * 2 / globalScale, squareSizeBig * 2 / globalScale);
        context.restore();
      }


      // elem list
      for (var i = 0; i < bodyCount; i++) {

        var body = bodies.GetUserData();
        if (body && bodies.GetType() != 0) { // don't draw static shapes
          var position = bodies.GetPosition();

          context.save();
          context.translate(position.x, position.y);
          context.rotate(bodies.GetAngle());
          context.fillStyle = body.color;
          context.strokeStyle = body.color;

          context.beginPath();
          /*context.moveTo(0-(squareSize/globalScale),0-(squareSize/globalScale));
              context.lineTo(squareSize/globalScale,squareSize/globalScale);*/
          if (body.shape == 'rect') {
            context.rect(0 - (squareSize / globalScale), 0 - (squareSize / globalScale), squareSize * 2 / globalScale, squareSize * 2 / globalScale);
            context.fill();
          } else if (body.shape == 'strokeRect') {

            context.strokeRect(0 - (squareSizeBig / globalScale), 0 - (squareSizeBig / globalScale), squareSizeBig * 2 / globalScale, squareSizeBig * 2 / globalScale);
            //add tiny movment
            bodies.ApplyImpulse(new b2Vec2(randomFromTo(-0.01, 0.01), randomFromTo(-0.01, 0.01)), bodies.GetWorldCenter());
          }
          context.closePath();

          context.restore();
        }

        if (gravity == 0) {
          var fx = bodies.GetMass() * world.GetGravity().x;
          var fy = bodies.GetMass() * world.GetGravity().y;
          bodies.ApplyForce(new b2Vec2(-fx * 10, -fy * 10), bodies.GetWorldCenter());
        }
        // bodies.ApplyImpulse(new b2Vec2(randomFromTo(-0.05, 0.05),randomFromTo(-0.05, 0.05)), bodies.GetWorldCenter());

        bodies = bodies.GetNext();
      }

      context.restore();
    }

    //world.DrawDebugData(); 
    updateCanvas();
    world.ClearForces();



  };


  /* ------------------- BOX EXTEND METHODS ------------------------ */

  function createWall(x, y, sx, sy) {
    x = x / globalScale;
    y = y / globalScale;
    sx = sx;
    sy = sy / globalScale;

    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.Set(x, y);
    bodyDef.userData = {
      'width': sx * 2,
      'height': sy * 2
    };
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(sx, sy);
    var body = world.CreateBody(bodyDef).CreateFixture(fixDef);

  }


  function createNewShape(posX, posY, scale, rotation, type, color,isMain) {

    isMain = typeof isMain !== 'undefined' ? isMain : false;

    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(
      scale / globalScale //half width
      , scale / globalScale //half height
    );
    bodyDef.userData = {
      'color': color,
      'shape': type,
      'isMain' : isMain
    };
    bodyDef.position.x = posX;
    bodyDef.position.y = posY;
    bodyDef.angle = rotation * Math.PI / 180;
    world.CreateBody(bodyDef).CreateFixture(fixDef);



    return bodyDef;
  }

    //Extrend body

    b2Body.prototype.SetColor =  function(col) {
      this.m_userData.color = col;
    };


  var newShape = false;

  function mouseListener() {

    /* Shape Creation */

    if((mouseX*globalScale < canvas.width-80 && mouseY*globalScale < canvas.height-80)) {

    if (isMouseDown && !newShape) {
        createNewShape(mouseX, mouseY, squareSizeBig, 45, 'strokeRect', '#ffffff');
        newShape = true;
      } else if (!isMouseDown) {
        newShape = false
      }
    }
   

    if (isMouseDown && (!mouseJoint)) {
      var body = getBodyAtMouse();
      if (body) {
        var md = new b2MouseJointDef();
        md.bodyA = world.GetGroundBody();
        md.bodyB = body;
        md.target.Set(mouseX, mouseY);
        md.collideConnected = true;
        md.maxForce = 300.0 * body.GetMass();
        mouseJoint = world.CreateJoint(md);
        body.SetAwake(true);
      }
    }

    if (mouseJoint) {
      if (isMouseDown) {
        mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
      } else {
        world.DestroyJoint(mouseJoint);
        mouseJoint = null;
      }
    }
  }



  /* ------------------- RANDOM STUFF ------------------------ */


  //http://js-tut.aardon.de/js-tut/tutorial/position.html
  function getElementPosition(element) {
    var elem = element,
      tagname = "",
      x = 0,
      y = 0;

    while ((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
      y += elem.offsetTop;
      x += elem.offsetLeft;
      tagname = elem.tagName.toUpperCase();

      if (tagname == "BODY")
        elem = 0;

      if (typeof(elem) == "object") {
        if (typeof(elem.offsetParent) == "object")
          elem = elem.offsetParent;
      }
    }

    return {
      x: x,
      y: y
    };
  }


};



(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelRequestAnimationFrame = window[vendors[x] +
      'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}())



function getPosition(element) {    
  var xPosition = 0;    
  var yPosition = 0;      
  while (element) {        
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);        
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);        
    element = element.offsetParent;    
  }    
  return {
    x: xPosition,
    y: yPosition
  };
}


function randomFromTo(from, to) {
  return Math.random() * (to - from) + from;
}





/* ------------------------------------- ANALYTICS ------------------------------------ */


  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-26921492-7', 'auto');
  ga('send', 'pageview');



