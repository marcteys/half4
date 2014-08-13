window.onload= init;

window.onresize = resize;

var canvas = null;
var context = null;

var globalScale = 1.0;
var gravity = 0;

var squareSize = 30;

function resize() {
   canvas.width = canvas.offsetWidth;
   canvas.height = canvas.offsetHeight;
}

   function randomFromTo(from, to){
       return Math.random() * (to - from) + from;
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

   canvas  =  document.getElementById("canvas");
   context = canvas.getContext('2d');
   resize();

   var world = new b2World(
      new b2Vec2(0, 10) //gravity
      , true //allow sleep
   );

   var fixDef = new b2FixtureDef;
   fixDef.density = 1.0;
   fixDef.friction = 0.5;
   fixDef.restitution = 0.2;

   var bodyDef = new b2BodyDef;

   //create ground


   createWall(0,0,canvas.width,0.03);
   createWall(canvas.width,0,0.03,canvas.height);
   createWall(canvas.width / 2, canvas.height, canvas.width/2, 0.03);
   createWall(0,0,0.03,canvas.height);

   function createWall(x,y,sx,sy) {
      x = x/globalScale;
      y = y/globalScale;
      sx = sx;
      sy = sy/globalScale;

      bodyDef.type = b2Body.b2_staticBody;
         bodyDef.position.Set(x,y);
         bodyDef.userData = {
            'width':sx * 2,
            'height':sy * 2
         }  
         fixDef.shape = new b2PolygonShape;
         fixDef.shape.SetAsBox(sx,sy);
         var body = world.CreateBody(bodyDef).CreateFixture(fixDef);
   }



   //create some objects
   bodyDef.type = b2Body.b2_dynamicBody;
   for (var i = 0; i < 1; ++i) {
         fixDef.shape = new b2PolygonShape;
         fixDef.shape.SetAsBox(
            squareSize/globalScale //half width
            ,squareSize/globalScale  //half height
         );
      bodyDef.position.x = Math.random() * canvas.width/globalScale;
      bodyDef.position.y = Math.random() * canvas.height/globalScale;
      world.CreateBody(bodyDef).CreateFixture(fixDef);
   }

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

   //mouse

   var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
   var canvasPosition = getElementPosition(document.getElementById("canvas"));

   document.addEventListener("mousedown", function(e) {
      isMouseDown = true;
      handleMouseMove(e);
      document.addEventListener("mousemove", handleMouseMove, true);
   }, true);

   document.addEventListener("mouseup", function() {
      document.removeEventListener("mousemove", handleMouseMove, true);
      isMouseDown = false;
      mouseX = undefined;
      mouseY = undefined;
   }, true);

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

   //update

   function update() {

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

         
      world.Step(
          1 / 60   //frame-rate
          ,  10       //velocity iterations
          ,  10       //position iterations
      );



      function useCanvas(){
                 var bodies = world.GetBodyList();
        var bodyCount = world.GetBodyCount();

         canvas.width = canvas.width;
         context.save();
          context.strokeStyle = '#fff';
          context.fillStyle = '#fa653e';
          context.lineWidth = 1;
          // scale by 30 for box2d
          context.setTransform(globalScale, 0, 0, globalScale, 0, 0);
                    /*

          /*
          // shape bound to mouse
            context.save();
            context.translate(mouseX2,mouseY2);
            context.strokeRect((-10 / 2) * 2, (-10 / 2) / 2, 10 * 2, (10 / 2));
            context.restore();
                      */
          
          // elem list
          for(var i = 0; i < bodyCount; i++){
          
            var body = bodies.GetUserData();
            if(body && bodies.GetType() != 0){ // don't draw static shapes
                        
               var position = bodies.GetPosition();

//console.log(position.x)
                   context.save();
                   context.translate(position.x, position.y);             
                   context.rotate(bodies.GetAngle());
                     context.strokeRect((-10 / 2) * 2, (-10 / 2) / 2, 10 * 2, (10 / 2));
                   context.restore(); 
            }
                        
            if(gravity == 0){
               var fx = bodies.GetMass() * world.GetGravity().x;
               var fy = bodies.GetMass() * world.GetGravity().y;
               bodies.ApplyForce(new b2Vec2(-fx*10,-fy*10), bodies.GetWorldCenter());
            }  
            
               
               bodies.ApplyImpulse(new b2Vec2(randomFromTo(-0.05, 0.05),randomFromTo(-0.05, 0.05)), bodies.GetWorldCenter());

            bodies = bodies.GetNext();
          }   



         context.restore();

      }

      //useCanvas();
      world.DrawDebugData(); 

      world.ClearForces();
   };

   //helpers

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
       for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
           window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
           window.cancelRequestAnimationFrame = window[vendors[x]+
             'CancelRequestAnimationFrame'];
       } 
       if (!window.requestAnimationFrame)
           window.requestAnimationFrame = function(callback, element) {
               var currTime = new Date().getTime();
               var timeToCall = Math.max(0, 16 - (currTime - lastTime));
               var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                 timeToCall);
               lastTime = currTime + timeToCall;
               return id;
           };
       if (!window.cancelAnimationFrame)
           window.cancelAnimationFrame = function(id) {
               clearTimeout(id);
           };
   }())


