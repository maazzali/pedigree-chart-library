'use strict'

class Pedigree {
    /**
     *It makes a new instance of Pedigree and all default configuration variables are initialized in constructor.
     * You can send your own configurations as a parameter when initiating the instance.
     * @param {JSON} config - A JSON object which stores key-value pairs of all the configuration variables. 'domId' is a required field which stores the id of SVG.
     * Other fields that can be set in object include depth, objHeight, objWidth, objRadius, xSpacing, ySpacing, topMargin,
     * leftMargin, objClick(function), imgDir(string), paperWidth, paperHeight.
     */
    constructor(config) {
        this.domId = config.domId ? config.domId : 'svg';
        this.depth = config.depth ? config.depth : 3;
        this.height = config.objHeight ? config.objHeight : 60;
        this.width = config.objWidth ? config.objWidth : 60;
        this.radius = config.objRadius ? config.objRadius : 30;
        this.spacing = config.xSpacing ? config.xSpacing : 50;
        this.spacingVertical = config.ySpacing ? config.ySpacing : 30;
        this.marginTop = config.topMargin ? config.topMargin : 0;
        this.marginLeft = config.leftMargin ? config.leftMargin : 0;
        this.clickFunction = config.objClick ? config.objClick : function () {};
        this.directory = config.imgDir ? config.imgDir : 'img/';
        this.lineStyle = {'stroke': '#999'};
        this.maleStyle = {fill: '#39a3dd', 'stroke-width': 0};
        this.femaleStyle = {fill: '#e45255', 'stroke-width': 0};
        this.unknownStyle = {fill: '#5acf7d', 'stroke-width': 0, transform: '...R45'};
        this.abortionStyle = {fill: '#999', 'stroke-width': 0};
        this.pWidth = config.paperWidth ? config.paperWidth : 600;
        this.pHeight = config.paperHeight ? config.paperHeight : 400;
        this.panzoom = {};
        this.relations={};
        this.dragTool=null;
        this.paper = Snap(this.domId);
    }

    /**
     * This function is called to clear the SVG. It destroys the panzoom instance and clears the paper so that it can be drawn again.
     */
    clear() {
        const _this = this;
        _this.panzoom.destroy();
        delete _this.panzoom;
        _this.paper.clear();
    }

    /**
     *This function is called to add data after the Pedigree instance is made. You can also call this function after you have cleared the SVG.
     * It adds the relations JSON to a global variable and passes to create func too which further call other functions.
     * @param {JSON} relations - a JSON object which stores all the family relations. Refer to the format and rules of JSON.
     */
    addData(relations) {
        this.relations=relations;
        this._create(relations, this.depth);
    }

    /**
     *This function is called last when everything is drawn. It adds the popover elements and hides the popover by default or on mouseleave.
     *It also adds the pan and zoom functionality to SVG.
     * @param {boolean} fitPedigree - If it is true then the pedigree exceeds the SVG width or height otherwise it doesn't.
     */
    addPopover(fitPedigree){
        const _this=this;

        _this.toolBackground = _this.paper.rect(0, 0, 190, 120).attr({ fill: '#fff' , 'fill-opacity':'0'});
        _this.toolRect = _this.paper.rect(0, 0, 190, 89, 5).attr({ fill: '#fff' });
        _this.toolTriangle = _this.paper.polygon([35, 89, 45, 89, 40, 97]).attr({ fill: '#fff', stroke: '#fff' });
        _this.toolText = _this.paper.text(65, 30, '').attr({ fill: '#384047', stroke: '#384047' });
        _this.toolSubText = _this.paper.text(65, 45, '').attr({ fill: '#c7cfd1', stroke: '#c7cfd1' });
        _this.toolEdit = _this.paper.text(65, 75, 'Edit').attr({ fill: '#5ad07d', stroke: '#5ad07d', cursor:'pointer' }).click(_this.clickFunction);
        _this.toolOpen = _this.paper.text(110, 75, 'Open Chat').attr({ fill: '#39a3dd', stroke: '#39a3dd' , cursor:'pointer'});

        let maskingCircle = _this.paper.circle(35,35,20).attr({ stroke: 'silver', fill: 'silver' });

        _this.toolImage = _this.paper.image(_this.directory+"profile.png", 15, 15, 40, 40).attr({'border-radius': '50%',mask: maskingCircle});
        _this.dragTool = _this.paper.group(_this.toolBackground, _this.toolRect, _this.toolText, _this.toolImage, _this.toolTriangle, _this.toolSubText, _this.toolEdit, _this.toolOpen).addClass('gtooltip');

        _this.dragTool.attr({display:'none'});

        let x = document.getElementsByClassName("gtooltip");
        x[0].onmouseleave = function () {
            _this.dragTool.attr({display: 'none'});
        };

        function beforePan(oldPan, newPan) {
            let stopHorizontal = false,
                stopVertical = false,
                gutterWidth = 200,
                gutterHeight = 200,

            // Computed variables
                sizes = this.getSizes(),
                leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth,
                rightLimit = sizes.width - gutterWidth - sizes.viewBox.x * sizes.realZoom,
                topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight,
                bottomLimit = sizes.height - gutterHeight - sizes.viewBox.y * sizes.realZoom;

            let customPan = {};
            customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
            customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

            return customPan;
        }

        _this.panzoom = svgPanZoom(this.domId, {
            viewportSelector: '.svg-pan-zoom_viewport',
            panEnabled: true,
            controlIconsEnabled: true,
            zoomEnabled: true,
            dblClickZoomEnabled: false,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: true,
            zoomScaleSensitivity: 0.3,
            minZoom: 0.5,
            maxZoom: 3,
            fit: fitPedigree,
            contain: false,
            center: true,
            refreshRate: 'auto',
            beforeZoom: function beforeZoom() {
            },
            onZoom: function onZoom() {
            },
            beforePan: beforePan,
            onPan: function onPan() {
            },
            eventsListenerElement: null
        });

    }

    /**
     *It updates the Popover on every hover. This function is called everytime we hover over the element. It recieves the coordinates and personal data as parameters.
     * @param {number} xCord - x-coordinate of the element being hovered.
     * @param {number} yCord - y-coordinate of the element being hovered.
     * @param {JSON} pData - The personal data such as name relation etc. of the hovered element which needs to be updated on popover.
     */
    updatePopover(xCord, yCord, pData) {
        let pRelation;
        const _this=this;
        if (pData.hasOwnProperty('relationship')) {
            pRelation = pData.relationship.displayName;
        }
        else {
            pRelation = 'You';
        }
        switch (pData.gender) {
            case 'male':
                this.toolImage.attr({href: _this.directory+'male1.png'});
                break;
            case 'female':
                this.toolImage.attr({href: _this.directory+'female1.png'});
                break;
            default:
                this.toolImage.attr({href: _this.directory+'unknown.png'});
        }
        this.toolText.attr({text: pData.name});
        this.toolSubText.attr({text: pRelation});
        this.toolEdit.data('patientData', pData);
        this.dragTool.animate({'transform': 't' + (xCord - 20) + ',' + (yCord - 115)}, 1);
    }

    /**
     *This function goes through the Proband's siblings to search for their children.
     * @returns {{siblings1: boolean, siblings2: boolean}} Returns true if it has sibings else returns false.
     */
    getSiblingChildren(){
        let _self=this;
        let count1=0;
        let count2=0;
        let returnSibling1=true;
        let returnSibling2=true;

        if( _self.relations.siblings1)
        {
            _self.relations.siblings1.forEach((dat) => {

                _self.sort(dat, function (inElement) {
                    count1++;
                });
            });
            if(count1 >  _self.relations.siblings1.length)
            {
                returnSibling1=false;
            }
        }

        if( _self.relations.siblings2)
        {
            _self.relations.siblings2.forEach((dat) => {

                _self.sort(dat, function (inElement) {
                    count2++;
                });
            });
            if(count2 >  _self.relations.siblings2.length)
            {
                returnSibling2=false;
            }
        }
        return{
            siblings1:returnSibling1,
            siblings2:returnSibling2
        }

    }

    /**
     *This is the most important function because the control comes here after we add data and then this function calls all other functions stepwise.
     * @param {JSON} inAncestors - Relations data JSON oblect.
     * @param {number} inDepth - Depth of parents tree.
     * @returns {*} Returns the draw function when everything is done and we have data and lines array.
     */
    _create(inAncestors, inDepth) {
        let left;
        let returnObject;
        let data = [];
        let lines = [];
        let _this=this;

        let parentTwin = {
            fatherTwin:false,
            motherTwin:false
        };


        let pedigree = this.render(inAncestors.pedigree);
        let pedigreeData = pedigree.data;
        let pedigreeLines = pedigree.lines;
        let pedRightOffset = pedigree.rightOffset;
        let pedLeftOffset = pedigree.leftOffset;

        // left of proband is half of width and spacing
        left = (this.width + this.spacing) - (this.width + this.spacing) / 2;

        let sibCount1=0;
        let sibCount2=0;
        if(inAncestors.siblings1)
        {
            sibCount1=inAncestors.siblings1.length;
            if(inAncestors.pedigree.hasOwnProperty('spouses') &&inAncestors.pedigree.data.gender ==='female')
            {
                sibCount1++;
            }
            left=left + ((sibCount1/2)* (this.width + this.spacing));
        }
        if(inAncestors.siblings2)
        {
            sibCount2=inAncestors.siblings2.length;
            if(inAncestors.pedigree.hasOwnProperty('spouses') &&inAncestors.pedigree.data.gender ==='male')
            {
                sibCount2++;
            }
            left=left - ((sibCount2/2)* (this.width + this.spacing));
        }
        // add that left value to each element from pedigree


        pedigreeData.forEach((dat) => {
            dat.left += left;
            dat.top += 0;
        });

        pedigreeLines.forEach((line) => {
            line.left += left;
            line.top += 0;
        });

        // line on top of element #1
        let siblingTwin = false;
        if (inAncestors.pedigree.data.twin) {
            siblingTwin = true;
        }
        else {
            //draw line if parents exist else not
            if(inAncestors.mother) {
                //vertical line on top of proband
                lines.push({
                    left: left + this.width / 2,
                    top: -this.spacingVertical,
                    data: {
                        orientation: 'vertical',
                        len: this.spacingVertical
                    }
                });
            }
        }

        data = data.concat(pedigreeData);
        lines = lines.concat(pedigreeLines);

        // space right of possible new elements to element #1
        let rightSpace = pedLeftOffset + (this.width+this.spacing)/2;
        let fatherSibSpace=0;
        // siblings1 (siblings left of element #1)
        if (inAncestors.siblings1){

            returnObject = this.siblings(inAncestors.siblings1, left, 0, rightSpace, 'left', siblingTwin);
            data = data.concat(returnObject.data);
            lines = lines.concat(returnObject.lines);
            rightSpace = returnObject.space;
        }
        if(inAncestors.father) {
            parentTwin.fatherTwin= inAncestors.father.data.twin;
            if (inAncestors.father.spouses) {
                returnObject = this.halfSiblings(inAncestors.father, left, 0, rightSpace, 'left');

                data = data.concat(returnObject.data);
                lines = lines.concat(returnObject.lines);
                rightSpace = returnObject.space;
                fatherSibSpace = rightSpace;
            }
        }
        let lastFatherSibling=0;
        let fatherLeft=0;
        // fatherSiblings (siblings of the father of element #1, they are left of father)
        if (inAncestors.fatherSiblings) {

            // Left of father is always zero
            fatherLeft = 0;

            let sibSpouse=false;
            inAncestors.fatherSiblings.forEach((sib)=>{
                if(sib.spouses){
                    sibSpouse=true;
                    fatherSibSpace = rightSpace;
                }
            });
            if(fatherSibSpace === 0 ) {
                //Initial offset for 1st sibling on left of father.
                fatherSibSpace += (_this.width + _this.spacing)/2;
            }else{
                //IF Father half siblings are present then fatherSibSpace>0 and we need to align it according to proband's left.
                fatherSibSpace += fatherLeft - left;
            }
            // inTop for part is negative height of elements plus spacing (relative to top of element #1)
            returnObject = this.siblings(inAncestors.fatherSiblings, fatherLeft, -(this.height + this.spacingVertical * 2),fatherSibSpace , 'left', parentTwin.fatherTwin);

            data = data.concat(returnObject.data);
            lines = lines.concat(returnObject.lines);
            // rightSpace = returnObject.space;
            lastFatherSibling=returnObject.lastSib;
        }
        let fatherParentsOffset=0;
        if(lastFatherSibling!=0)
        {
            fatherParentsOffset=fatherLeft+(lastFatherSibling-fatherLeft)/2 -(_this.width + _this.spacing)/2;
        }


        // now the other side
        // we start with the same space here
        let leftSpace = pedRightOffset + (this.width+this.spacing)/2;
        let lastSibling;
        let MotherSibSpace = 0;
        //siblings2 (siblings on the right)
        if (inAncestors.siblings2) {
            returnObject = this.siblings(inAncestors.siblings2, left, 0, leftSpace, 'right', siblingTwin);

            data = data.concat(returnObject.data);
            lines = lines.concat(returnObject.lines);
            leftSpace = returnObject.space;
            lastSibling = returnObject.lastSib;
        }
        if(inAncestors.mother) {
            parentTwin.motherTwin= inAncestors.mother.data.twin;
            if (inAncestors.mother.spouses) {
                returnObject = this.halfSiblings(inAncestors.mother, left, 0, leftSpace, 'right');

                data = data.concat(returnObject.data);
                lines = lines.concat(returnObject.lines);
                leftSpace = returnObject.space;
                lastSibling = returnObject.lastSib;
                MotherSibSpace = leftSpace;
            }
        }
        let lastMotherSibling=0;
        let motherLeft=0;
        // motherSiblings
        if (inAncestors.motherSiblings) {
            //add mother to the right of father who's left is 0.
            motherLeft =  (this.width + this.spacing);

            let sibSpouse=false;
            inAncestors.motherSiblings.forEach((sib)=>{
                if(sib.spouses){
                    sibSpouse=true;
                    MotherSibSpace = leftSpace;
                }
            });

            if(MotherSibSpace === 0) {
                //Initial offset for 1st sibling on right of mother.
                MotherSibSpace += this.width+(this.width + this.spacing)/2;
            }else{
                //If mother half Siblings are present then sib space >0 so we align it according to proband's left.
                MotherSibSpace +=left-motherLeft;
            }

            // inTop for part is the same as for fatherSiblings
            returnObject = this.siblings(inAncestors.motherSiblings, motherLeft, -(this.height + this.spacingVertical * 2), MotherSibSpace, 'right', parentTwin.motherTwin);

            data = data.concat(returnObject.data);
            lines = lines.concat(returnObject.lines);
            lastMotherSibling=returnObject.lastSib;
        }
        let motherParentsOffset=0;
        if(lastMotherSibling!=0)
        {
            motherParentsOffset=motherLeft+(lastMotherSibling-motherLeft)/2 -(_this.width + _this.spacing)/2;
        }

        returnObject = this.myAncestors(inAncestors, inDepth,motherParentsOffset,fatherParentsOffset);
        data = data.concat(returnObject.data);
        lines = lines.concat(returnObject.lines);
        return this.draw(data, lines);
    }

    /**
     *This function adds parents and grand parents above proband. Parents are center aligned over proband's siblings and grand parents are also in the center accordingly.
     * @param {JSON} inAncestors - Relations data JSON oblect.
     * @param {number} inDepth - Depth of parents tree i.e. how many generations we need to show.
     * @param {number} motherOffset - mother offset is the space between mother and last mother sibling. It is used to center align the mother parents.
     * @param {number} fatherOffset - father offset is the space between father and last father sibling. It is used to center align the father parents.
     * @returns {{data: Array, lines: Array}} It returns the data and lines for parents and grand parents.
     */
    myAncestors(inAncestors, inDepth, motherOffset,fatherOffset) {
        const _self = this;
        let ancestorsArr = new Array(inDepth);
        ancestorsArr[0] = [inAncestors];
        let actualDepth;
        let depthFound = false;
        // put ancestorsArr in array of arrays and go in depth
        ancestorsArr.forEach((arr, arrIndex, ancestorsArr) => {

            let emptyLevel = true;
            arr.forEach((ancestor, ancIndex) => {

                let levelAncestors = [];

                if (ancestor.father) {
                    levelAncestors.push(ancestor.father);
                    emptyLevel = false;
                }
                if (ancestor.mother) {
                    levelAncestors.push(ancestor.mother);
                    emptyLevel = false;
                }
                if(levelAncestors.length>0)
                {
                    //Put Mother and father elements in different arrays
                    ancestorsArr[arrIndex + 1+ ancIndex] = levelAncestors;
                }

            });
            if (!depthFound && emptyLevel) {
                actualDepth = arrIndex;
                depthFound = true;
            }

        });
        if (!actualDepth) {
            actualDepth = inDepth;
        }
        //initial sibling count is one because of proband's mother and father
        let fatherSib=1;
        let motherSib=1;
        //save the mother and father Siblings count for centering grandparents
         if(inAncestors.hasOwnProperty('fatherSiblings'))
         {
             fatherSib=inAncestors.fatherSiblings.length+1 ;

         }
         if(inAncestors.hasOwnProperty('motherSiblings'))
         {
             motherSib=inAncestors.motherSiblings.length+1;
         }

        let siblingOffset=false;
        let data = [];
        let lines = [];

        // ancestorsArr begins now with topmost level
        ancestorsArr.reverse();

        // Pop the First element data inserted
        ancestorsArr.pop();
        //Reverse the array because we need to move from down to up
        ancestorsArr.reverse();

        let level =1;

        ancestorsArr.forEach((arr, arrIndex) => {
            arr.forEach((ancestor, ancestorInd) => {
                let len = _self.spacing;
                let left;

                if(arrIndex ==0)
                {
                    //For proband's Parents

                    left = (_self.width + _self.spacing) *  (ancestorInd);
                    //If depth is greater than 1
                    if((fatherSib === 1 || motherSib === 1)  && actualDepth>1  )
                    {
                        //When mother and father both or one of them doesn't have siblings
                        left = (_self.width + _self.spacing) *  ((Math.pow(2, ancestorInd)) *ancestorInd) -(_self.width + _self.spacing)/2;

                        if(ancestorInd>0 && (fatherSib === 1  || motherSib === 1) ){
                            //When only mother or father one of them has siblings
                            motherSib++;
                            fatherSib++;
                            len = (_self.width+_self.spacing)*2 -_self.width;
                        }
                    }

                }
                else{
                    level=2;
                    //For Mother's parents cantered above mother Siblings
                    //left = (_self.width + _self.spacing) *  (ancestorInd+(motherSib)/2);
                    if(motherOffset)
                    {
                        left=motherOffset+  (ancestorInd*(_self.width + _self.spacing));
                    }else{
                        left = (_self.width + _self.spacing) *  (ancestorInd+(motherSib)/2);

                    }

                    if(arrIndex <2)
                    {
                        //For Father's parents cantered above Father Siblings
                        if(fatherOffset){
                            left=fatherOffset+  (ancestorInd*(_self.width + _self.spacing));
                        }else{
                            left = (_self.width + _self.spacing) *  (ancestorInd -(fatherSib)/2);

                        }

                    }

                }
                data.push({
                    left: left,
                    top: -level * (_self.height + _self.spacingVertical * 2),
                    data: ancestor.data
                });

                if (ancestorInd === 1) {
                    //horizontal line on left of mother only
                    lines.push({
                        left: left  -len ,
                        top: -level * (_self.height + _self.spacingVertical * 2) - 30 + (_self.height ),
                        data: {
                            orientation: 'horizontal',
                            len: len
                        }
                    });
                    lines.push({
                        left: left- len / 2,
                        top: -level * (_self.height + _self.spacingVertical * 2)- 30 + (_self.height ) ,
                        data: {
                            orientation: 'vertical',
                            len: _self.spacingVertical + _self.height / 2
                        }
                    });
                }
                if (arrIndex === 0 && actualDepth>1 && ancestor.mother && !ancestor.data.twin) {
                    lines.push({
                        left: left + _self.width / 2,
                        top: -level * (_self.height + _self.spacingVertical * 2) -_self.spacingVertical,
                        data: {
                            orientation: 'vertical',
                            len: _self.spacingVertical + _self.height / 2
                        }
                    });
                }


            });

        });
        return {
            data: data,
            lines: lines,
        };
    }

    /**
     *This function adds the half Siblings of Proband from mother on right and from father on left.
     * @param {JSON} element - Father's and mother's previous spouses in JSON data.
     * @param {number} inLeft - Initial left position for drawing half siblings.
     * @param {number} inTop -  Initial top position  for drawing half siblings on different levels.
     * @param {number} inSpace - The space covered by half siblings.
     * @param {string} direction - The direction specifies if the half Siblings are from mother or father. It is 'right' for mother and 'left' for father half siblings.
     * @returns {{data: Array, lines: Array, space: (number|*)}} It returns the data, lines and space for half siblings.
     */
    halfSiblings(element, inLeft, inTop, inSpace, direction) {
        const _self = this;
        // for each element
        let twinCount = 0;
        let data = [];
        let lines = [];

        let pedigree = this.prepare(element,'halfSibling');
        this.sort(pedigree, function (inElement) {
            // center the element
            //inElement.left += (_self.width + _self.spacing) * inElement.maxWidth / 2;
            data.push(inElement);
        });

        let left1;
        let top;
        let len;
        let previousLeft;
        let previousTop;
        let midLeft;
        let midLen;
        let lastSpouseleft;

        this.sort(pedigree, function (inElement) {

            // and add lines
            if (inElement.spouses) {

                inElement.spouses.forEach((spouse, spouseIndex)  => {

                    if (spouse.children) {
                        let twincount = 0;
                        let child = spouse.children;
                        for (let childIndex = 0; childIndex < child.length; childIndex++) {
                            //console.log(child);
                            if (child[childIndex].data.twin) {
                                if (twincount === 0) {

                                    let tleft = child[childIndex].left + _self.width / 2;
                                    let tleft1 = child[childIndex + 1].left + _self.width / 2;
                                    midLen = tleft1 - tleft;
                                    midLeft = (tleft + tleft1) / 2;
                                    previousLeft = midLeft;
                                    previousTop = child[childIndex].top - (_self.spacingVertical );
                                    lines.push({
                                        left: previousLeft,
                                        top: previousTop,

                                        data: {
                                            orientation: 'twins',
                                            len: midLen / 2,
                                            identical: child[childIndex].data.identical
                                        }
                                    });
                                }
                                twincount++;

                            } else {
                                //small vertical lines above children
                                lines.push({
                                    left: child[childIndex].left + _self.width / 2,
                                    top: child[childIndex].top - (_self.spacingVertical ),
                                    data: {
                                        orientation: 'vertical',
                                        len: _self.spacingVertical
                                    }
                                });
                            }
                            if (childIndex === 0) {
                                if (child[childIndex].data.twin) {
                                    left1 = child[childIndex].left + midLen / 2 + _self.width / 2;
                                    top = child[childIndex].top - (_self.spacingVertical );
                                } else {
                                    left1 = child[childIndex].left + _self.width / 2;
                                    top = child[childIndex].top - (_self.spacingVertical );
                                }
                            }
                            if (childIndex === child.length - 1) {
                                if (child[childIndex].data.twin) {
                                    //console.log("last twin");

                                    if (child[childIndex].left < spouse.left) {
                                        // see test case "testTwoChildrenOneWithSpouse"
                                        //console.log("last twin first if");

                                        len = spouse.left + _self.width + _self.spacing - midLen;

                                    } else {
                                        len = midLeft - left1;
                                    }
                                } else {
                                    /*if (child[childIndex].left < spouse.left) {
                                     // see test case "testTwoChildrenOneWithSpouse"
                                     len = spouse.left + _self.width / 2 - left1;
                                     } else {*/
                                    len = child[childIndex].left + _self.width / 2 - left1;
                                    //}
                                }

                            }
                        }

                        if (spouse.children.length > 1) {
                            if (twincount <= 0 || twincount !== spouse.children.length) {
                                lines.push({
                                    left: left1,
                                    top: top,
                                    data: {
                                        orientation: 'horizontal',
                                        len: len
                                    }
                                });
                            }
                            lines.push({
                                left: left1+len/2,
                                top: top-_self.spacingVertical-_self.height/2,
                                data: {
                                    orientation: 'vertical',
                                    len: _self.spacingVertical+_self.height/2
                                }
                            });

                        }
                        else{
                            lines.push({
                                left: left1,
                                top: top-_self.spacingVertical-_self.height/2,
                                data: {
                                    orientation: 'vertical',
                                    len: _self.spacingVertical+_self.height/2
                                }
                            });
                        }
                        if (inElement.spouses.length-1 === spouseIndex)
                        {
                            (spouse.children.length > 1) ? lastSpouseleft=left1+len/2:lastSpouseleft=left1;

                        }

                        if (spouse.children.length === 1 && spouseIndex === 0) {
                            let leftCompensate = 0;
                            // because we gave single children a width of 2 to center them relative to their parents..
                            if (!spouse.children[0].spouses) {
                                leftCompensate = (_self.width + _self.spacing) / 2;
                            }
                        }
                    }
                });
            }
        });
        data.reverse();
        data.pop();

        //console.log(pedigree);
        let newLeft = 0;
        if (direction === 'right') {
            newLeft = inLeft + inSpace ;
        } else if (direction === 'left') {
            newLeft = inLeft - inSpace - ((_self.width + _self.spacing) * pedigree.maxWidth/2)-_self.width ;
        }

        inTop=_self.height+_self.spacingVertical*2;

        data.forEach((dat) => {
            dat.left += newLeft;
            dat.top -= inTop;
        });

        lines.forEach((line) => {
            line.left += newLeft;
            line.top -= inTop;
        });
        let elementsOffset=(_self.width + _self.spacing) * data.length;
        inSpace += elementsOffset ;

        let topLen = direction === 'left' ? inLeft-(lastSpouseleft+newLeft) -inLeft : inLeft - (lastSpouseleft+newLeft)-inLeft ;
        let lineLeft = direction === 'left' ? inLeft + _self.width / 2  : newLeft + _self.width / 2;

        lines.push({
            left: lastSpouseleft+ newLeft,
            top:  -inTop+_self.height/2,
            data: {
                orientation: 'horizontal',
                len: topLen
            }
        });


        return {
            data: data,
            lines: lines,
            space: inSpace,
        };

    }

    /**
     *This function adds the Siblings of Proband. Siblings1 of proband are added on the left side of Proband and Siblings2 are always added on the right side of Proband.
     * @param {JSON} inElements - Siblings Array from JSON data.
     * @param {number} inLeft - Initial left position for drawing siblings on left or right.
     * @param {number} inTop - Initial top position  for drawing siblings on different levels.
     * @param {number} inSpace - The space covered by the siblings and their children is summed here.
     * @param {string} direction - The direction specifies if the siblings are added on left or right. It is 'left' for Siblings1 and 'right' for Siblings2
     * @param {boolean} twinCheck - Checks if Proband is twin with Siblings1 or Siblings2 on left and right respectively. True if Proband is twin.
     * @returns {{data: Array, lines: Array, space: *, lastSib: *}} It returns data and lines for siblings. Also it returns the space covered by them and the left of last Sibling.
     */
    siblings(inElements, inLeft, inTop, inSpace, direction, twinCheck) {
        const _self = this;
        let returnData = [];
        let returnLines = [];
        // for each element
        let twinCount = 0;
        let firstTwinLeft = 0;
        let midLen=0;
        let midLeft=0;
        inElements.forEach((element, eIndex) => {

            let pedigree = this.prepare(element,'sibling');
            let pedigreeData =[];
            let pedigreeLines =[];

            this.sort(pedigree, function (inElement) {
                // center the element
                inElement.left += (_self.width + _self.spacing) * inElement.maxWidth / 2;
                pedigreeData.push(inElement);
            });

            let pedLeftOffset =(_self.width + _self.spacing) * pedigree.maxWidth/2;
            let pedRightOffset =(_self.width + _self.spacing) * pedigree.maxWidth/2;


            // direction specifies where the reference person is relative to the part
            let newLeft = 0;
            if (direction === 'right') {
                newLeft = inLeft + inSpace + pedLeftOffset -_self.width;
            } else if (direction === 'left') {
                newLeft = inLeft - inSpace - pedRightOffset ;
            }

            let lines=_self.renderLines(pedigree);
            pedigreeLines =lines.pedigreeLines;


            let rootLeft = pedigree.left;
            let rootTop = pedigree.top;

            //First make the root 0 and then adding the new left offset
            pedigreeData.forEach((dat) => {
                dat.left -= rootLeft;
                dat.left += newLeft;
                //dat.top -= rootTop;
                dat.top += inTop;
            });

            pedigreeLines.forEach((line) => {
                line.left -= rootLeft;
                line.left += newLeft;
                //line.top -= rootTop;
                line.top += inTop;
            });
            inSpace += (_self.width + _self.spacing) * pedigree.maxWidth;

            let len = direction === 'right' ? newLeft - inLeft : inLeft - newLeft;
            let lineLeft = direction === 'right' ? inLeft + _self.width / 2 : newLeft + _self.width / 2;



            if (element.data.twin) {
                if (twinCount === 0) {
                    firstTwinLeft = newLeft + _self.width / 2;

                    if (twinCheck) {
                        midLen = len;
                        midLeft = lineLeft + (len / 2);

                        pedigreeLines.push({
                            left: lineLeft + (len / 2),
                            top: -(_self.spacingVertical ) + inTop,
                            data: {
                                orientation: 'twins',
                                len: len / 2,
                                identical: element.data.identical,
                            }
                        });
                    }
                }
                else {
                    let secondTwinLeft = newLeft + _self.width / 2;
                    midLen = Math.abs(secondTwinLeft - firstTwinLeft);
                    midLeft = (secondTwinLeft + firstTwinLeft) / 2;


                    pedigreeLines.push({
                        left: midLeft,
                        top: -(_self.spacingVertical ) + inTop,
                        data: {
                            orientation: 'twins',
                            len: midLen / 2,
                            identical: element.data.identical,
                        }
                    });
                }
                twinCount++;
            }
            else {
                pedigreeLines.push({
                    left: newLeft + _self.width / 2,
                    top: -(_self.spacingVertical ) + inTop,
                    data: {
                        orientation: 'vertical',
                        len: _self.spacingVertical
                    }
                });
            }


            // horizontal line on top of element to connect to other elements of the part or the reference person
            if (eIndex === inElements.length - 1 && element.data.twin) {
                if (direction === 'left') {
                    lineLeft = lineLeft + midLen / 2;
                }
                pedigreeLines.push({
                    left: lineLeft,
                    top: -(_self.spacingVertical )+ inTop,
                    data: {
                        orientation: 'horizontal',
                        len: len - midLen / 2
                    }
                });
            }
            else if (eIndex === inElements.length - 1 && !element.data.twin) {
                if(twinCheck){
                    if (direction === 'right') {
                        lineLeft = lineLeft + midLen / 2;
                    }
                    len=len-midLen/2
                }
                pedigreeLines.push({
                    left: lineLeft,
                    top: -(_self.spacingVertical ) + inTop,
                    data: {
                        orientation: 'horizontal',
                        len: len
                    }
                });
            }


            returnData = returnData.concat(pedigreeData);
            returnLines = returnLines.concat(pedigreeLines);


        });

        return {
            data: returnData,
            lines: returnLines,
            space: inSpace,
            lastSib:returnData[returnData.length-1].left
        };


    }

    /**
     *This function draws all the lines first and then calls drawPerson for each data object to draw the family members.
     * @param {Array} inData - All the elements(family members) of pedigree are passed in this array.
     * @param {Array} inLines - All the lines connecting family members are passed in this array.
     */
    draw(inData, inLines) {


        const _this = this;
        let fitPedigree = false;
        // normalize top and left values to get rid of negative values
        let d = this.normalize(inData, inLines);


        if (d.width > _this.pWidth) {
            fitPedigree = true;
        }
        if (d.height > _this.pHeight) {
            fitPedigree = true;
        }

        let data = d.data;
        let lines = d.lines;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {

            let x2 = lines[lineIndex].data.orientation === 'horizontal' ? lines[lineIndex].left + lines[lineIndex].data.len : lines[lineIndex].left;
            let y2 = lines[lineIndex].data.orientation === 'vertical' ? lines[lineIndex].top + lines[lineIndex].data.len : lines[lineIndex].top;

            if (lines[lineIndex].data.orientation === 'twins') {
                _this.paper.path('M' + [lines[lineIndex].left, lines[lineIndex].top, lines[lineIndex].left - lines[lineIndex].data.len, lines[lineIndex].top + _this.spacingVertical ].join(',')).attr({stroke: '#000'});
                _this.paper.path('M' + [lines[lineIndex].left, lines[lineIndex].top, lines[lineIndex].left + lines[lineIndex].data.len, lines[lineIndex].top + _this.spacingVertical ].join(',')).attr({stroke: '#000'});

                if (lines[lineIndex].data.identical === 1) {
                    _this.paper.path('M' + [lines[lineIndex].left - lines[lineIndex].data.len / 2, lines[lineIndex].top + _this.spacingVertical / 2, lines[lineIndex].left + lines[lineIndex].data.len / 2, lines[lineIndex].top + _this.spacingVertical / 2].join(',')).attr({stroke: '#000'});

                }
                else if(lines[lineIndex].data.identical === 2){
                    //unknown zygosity
                    _this.paper.text(lines[lineIndex].left-5 , lines[lineIndex].top + _this.spacingVertical / 2 +5, '?').attr({
                        stroke: '#000',
                        'stroke-width': 1,
                        'font-size':20
                    });
                }


            } else {
                _this.paper.path('M' + [lines[lineIndex].left, lines[lineIndex].top, x2, y2].join(',')).attr({stroke: '#000'});
            }
        }

        // create shape for each data element
        data.forEach((dat) => {
            if (dat.display) {
                _this.drawPerson(dat);
            }
        });
        _this.addPopover(fitPedigree);

    }

    /**
     *This function draws proband and all the family members one by one and adds the advanced symbols on them too if required.
     * @param {JSON} dat - Data required for drawing an element(family member).
     */
    drawPerson(dat) {
        const _current = this;
        let gender = dat.data.gender ? dat.data.gender : 'unknown';
        let x = dat.left;
        let y = dat.top;
        let abortion = dat.data.abortion;
        let name = dat.data.name;
        let divorced = dat.data.divorced;
        let deceased = dat.data.deceased;
        let adopted = dat.data.adopted;
        let separated = dat.data.separated;
        let unborn = dat.data.unborn;
        let fhxunknown= dat.data.fhxunknown;
        let healthHistory=true;
        if(dat.data.clinicalobservations){
            healthHistory=false;
        }
        let me = dat.data.current;
        let element = null;
        if (abortion) {
            _current.paper.path('M' + [x + _current.width / 2, y-2, x + _current.width, y + _current.height / 2, x, y + _current.height / 2] + 'z').attr(_current.abortionStyle).attr({stroke: '#000'});
        } else {
            switch (gender) {
                case 'male':
                    element = _current.paper.rect(x, y, _current.radius * 2, _current.radius * 2, 5).data('patientData', dat.data).attr(_current.maleStyle).click(
                        _current.clickFunction)
                        .hover(function() {
                            _current.dragTool.attr({display: 'block'});
                            _current.updatePopover(this.attr('x'), this.attr('y'), this.data('patientData'));
                        });
                    break;
                case 'female':
                    element = _current.paper.rect(x, y, _current.radius * 2, _current.radius * 2, _current.radius).data('patientData', dat.data).attr(_current.femaleStyle)
                        .click(_current.clickFunction)
                        .hover(function() {
                            _current.dragTool.attr({display: 'block'});
                            _current.updatePopover(this.attr('x'), this.attr('y'), this.data('patientData'));
                        });
                    break;
                default:
                    let w = _current.radius * 2 - 12;
                    element = _current.paper.rect(x + 6, y + 6, w, w, 5).attr(_current.unknownStyle).click(_current.clickFunction).transform("r45").data('patientData', dat.data)
                        .hover(function() {
                            _current.dragTool.attr({display: 'block'});
                            _current.updatePopover(this.attr('x'), this.attr('y'), this.data('patientData'));
                        });
                    break;
            }
        }


        /*Current user arrow*/
        if (me) {
            let px = x - 20;
            let py = y + _current.height + 20;
            /* _current.paper.marker(px, py,  15, 15, px+15, py+15).attr({
             'stroke-width': 4
             }).attr({stroke: '#000'});*/
            let js_triangle = _current.paper.polygon([px + 2, py - 12, px + 12, py - 2, px + 15, py - 15]).attr({
                fill: '#000',
                stroke: '#fff'
            });
            let arrowpath = _current.paper.path('M' + [px, py, px + 10, py - 10].join(',')).attr({
                stroke: '#000',
                strokeWidth: '4px',
                fill: '#000'
            });
            //let marker = arrowpath.marker(0,0, 10,10, 5,5);
        }
        /*addopted symbol lines*/
        if (adopted) {
            _current.paper.path('M' + [x + 10, y - 5, x - 5, y - 5, x - 5, y + _current.height + 5, x + 10, y + _current.height + 5].join(',')).attr({
                stroke: '#000',
                fill: "none"
            });
            _current.paper.path('M' + [x + _current.width - 10, y - 5, x + _current.width + 5, y - 5, x + _current.width + 5, y + _current.height + 5, x + _current.width - 10, y + _current.height + 5].join(',')).attr({
                stroke: '#000',
                fill: "none"
            });
        }
        /*deceased symbol line*/
        if (deceased) {
            _current.paper.path('M' + [x + _current.width + 5, y - 5, x - 5, y + _current.height + 5].join(',')).attr({
                stroke: '#000',
                'stroke-width': 2
            });
        }
        /*divorced lines*/
        if (divorced) {
            _current.paper.path('M' + (x - 5) + ' ' + (y + 23) + 'L' + (x - 10) + ' ' + (y + 38)).attr({
                stroke: '#000',
                'stroke-width': 1.5
            });
            _current.paper.path('M' + (x - 10) + ' ' + (y + 23) + 'L' + (x - 15) + ' ' + (y + 38)).attr({
                stroke: '#000',
                'stroke-width': 1.5
            });
            _current.paper.path('M' + (x - 7) + ' ' + (y + 23) + 'L' + (x - 13) + ' ' + (y + 38)).attr({
                stroke: '#fff',
                'stroke-width': 3
            });
        }
        if (separated) {
            _current.paper.path('M' + (x - 15) + ' ' + (y + 23) + 'L' + (x - 10) + ' ' + (y + 38)).attr({
                stroke: '#000',
                'stroke-width': 1.5
            });
        }
        if(unborn){
            _current.paper.text(x+ _current.width/2.5 , y+_current.height/1.5 , 'P').attr({
                stroke: '#000',
                'stroke-width': 1,
                'font-size':30
            });
        }
        if(healthHistory){
            _current.paper.text(x+ _current.width/2.5 , y+_current.height/1.5 , '?').attr({
                stroke: '#000',
                'stroke-width': 1,
                'font-size':30
            });
        }
        if(fhxunknown)
        {
            _current.paper.text(x+ _current.width/2.5 , y-_current.height/1.5 , '?').attr({
            stroke: '#000',
            'stroke-width': 1,
            'font-size':30
        });
            _current.paper.path('M' + (x+ _current.width/2) + ' ' + (y) + 'L' + (x +  _current.width/2) + ' ' + (y -_current.height/2)).attr({
                stroke: '#000',
                'stroke-width': 1.5
            });
        }

    }

    /**
     *This function normalizes all the positions and values stored. It converts negative numbers to positive accordingly to show on SVG
     * and also adds the top and left offsets while drawing pedigree.
     * @param {Array} inData - All the elements(family members) of pedigree are passed in this array.
     * @param {Array} inLines - All the lines connecting family members are passed in this array.
     * @returns {{data: (Array|*), lines: (Array|*), height: *, width: *}} Returns the data and lines arrays with normalized and positive values for drawing on SVG.
     * It also returns the max width and height of pedigree.
     */
    normalize(inData, inLines) {

        // find the lowest negative numbers
        let mostNegativeLeft = Math.min.apply(Math, inData.map((dat) => {
            return dat.left;
        }));
        let mostNegativeTop = Math.min.apply(Math, inData.map((dat) => {
            return dat.top;
        }));

        // subtract the margin
        mostNegativeLeft -= this.marginLeft;
        mostNegativeTop -= this.marginTop;
        let display = true;
        // make all numbers positive with the information collected above
        let returnData = inData.map((dat) => {
            (dat.hasOwnProperty('display')) ? display = dat.display : display = true;
            return {
                left: dat.left - mostNegativeLeft,
                top: dat.top - mostNegativeTop,
                data: dat.data,
                display: display
            };
        });
        let returnLines = inLines.map((line) => {
            return {
                left: line.left - mostNegativeLeft,
                top: line.top - mostNegativeTop,
                data: line.data
            };
        });

        // find highest numbers
        let mostPositiveLeft = Math.max.apply(Math, returnData.map((dat) => {
            return dat.left;
        }));

        let mostPositiveTop = Math.max.apply(Math, returnData.map((dat) => {
            return dat.top;
        }));

        // calculate height and width of the whole tree
        let height = mostPositiveTop + this.height + this.marginTop;
        let width = mostPositiveLeft + this.width + this.marginLeft;

        return {
            data: returnData,
            lines: returnLines,
            height: height,
            width: width
        };

    }

    /**
     *This function is used to draw the lines for proband's current children, Proband's previous children and Proband's current spouse's previous children.
     * @param {JSON} pedigree - Proband with its spouses and children from JSON data.
     * @returns {{pedigreeLines: Array}} Returns only lines array for proband's children.
     */
    renderLines(pedigree){
        let left1;
        let top;
        let len;
        let previousLeft;
        let previousTop;
        let midLeft;
        let midLen;
        let lines = [];
        let _self=this;
        this.sort(pedigree, function (inElement) {
            // and add lines

            if (inElement.spouses) {

                inElement.spouses.forEach((spouse, spouseIndex)  => {

                    let spouseGender=spouse.data.gender;
                    let consanguinity=spouse.data.consanguinity;
                    let spouseLeft=0;
                    if (spouseIndex <= 0 && spouse.hasOwnProperty('left')) {

                        if(spouseGender === 'male')
                        {
                            //relation line on right of spouse(male)
                            spouseLeft=spouse.left  + _self.width;
                        }
                        else{
                            //relation line on left of spouse(female)
                            spouseLeft=spouse.left - _self.spacing;
                        }
                        lines.push({

                            left:spouseLeft,
                            top: spouse.top  + _self.height/2 ,
                            data: {
                                orientation: 'horizontal',
                                len: _self.spacing
                            }
                        });
                        if(consanguinity){
                            //double the horizontal line for consigui nity
                            lines.push({

                                left:spouseLeft,
                                top: spouse.top  + _self.height/2 - 5 ,
                                data: {
                                    orientation: 'horizontal',
                                    len: _self.spacing+2
                                }
                            });
                        }

                    }
                    if (spouse.children) {


                        if (spouseIndex <= 0 && spouse.hasOwnProperty('left')) {
                            //current spouse children vertical line
                            if (spouseGender === 'male') {
                                lines.push({
                                    left: inElement.left - _self.spacing / 2,
                                    top: inElement.top + _self.height / 2,
                                    data: {
                                        orientation: 'vertical',
                                        len: _self.height / 2 + _self.spacingVertical
                                    }
                                });
                            }
                            else {
                                lines.push({
                                    left: inElement.left + _self.width + _self.spacing / 2 ,
                                    top: inElement.top + _self.height / 2,
                                    data: {
                                        orientation: 'vertical',
                                        len: _self.height / 2 + _self.spacingVertical
                                    }
                                });
                            }
                        }else if(spouseIndex <= 0 && !spouse.hasOwnProperty('left')){
                            // vertical line below sibling where there is children but no spouse
                            lines.push({
                                left: inElement.left+ _self.width / 2 ,
                                top: inElement.top + _self.height / 2,
                                data: {
                                    orientation: 'vertical',
                                    len: _self.height / 2 + _self.spacingVertical
                                }
                            });
                        }


                        let twincount = 0;
                        let child = spouse.children;
                        for (let childIndex = 0; childIndex < child.length; childIndex++) {
                            //console.log(child);
                            if (child[childIndex].data.twin) {
                                if (twincount === 0) {

                                    let tleft = child[childIndex].left + _self.width / 2;
                                    let tleft1 = child[childIndex + 1].left + _self.width / 2;
                                    midLen = tleft1 - tleft;
                                    midLeft = (tleft + tleft1) / 2;
                                    previousLeft = midLeft;
                                    previousTop = child[childIndex].top - (_self.spacingVertical );
                                    lines.push({
                                        left: previousLeft,
                                        top: previousTop,

                                        data: {
                                            orientation: 'twins',
                                            len: midLen / 2,
                                            identical: child[childIndex].data.identical,
                                        }
                                    });
                                }
                                twincount++;

                            } else {
                                //small vertical lines above children
                                lines.push({
                                    left: child[childIndex].left + _self.width / 2,
                                    top: child[childIndex].top - (_self.spacingVertical ),
                                    data: {
                                        orientation: 'vertical',
                                        len: _self.spacingVertical
                                    }
                                });
                            }
                            if (childIndex === 0) {
                                if (child[childIndex].data.twin) {
                                    left1 = child[childIndex].left + midLen / 2 + _self.width / 2;
                                    top = child[childIndex].top - (_self.spacingVertical );
                                } else {
                                    left1 = child[childIndex].left + _self.width / 2;
                                    top = child[childIndex].top - (_self.spacingVertical );
                                }
                            }
                            if (childIndex === child.length - 1) {
                                if (child[childIndex].data.twin) {
                                   // console.log("last twin");

                                    if (child[childIndex].left < spouse.left) {
                                        // see test case "testTwoChildrenOneWithSpouse"
                                       // console.log("last twin first if");

                                        len = spouse.left + _self.width + _self.spacing - midLen;

                                    } else {
                                        len = midLeft - left1;
                                    }
                                } else {
                                    /*if (child[childIndex].left < spouse.left) {
                                     // see test case "testTwoChildrenOneWithSpouse"
                                     len = spouse.left + _self.width / 2 - left1;
                                     } else {*/
                                    len = child[childIndex].left + _self.width / 2 - left1;
                                    //}
                                }

                            }
                        }

                        if (spouse.children.length > 1) {
                            if (twincount <= 0 || twincount !== spouse.children.length) {
                                lines.push({
                                    left: left1,
                                    top: top,
                                    data: {
                                        orientation: 'horizontal',
                                        len: len
                                    }
                                });
                            }
                        }

                        if (spouse.children.length === 1 && spouseIndex === 0) {
                            let leftCompensate = 0;
                            // because we gave single children a width of 2 to center them relative to their parents..
                            if (!spouse.children[0].spouses) {
                                leftCompensate = (_self.width + _self.spacing) / 2;
                            }
                        }
                    }
                    // draw additional lines, if there is more than one spouse
                    if (spouseIndex > 0) {
                       lines.push({
                            left: spouse.left + _self.width / 2,
                            top: inElement.top  + _self.height +_self.spacingVertical/2,
                            data: {
                                orientation: 'vertical',
                                len: _self.spacingVertical/2
                            }
                        });
                        let spouseOffset=0;
                        let spouseLen=0;
                        if(spouse.placement==='right')
                        {
                            //Horizontal Line for Proband's halfSiblings on right
                            if(inElement.data.gender === 'female' ){
                                spouseOffset=inElement.left+_self.width/2;
                                spouseLen=spouse.left - (inElement.left) ;
                            }else{
                                spouseOffset=inElement.left  +_self.width +_self.spacing + _self.width/2;
                                spouseLen=spouse.left - (inElement.left) -( _self.width +_self.spacing );
                            }

                            lines.push({
                                left: spouseOffset,
                                top: inElement.top  + _self.height,
                                data: {
                                    orientation: 'vertical',
                                    len: _self.spacingVertical/2
                                }
                            });
                        }else{
                            //Horizomtal Line for Proband's halfSiblings on left
                            if(inElement.data.gender === 'female' ){
                                spouseOffset=inElement.left - (_self.width +_self.spacing) + _self.width/2;
                                spouseLen=spouse.left - (inElement.left) +( _self.width +_self.spacing );
                            }else{
                                spouseOffset=inElement.left  + _self.width/2;
                                spouseLen=spouse.left - (inElement.left);
                            }

                            lines.push({
                                left: spouseOffset,
                                top: inElement.top  + _self.height ,
                                data: {
                                    orientation: 'vertical',
                                    len: _self.spacingVertical/2
                                }
                            });
                        }
                        lines.push({
                            left: spouseOffset,
                            top: inElement.top  + _self.height +_self.spacingVertical/2,
                            data: {
                                orientation: 'horizontal',
                                len:spouseLen
                            }
                        });

                    }
                });
            }
        });
        return{
            'pedigreeLines':lines
        }
    }

    /**
     *This function is used to add the data for proband's current children, Proband's previous children and Proband's current spouse's previous children.
     * @param {JSON} inPedigree - Proband with its spouses and children from JSON data.
     * @returns {{data: Array, lines: Array, leftOffset: number, rightOffset: number}} Returns data and lines for proband and its children(current and previous).
     */
    render(inPedigree) {
        let pedigree = this.prepare(inPedigree,'proband');


        const _self = this;
        let data = [];
        let lines = [];
        let leftOffset = 0;
        let rightOffset = 0;

        this.sort(pedigree, function (inElement) {
            // center the element
            inElement.left += (_self.width + _self.spacing) * inElement.maxWidth / 2;
            data.push(inElement);
        });
        let spousesData = [];

        data.forEach((dat) => {
            if (dat.spouses) {
                if (dat.spouses.length === 1) {
                    dat.spouses[0].top = dat.top;
                    if(dat.spouses[0].data.gender === 'male')
                    {
                        dat.spouses[0].left = dat.left - (_self.width + _self.spacing) / 2;
                        dat.left = dat.spouses[0].left + (_self.width + _self.spacing);
                    }
                    else{
                        dat.spouses[0].left = dat.left + (_self.width + _self.spacing) / 2;
                        dat.left = dat.spouses[0].left - (_self.width + _self.spacing);
                    }


                    spousesData.push(dat.spouses[0]);
                    let width = 0;
                    if (dat.spouses[0].children) {
                        dat.spouses[0].children.forEach((child) => {
                            width += child.maxWidth;
                        });
                    } else {
                        width = 1;
                    }
                    width = Math.max(2, width);
                    dat.spouses[0].width = width;
                    dat.widthRight = 0;
                    dat.widthLeft = 0;
                    dat.widthCenter = width;
                }
                else {
                    dat.left -= (_self.width + _self.spacing) * dat.maxWidth / 2;
                    let widthRight = 0;
                    let widthLeft = 0;
                    let widthCenter = 0
                    dat.spouses.forEach((spouse, spouseIndex) => {
                        spouse.top = dat.top;
                        let width = 0;
                        if (spouse.children) {
                            spouse.children.forEach((child) => {
                                width += child.maxWidth;
                            });
                        } else {
                            width = 1;
                            if (spouseIndex === 0) {
                                width = 2;
                            }
                        }
                        spouse.width = width;
                        switch (spouse.placement) {
                            case 'right':
                                spouse.left = dat.left + (_self.width + _self.spacing) * (width / 2 + widthRight + widthCenter);
                                spouse.display = false;
                                widthRight += width;
                                break;
                            case 'center':
                                spouse.left = dat.left + (_self.width + _self.spacing) * (width / 2 + widthCenter);
                                //spouse.left = dat.left + (_self.width + _self.spacing) * (width / 2 + widthRight + widthCenter);
                                spouse.display = true;
                                widthCenter += width;
                                break;
                            case 'left':
                                spouse.left = dat.left - (_self.width + _self.spacing) * (width / 2 + widthLeft );
                                spouse.display = false;
                                widthLeft += width;
                                break;
                        }
                        spousesData.push(spouse);
                    });
                    if( dat.spouses[0].data.gender === 'male')
                    {
                        dat.spouses[0].left -= (_self.width + _self.spacing) / 2;
                        dat.left = dat.spouses[0].left + (_self.width + _self.spacing);
                    }else{
                        dat.spouses[0].left += (_self.width + _self.spacing) / 2;
                        dat.left = dat.spouses[0].left - (_self.width + _self.spacing);
                    }
                    dat.widthRight = widthRight;
                    dat.widthLeft = widthLeft;
                    dat.widthCenter = widthCenter;
                }
            }
        });
        if (inPedigree.spouses) {

            //Offset for Step children
            if(inPedigree.data.gender === 'male')
            {
                leftOffset = (data[0].widthLeft + data[0].widthCenter / 2) * (_self.width + _self.spacing) - (_self.spacing + _self.width);
                rightOffset = (data[0].widthRight + data[0].widthCenter / 2) * (_self.width + _self.spacing) - _self.spacing / 2 + (_self.width + _self.spacing / 2 );
            }
            else
            {
                leftOffset = (data[0].widthLeft + data[0].widthCenter / 2) * (_self.width + _self.spacing) ;
                rightOffset = (data[0].widthRight + data[0].widthCenter / 2) * (_self.width + _self.spacing) -_self.spacing  ;
            }

        } else {
            if(inPedigree.data.gender ==='male')
            {
                rightOffset = _self.width;
                leftOffset = 0;
            }
            else{
                leftOffset = 0;
                rightOffset =_self.width ;
            }
        }
        let siblingCount=this.getSiblingChildren();
        if(siblingCount.siblings1)
        {
            if(inPedigree.data.gender ==='female' && inPedigree.spouses) {
                //when proband is female and spouse is on left
                leftOffset =_self.width+_self.spacing ;
            }else{
                // when proband male or no spouse
                leftOffset = 0;
            }

        }
        if(siblingCount.siblings2)
        {
            if(inPedigree.data.gender ==='male' && inPedigree.spouses) {
                //when proband is male and spouse on right
                rightOffset = _self.width*2+_self.spacing;
            }else{
                //when proband is female or male with no spouse
                rightOffset =_self.width;
            }

        }

        //add right spouse objects (circles)
        data = data.concat(spousesData);

        let returnLines=_self.renderLines(pedigree);
        lines =returnLines.pedigreeLines;

        let rootLeft = pedigree.left;
        let rootTop = pedigree.top;
        data.forEach((dat) => {
            dat.left = dat.left- rootLeft;
            dat.top -= rootTop;
        });
        lines.forEach((line) => {
            line.left -= rootLeft;
            line.top -= rootTop;
        });
        return {
            data: data,
            lines: lines,
            leftOffset: leftOffset,
            rightOffset: rightOffset
        };

    }

    /**
     * This function prepares the JSON data according to our requirements. It adds or removes the desired data for us and makes the JSON more understandable for us.
     * Further it also specifies the placement of the current and previous children.
     * @param {JSON} inPedigree - JSON data that we need to prepare for use.
     * @param {string} inRelation - used to identify what we need to prepare. There could be three cases 'proband','sibling' and 'halfsibling'.
     * @returns {*} Returns the prepared JSON for us with additional fields and more understandable structure.
     */
    prepare(inPedigree,inRelation) {

        let maxWidth = 0;
        let maxLeft = 1;
        let returnSpouses = [];
        const _self = this;

        let moveElement = function moveElement(inElement) {
            inElement.left += (_self.width + _self.spacing) * maxWidth;
            inElement.top += _self.height + _self.spacingVertical * 2;
        };

        let moveLeft = function moveLeft(inElement) {
            inElement.left -= (_self.width + _self.spacing) * maxLeft;
            inElement.top += _self.height + _self.spacingVertical * 2;
        };

        function returnChild(spouse, spouseIndex, moveFunc, direction) {
            let returnChildren = [];
            let spouseGender=spouse.data.gender;

            spouse.children.forEach((child) => {

                returnChildren.push(_self.prepare(child));

                let currentChild = returnChildren[returnChildren.length - 1];

                _self.sort(currentChild, moveFunc);
                if((direction === 'left'))
                {
                    //add child's width (+1) to the maxLeft on left of proband.
                    maxLeft += currentChild.maxWidth;
                } else{
                    //add child's width (+1) to the maxwidth for center & right of proband.
                    maxWidth += currentChild.maxWidth;
                }

            });
            returnSpouses.push({
                data: spouse.data,
                children: returnChildren,
                placement: direction
            });
        }


        if (!inPedigree.spouses) {
            return {
                left: 0,
                top: 0,
                maxWidth: 1,
                data: inPedigree.data
            };
        } else {

            inPedigree.spouses.forEach((spouse, spouseIndex) => {

                if (!spouse.children || spouse.children.length === 0) {
                    maxWidth += 1;
                    if (spouseIndex === 0) {
                        maxWidth += 1;
                    }
                    returnSpouses[returnSpouses.length] = {
                        data: spouse.data,
                        placement: 'center'
                    };
                } else {
                    if(inRelation==='proband') {

                        if (spouse.current || spouseIndex === 0) {
                            if (spouse.data.gender === 'male') {
                                returnChild(spouse, spouseIndex, moveElement, 'center');
                            }
                            else {
                                returnChild(spouse, spouseIndex, moveElement, 'center');
                            }


                            if (spouse.hasOwnProperty('spouses')) {
                                spouse.spouses.forEach((pSpouse, sIndex) => {

                                    if (!pSpouse.children || pSpouse.children.length === 0) {
                                        maxWidth += 1;
                                        if (spouseIndex === 0) {
                                            maxWidth += 1;
                                        }
                                        returnSpouses[returnSpouses.length] = {
                                            data: pSpouse.data,
                                            placement: 'left'
                                        };
                                    } else {
                                        if (spouse.data.gender === 'male') {
                                            returnChild(pSpouse, sIndex, moveLeft, 'left');
                                        }
                                        else {
                                            returnChild(pSpouse, sIndex, moveElement, 'right');

                                        }

                                    }
                                });
                            }
                        }
                        else {
                            if (spouse.data.gender === 'male') {
                                returnChild(spouse, spouseIndex, moveElement, 'right');
                            }
                            else {
                                returnChild(spouse, spouseIndex, moveLeft, 'left');
                            }

                        }
                    }
                    if(inRelation==='halfSibling'){
                        if(inPedigree.data.gender==='male')
                        {
                            if(spouseIndex === 0)
                            {
                                returnChild(spouse, spouseIndex, moveElement, 'center');
                            }else{
                                returnChild(spouse, spouseIndex, moveLeft, 'left');
                            }

                        }
                        else{
                            if(spouseIndex === 0)
                            {
                                returnChild(spouse, spouseIndex, moveElement, 'center');
                            }else{
                                returnChild(spouse, spouseIndex, moveElement, 'right');
                            }

                        }
                    }
                    if(inRelation==='sibling') {
                        if(spouseIndex === 0) {
                            returnChild(spouse, spouseIndex, moveElement, 'center');
                        }
                    }
                }
            });
            return {
                left: 0,
                top: 0,
                maxWidth: maxWidth,
                data: inPedigree.data,
                spouses: returnSpouses
            };
        }

    }

    /**
     * This function receives a JSON, goes in depth to search for spouses and children and calls the callback function for each child.
     * @param {JSON} inTree - JSOn data that we need to traverse.
     * @param {function} inCallback - callback function that we send to apply to all the children.
     */
    sort(inTree, inCallback) {
        const _self = this;
        inCallback(inTree);
        if (inTree.spouses) {
            inTree.spouses.forEach((spouse) => {
                if (spouse.children) {
                    spouse.children.forEach((child) => {
                        _self.sort(child, inCallback);
                    });
                }
            });
        }
    }
}