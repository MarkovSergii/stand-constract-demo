/**
 * Created by user on 24.02.2017.
 */
let standBuilding = angular.module('standBuilding',['ngDraggable']);


const CANVAS_SIZE = Math.floor(window.innerWidth*0.4563984674329502)-125


function selectAllCanvasObjects(canvas){
    var objs = canvas.getObjects().map(function(o) {
        return o.set('active', true);
    });

    var group = new fabric.Group(objs, {
        originX: 'center',
        originY: 'center'
    });

    canvas._activeObject = null;

    canvas.setActiveGroup(group.setCoords()).renderAll();
    canvas.deactivateAll().renderAll();
}

var canvasCenter = new fabric.Point(Math.floor(CANVAS_SIZE/2), Math.floor(CANVAS_SIZE/2)); // center of canvas


let rotate = (canvas,angle) =>{

    canvas.getObjects().forEach(function (obj) {
        var objectOrigin = new fabric.Point(obj.left, obj.top);
        var new_loc = fabric.util.rotatePoint(objectOrigin, canvasCenter, fabric.util.degreesToRadians(angle));
        obj.top = new_loc.y;
        obj.left = new_loc.x;
        obj.angle += angle; //rotate each object buy the same angle
        canvas.renderAll();
    });
    selectAllCanvasObjects(canvas)
};

let createCanvas = ({height,width,type})=>
    new Promise((resolve,reject)=>{
        try{

            let maxValue = (height > width) ? height : width;

            let metersInPx = (CANVAS_SIZE - 10) / maxValue;

            var canvas = new fabric.Canvas('c');
            canvas.setHeight(CANVAS_SIZE);
            canvas.setWidth(CANVAS_SIZE)

            canvas.metersInPx = metersInPx;
            // draw grid
            for (var i = 0; i < height+1; i++) {
                canvas.add(new fabric.Line([ i * metersInPx, 0, i * metersInPx, metersInPx*width], { stroke: '#ccc', selectable: false }));
            }

            for (var i = 0; i < width+1; i++) {
                canvas.add(new fabric.Line([ 0, i * metersInPx,  metersInPx*height, i * metersInPx], { stroke: '#ccc', selectable: false }));
            }
            // draw walls
            if (type == '1') {
                canvas.add(new fabric.Line([-10, 0, metersInPx*height-5, 0], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
                canvas.add(new fabric.Line([0, -10, 0,metersInPx*width-5], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
                canvas.add(new fabric.Line([metersInPx*height, -10, metersInPx*height,metersInPx*width-5], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
            }
            if (type == '2') {
                canvas.add(new fabric.Line([-10, 0, metersInPx*height-5, 0], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
                canvas.add(new fabric.Line([metersInPx*height, -10, metersInPx*height,metersInPx*width-5], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
            }
            if (type == '3') {
                canvas.add(new fabric.Line([-10, 0, metersInPx*height-5, 0], {fill:'#375cba', stroke: '#375cba',strokeWidth:10, selectable: false }));
            }

            resolve(canvas)
        }
        catch(e){
            reject(e)
        }
    })



let itemFilter = ()=>
    (items,scope) =>
        items.filter((item)=>{
            if ((item.name.toUpperCase().includes(scope.search.toUpperCase())) || (item.category.toUpperCase().includes(scope.search.toUpperCase())))
                return item
        })



standBuilding.filter('itemFilter',itemFilter);


let addItemToCanvas = ({canvas,item})=>{

    fabric.Image.fromURL(item.shema, function(oImg) {
        oImg.set({
            width: item.width*canvas.metersInPx,
            height: item.length*canvas.metersInPx,
        });

        oImg.itemId = item.id;
        oImg.setControlsVisibility({
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mt: false,
            mb: false,
            mr: false,
            ml: false
        });

        canvas.add(oImg);
    });
}


let mainCtrl = ($scope)=>{

    $scope.isNewStand = false;
    $scope.isLoaded = false;
    $scope.isObjectSelected = true;
    $scope.search = '';
    $scope.items = items;

    $scope.setZoom = (newZoomLevel) => {
        $scope.data.zoomrange = newZoomLevel;
        let zoomLevel = newZoomLevel;
        $scope.canvas.setZoom(zoomLevel);

        $scope.canvas.setDimensions({
            width: CANVAS_SIZE * zoomLevel,
            height: CANVAS_SIZE * zoomLevel
        });
    }



    $scope.data = {range:1}

    $scope.resetZoom = () => {

        $scope.canvas.setZoom(1);

        $scope.canvas.setDimensions({
            width: CANVAS_SIZE,
            height: CANVAS_SIZE
        });
        $scope.data.zoomrange = 1.0;



    }


    $scope.onDropComplete = (data,evt) =>
        addItemToCanvas({canvas:$scope.canvas,item:data.item})


    $scope.newStand = ()=>{
        $scope.isNewStand = true;
    }

    $scope.rotateToLeft = ()=>{
        rotate($scope.canvas,270)
    }

    $scope.rotateToRight = ()=>{
        rotate($scope.canvas,90)
    }

    $scope.newStandCancel = ()=>{
        $scope.isNewStand = false;
    }        
    
    $scope.clearCanvas = ()=>{
        $scope.isLoaded = false;
        $scope.canvas.dispose();
    }

    $scope.addCanvasListeners = ()=>{
        $scope.canvas.on('object:selected',(data)=>{
            console.log(data);
        })
    }

    $scope.newStandConfirm = ()=>
       createCanvas({height:$scope.newStand.hgt,width:$scope.newStand.wdt,type:$scope.newStand.type})
           .then((canvas)=>{
               $scope.canvas = canvas;
               $scope.startPosition = {
                   height:$('#canvaspanel')[0].clientHeight-30,
                   width:$('#canvaspanel')[0].clientWidth-30
               }
               $scope.isNewStand = false;
               $scope.isLoaded = true;
               $scope.addCanvasListeners();
               $scope.$apply();
           })
           .catch(console.log)


    $scope.checkStandParams = ()=>{
        let error = false
        if (!$scope.newStand.type) error = true

        if ((!$scope.newStand.hgt) || (!$scope.newStand.wdt)) error = true
        else
            try{

                $scope.newStand.hgt = parseInt($scope.newStand.hgt)
                $scope.newStand.wdt = parseInt($scope.newStand.wdt)
            }
            catch(e){
                error = true
            }

        return error
    }

}


standBuilding.controller('mainCtrl',mainCtrl)