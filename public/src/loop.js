var scene;
var renderer;
var camera;
var raycaster;
var mouse;
var flagColor = true;
var geometry;
var material;
var lineWidth;
var font;
var iframe;
var panel;
var scale= 0.0001;
var canvasWidth = window.innerWidth - 25;
var canvasHeight = window.innerHeight - 25 - 50;
var posPanel = canvasWidth;
var staticShapes = [];
var tableCode = [[{obj : [], val:0, text:null, dirty:true, geom:[], mat:[]}, {obj : [], val:0, text:null, dirty:true, geom:[], mat:[]}, {obj : [], val:0,  text:null, dirty:true,geom:[], mat:[]}, {obj : [], val:0,  text:null, dirty:true, geom:[], mat:[]}],[
    {obj : [], val:0,  text:null, dirty:true, geom:[], mat:[]}, {obj : [], val:0,  text:null, dirty:true, geom:[], mat:[]}, {obj : [], val:0,  text:null, dirty:true, geom:[], mat:[]}, {obj : [], val:0,  text:null, dirty:true, geom:[], mat:[]}]];
var tableValue = [[3,2,1,1], [2,2,2,1], [2,1,2,2], [1,4,1,1], [1,1,3,2],
    [1,2,3,1], [1,1,1,4], [1,3,1,2],[1,2,1,3],[3,1,1,2]];
var insideLoop = false;
var timer = null;
var strValue = "00000000";
var childsPanel = [];
var dictionary = [["20170510", "Bodyfail"], ["20170611", "Traversée du silence"], ["20180611", "Magma"], ["20150611", "Dialogue synesthète"], ["20142111", "Génétype"], ["20170405", "The Enemy"], ["20171011", "Scan Pyramids VR"], ["20182406", "Karl"], ["20190605", "Semantic Emotions"]];

function changeColor(index, flagColor, val)
{
    if (flagColor)
        val.mat[index].color.set(0xffffff);
    else
        val.mat[index].color.set(0x000000);
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function createShapeDynamic(index, flagColor, indexTable, val)
{
    var shape = new THREE.Shape();

    //geometry.vertices.push(
    shape.moveTo(-canvasWidth / 2 + lineWidth * index, (canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * (index + 1), (canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * (index + 1), -(canvasWidth * 9 /16) / 2 + (canvasWidth * 9 / 16 / 5));
    shape.lineTo(-canvasWidth / 2 + lineWidth * index, -(canvasWidth * 9 /16) / 2 + (canvasWidth * 9 / 16 / 5));
    shape.lineTo(-canvasWidth / 2 + lineWidth * index, (canvasWidth * 9 /16) / 2);
    geometry = new THREE.ShapeBufferGeometry(shape);
    val.geom.push(geometry);
    if (flagColor === 0) {
        material = new THREE.MeshBasicMaterial({
            color:0x000000,
            side:THREE.DoubleSide
        });
        val.mat.push(material);
        var object = new THREE.Mesh(geometry, material);
        object.name = Math.random() * (index + indexTable);
        val.obj.push(object);
        scene.add(object);
    }
    else {
        material = new THREE.MeshBasicMaterial({
            color:0xffffff,
            side:THREE.DoubleSide
        });
        val.mat.push(material);
        var object = new THREE.Mesh(geometry, material);
        object.name = Math.random() * (index + indexTable);
        val.obj.push(object);
        scene.add(object);
    }
}

function onMouseDown(event)
{
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );
    // if (intersects.length === 0)
    //    return;
    var object = null;
    if (intersects.length > 0)
        object = intersects[0].object;
    for (var j = 0; j < tableCode.length; j++) {
        for(var i = 0; i < tableCode[j].length; i++) {
            for(var k = 0; k < tableCode[j][i].obj.length; k++) {
                if (tableCode[j][i].obj[k].name === object.name) {
                    tableCode[j][i].val = (tableCode[j][i].val + 1) % 10;
                    strValue[i + 4 * j] = tableCode[j][i].val;
                    tableCode[j][i].dirty = true;
                    break;
                }
            }
        }
    }
    console.log(tableCode);

    render();
}

function unzoom() {
    if (camera.zoom < 1)
    {    document.getElementById("button").onclick = match;
        document.getElementById("button").innerText = "MATCH";
        return;
    }
    else
        requestAnimationFrame(unzoom);
    camera.updateProjectionMatrix();
    camera.zoom -= 1;
    scale /= 1.095;
    iframe.style.zoom = scale;
    iframe.style.transform = ("scale(" + scale + ")");
    renderer.render(scene, camera);
}

function match() {
    var exists = false;
    for (var i = 0; i < childsPanel.length; i++)
    {
        if (childsPanel[i].value === strValue)
        {
            exists = true;
            break;
        }
    }
    if (!exists) {
        var val = document.getElementById("button").innerText;
        setTimeout(function(){
            document.getElementById("button").innerText = val;
        }, 2500);
        document.getElementById("button").innerText = "NO MATCH";
        return;
    }
    if (camera.zoom > 100)
    {
        document.getElementById("button").onclick = unzoom;
        document.getElementById("button").innerText = "X";
        return;
    }
    else
        requestAnimationFrame(match);
    camera.updateProjectionMatrix();
    camera.zoom += 1;
    scale *= 1.095;
    iframe.style.zoom = scale;
    iframe.style.transform = ("scale(" + scale + ")");
    renderer.render(scene, camera);
}

function panelDisparition() {
    if (posPanel <= canvasWidth && timer != null) {
        panel.style.left = (posPanel / canvasWidth * 100) + "%";
        posPanel += canvasWidth / 100 * 0.5;
        requestAnimationFrame(panelDisparition)
    }
    else
        timer = null;
}

function panelApparition()
{
    clearTimeout(timer);
    timer = null;
    insideLoop = true;
    if (posPanel > canvasWidth / 100 * 90)
    {
        panel.style.left = (posPanel / canvasWidth * 100) + "%";
        posPanel -= canvasWidth / 100 * 0.5;
        requestAnimationFrame(panelApparition);
    }
    else {
        timer = setTimeout(panelDisparition, 2500);
        insideLoop = false;
    }
}

function onMouseMove( event ) {
        if (!insideLoop && camera.zoom <= 2)
              panelApparition();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    render();
}

function render() {

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );
   // if (intersects.length === 0)
    //    return;
    var object = null;
    if (intersects.length > 0)
        object = intersects[0].object;
    //if (object.name === "")
    //    return;
    strValue = "";
    for (var k = 0; k < tableCode.length; k++)
    {
        for (var val of tableCode[k]) {
            strValue += val.val;
            if (val.dirty)
            {
                var index = 0;

                scene.remove(val.text);
                val.text.geometry.dispose();
                val.text.material.dispose();
                var geom = new THREE.TextGeometry(val.val + "", {
                    font: font,
                    size: 80,
                    height: 1,
                    curveSegments : 24
                } );
                var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
                var mesh = new THREE.Mesh(geom, material ) ;
                mesh.translateX(val.text.position.x);
                mesh.translateY(val.text.position.y);
                scene.add(mesh);
                val.text = mesh;
                val.dirty = false;
                for (var i = 0; i < tableValue[val.val].length; i++) {

                    if (i % 2 === 0 && k === 0 || i % 2 === 1 && k === 1) {
                        for (var j = 0; j < tableValue[val.val][i]; j++) {
                            changeColor(index, 0, val);
                            index++;
                        }
                    } else {
                        for (var l = 0; l < tableValue[val.val][i]; l++) {
                            changeColor(index, 1, val);
                            index++;
                        }
                    }
                }
            }
        }

    }
    for (var j = 0; j < tableCode.length; j++) {
        for(var i = 0; i < tableCode[j].length; i++) {
            for(var k = 0; k < tableCode[j][i].obj.length; k++) {
                if ((object === null || tableCode[j][i].obj[k].name !== object.name) && tableCode[j][i].mat[k].color.b !== 1.0) {
                    tableCode[j][i].mat[k].color.set(0x000000);
                }
                else if (object !== null && tableCode[j][i].obj[k].name === object.name) {
                    for(var l = 0; l < tableCode[j][i].obj.length; l++)
                        if (tableCode[j][i].mat[l].color.b !== 1.0)
                            tableCode[j][i].mat[l].color.set(0xff0000);
                    break;
                }
            }
        }
    }

    renderer.render( scene, camera );

}


function createShape(index, flagColor)
{
    var shape = new THREE.Shape();

    //geometry.vertices.push(
    shape.moveTo(-canvasWidth / 2 + lineWidth * index, -(canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * (index + 1), -(canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * (index + 1), (canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * index, (canvasWidth * 9 /16) / 2);
    shape.lineTo(-canvasWidth / 2 + lineWidth * index, -(canvasWidth * 9 /16) / 2);
    geometry = new THREE.ShapeBufferGeometry(shape);
    if (flagColor === 0) {
        material = new THREE.MeshBasicMaterial({
            color:0x000000,
            side:THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        staticShapes.push(mesh);
        scene.add(mesh);
    }
    else {
        material = new THREE.MeshBasicMaterial({
            color:0xffffff,
            side:THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        staticShapes.push(mesh);
        scene.add(mesh);
    }
}

function release()
{
    for (var j = 0; j < tableCode.length; j++) {
        for(var i = 0; i < tableCode[j].length; i++) {
            scene.remove(tableCode[j][i].text);
            tableCode[j][i].text.geometry.dispose();
            tableCode[j][i].text.material.dispose();
            while (tableCode[j][i].obj.length > 0) {
                tableCode[j][i].mat[0].dispose();
                tableCode[j][i].geom[0].dispose();
                scene.remove(tableCode[j][i].obj[0]);
                tableCode[j][i].obj.shift();
                tableCode[j][i].mat.shift();
                tableCode[j][i].geom.shift();
            }
        }
    }
    while (staticShapes.length > 0)
    {
        scene.remove(staticShapes[0]);
        staticShapes[0].geometry.dispose();
        staticShapes[0].material.dispose();
        staticShapes.shift();
    }
    while (childsPanel.length > 0)
    {
        panel.removeChild(childsPanel[0]);
        childsPanel.shift();
    }
    scale = 0.0001;
    iframe.style.zoom = scale;
    iframe.style.transform = ("scale(" + scale + ")");
    document.getElementById("canvas").removeChild(renderer.domElement);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    scene.dispose();
    renderer.dispose();
}

function onWindowResize() {
    window.removeEventListener('resize', onWindowResize, false)
    renderer.domElement.removeEventListener( 'mousemove', onMouseMove, false );
    renderer.domElement.removeEventListener( 'mousedown', onMouseDown, false );
    release();
    init();
}

function changeValue(value)
{
    strValue = value;
    for (var j = 0; j < tableCode.length; j++) {
        for (var k = 0; k < tableCode[j].length; k++)
        {
            tableCode[j][k].val = parseInt(value[k + 4 * j]);
            tableCode[j][k].dirty = true;
        }
    }
    console.log(tableCode);
    render();
}

function noScroll() {
    window.scrollTo(0, 0);
}

function init()
{
    canvasWidth = window.innerWidth - 25;
    canvasHeight = window.innerHeight - 25 - 50;
    iframe = document.getElementById("content");
    iframe.style.zoom = scale;
    iframe.style.transform = ("scale(" + scale + ")");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.01, 1000);
    //camera = new THREE.OrthographicCamera(-canvasWidth / 2, canvasWidth / 2, -canvasHeight / 2, canvasHeight / 2, 0.01, 10000);
    camera.position.set(0, 0, 900);
    renderer = new THREE.WebGLRenderer();
    renderer.clearColor(new THREE.Color(0xffffff));
    renderer.setSize(canvasWidth, canvasHeight);
    document.getElementById("canvas").appendChild(renderer.domElement);
    lineWidth = canvasWidth / 67;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var loader = new THREE.FontLoader();
    loader.load( 'fonts/Coolvetica Rg_Regular.json', function ( fontLoad ) {
        font = fontLoad
        var index = 0;
        for (var k = 0; k < 3; k++)
        {
            createShape(index, k % 2);
            index++;
        }
        for (var val of tableCode[0])
        {
            var geom = new THREE.TextGeometry(val.val + "", {
                font: font,
                size: canvasWidth / 20,
                height: 1,
                curveSegments : 24
            } );
            var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
            var mesh = new THREE.Mesh( geom, material ) ;
            mesh.translateX(-canvasWidth / 2 + lineWidth * index + lineWidth * 3);
            mesh.translateY(-(canvasWidth * 9 / 16 / 1.2) / 2);
            scene.add(mesh);
            val.text = mesh;
            val.dirty = false;
            for (var i = 0; i < tableValue[val.val].length; i++)
            {

                if (i % 2 === 0)
                {
                    for (var j = 0; j < tableValue[val.val][i]; j++) {
                        createShapeDynamic(index, 0, 0, val);
                        index++;
                    }
                }
                else
                {
                    for (var l = 0; l < tableValue[val.val][i]; l++)
                    {
                        createShapeDynamic(index, 1, 0, val);
                        index++;
                    }
                }
            }
        }
        createShape(index, 1);
        index++;
        createShape(index, 0);
        index++;
        createShape(index, 1);
        index++;
        createShape(index, 0);
        index++;
        createShape(index, 1);
        index++;
        for (var val of tableCode[1])
        {
            var geom = new THREE.TextGeometry(val.val + "", {
                font: font,
                size: canvasWidth / 20,
                height: 1,
                curveSegments : 24
            } );
            var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
            var mesh = new THREE.Mesh( geom, material ) ;
            mesh.translateX(-canvasWidth / 2 + lineWidth * index + lineWidth * 3);
            mesh.translateY(-(canvasWidth * 9 / 16 / 1.2) / 2);
            scene.add(mesh);
            val.text = mesh;
            val.dirty = false;

            for (var n = 0; n < tableValue[val.val].length; n++)
            {
                if (n % 2 === 1)
                {
                    for (var o = 0; o < tableValue[val.val][n]; o++)
                    {
                        createShapeDynamic(index, 0, 1, val);
                        index++;
                    }
                }
                else
                {
                    for (var p = 0; p < tableValue[val.val][n]; p++)
                    {
                        createShapeDynamic(index, 1, 1, val);
                        index++;
                    }
                }
            }
        }
        for (var m = 0; m < 3; m++)
        {
            createShape(index, m % 2);
            index++;
        }
        document.getElementById("button").innerText = "MATCH";
        renderer.render(scene, camera);

        panel = document.getElementById("panel");
        while (childsPanel.length > 0)
        {
            panel.removeChild(childsPanel[0]);
            childsPanel.shift();
        }
        window.addEventListener('resize', onWindowResize, false)
        renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
        renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
        window.addEventListener('scroll', noScroll);
        httpGetAsync("/files", function(files)
        {
            files = JSON.parse(files);
            for (var i = 0; i < files.length; i++)
            {
                if (files[i].includes(".html"))
                {
                    var str = files[i].substring(0, files[i].length - 5);
                    var currentStr = (' ' + str).slice(1);
                    var element = document.createElement("button");
                    //Assign different attributes to the element.
                    element.id = str;
                    element.setAttribute("style","width:100%; max-height : 20%");
                    element.innerText = str;
                    for (var j = 0; j < dictionary.length; j++)
                    {
                        if (dictionary[j][0] === str)
                            element.innerText = dictionary[j][1];
                    }
                    element.type = "button";
                    element.value = str;
                    element.name = str;
                    element.onclick = function(index) {
                        return function () {
                            changeValue(index);
                            iframe.src = index + ".html";
                        };
                    }(str);
                    childsPanel.push(element);
                    panel.appendChild(element);
                }
            }
        });
    } );



// add listener to disable scroll

    //window.requestAnimationFrame(render);
}