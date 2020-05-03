// (C) Wolfgang Huber 2010-2011

// Script parameters - these are set up by R in the function 'writeReport' when copying the 
//   template for this script from arrayQualityMetrics/inst/scripts into the report.

var highlightInitial = [ false, false, true, false, false, true, false, true, false, true, true, false ];
var arrayMetadata    = [ [ "1", "Cav1.TGFB1", "siCav1+TGF-beta1 rep1", "primary hepatocytes treate with Cav1 siRNA and TGFBeta", "Caveolin-1", "TGFBeta", "Cav.TGFB1" ], [ "2", "Cav1.TGFB2", "siCav1+TGF-beta1 rep2", "primary hepatocytes treate with Cav1 siRNA and TGFBeta", "Caveolin-1", "TGFBeta", "Cav.TGFB1" ], [ "3", "Cav1.TGFB3", "siCav1+TGF-beta1 rep3", "primary hepatocytes treate with Cav1 siRNA and TGFBeta", "Caveolin-1", "TGFBeta", "Cav.TGFB1" ], [ "4", "Cav1.Ctrl1", "siCAV1 rep1", "primary hepatocytes treated with Cav1 siRNA", "Caveolin-1", "Ctrl", "Cav.Ctrl" ], [ "5", "Cav1.Ctrl2", "siCAV1 rep 2", "primary hepatocytes treated with Cav1 siRNA", "Caveolin-1", "Ctrl", "Cav.Ctrl" ], [ "6", "Cav1.Ctrl3", "siCAV1 rep 3", "primary hepatocytes treated with Cav1 siRNA", "Caveolin-1", "Ctrl", "Cav.Ctrl" ], [ "7", "Con1.TGFB1", "siCon+TGF-beta1 rep 1", "primary hepatocytes treated with TGFBeta", "Ctrl", "TGFBeta", "Con.TGFB1" ], [ "8", "Con1.TGFB2", "siCon+TGF-beta1 rep 2", "primary hepatocytes treated with TGFBeta", "Ctrl", "TGFBeta", "Con.TGFB1" ], [ "9", "Con1.TGFB3", "siCon+TGF-beta1 rep 3", "primary hepatocytes treated with TGFBeta", "Ctrl", "TGFBeta", "Con.TGFB1" ], [ "10", "Con1.Ctrl1", "siCon rep 1", "primary hepatocytes", "Ctrl", "Ctrl", "Con.Ctrl" ], [ "11", "Con1.Ctrl2", "siCon rep 2", "primary hepatocytes", "Ctrl", "Ctrl", "Con.Ctrl" ], [ "12", "Con1.Ctrl3", "siCon rep 3", "primary hepatocytes", "Ctrl", "Ctrl", "Con.Ctrl" ] ];
var svgObjectNames   = [ "pca", "dens" ];

var cssText = ["stroke-width:1; stroke-opacity:0.4",
               "stroke-width:3; stroke-opacity:1" ];

// Global variables - these are set up below by 'reportinit'
var tables;             // array of all the associated ('tooltips') tables on the page
var checkboxes;         // the checkboxes
var ssrules;


function reportinit() 
{
 
    var a, i, status;

    /*--------find checkboxes and set them to start values------*/
    checkboxes = document.getElementsByName("ReportObjectCheckBoxes");
    if(checkboxes.length != highlightInitial.length)
	throw new Error("checkboxes.length=" + checkboxes.length + "  !=  "
                        + " highlightInitial.length="+ highlightInitial.length);
    
    /*--------find associated tables and cache their locations------*/
    tables = new Array(svgObjectNames.length);
    for(i=0; i<tables.length; i++) 
    {
        tables[i] = safeGetElementById("Tab:"+svgObjectNames[i]);
    }

    /*------- style sheet rules ---------*/
    var ss = document.styleSheets[0];
    ssrules = ss.cssRules ? ss.cssRules : ss.rules; 

    /*------- checkboxes[a] is (expected to be) of class HTMLInputElement ---*/
    for(a=0; a<checkboxes.length; a++)
    {
	checkboxes[a].checked = highlightInitial[a];
        status = checkboxes[a].checked; 
        setReportObj(a+1, status, false);
    }

}


function safeGetElementById(id)
{
    res = document.getElementById(id);
    if(res == null)
        throw new Error("Id '"+ id + "' not found.");
    return(res)
}

/*------------------------------------------------------------
   Highlighting of Report Objects 
 ---------------------------------------------------------------*/
function setReportObj(reportObjId, status, doTable)
{
    var i, j, plotObjIds, selector;

    if(doTable) {
	for(i=0; i<svgObjectNames.length; i++) {
	    showTipTable(i, reportObjId);
	} 
    }

    /* This works in Chrome 10, ssrules will be null; we use getElementsByClassName and loop over them */
    if(ssrules == null) {
	elements = document.getElementsByClassName("aqm" + reportObjId); 
	for(i=0; i<elements.length; i++) {
	    elements[i].style.cssText = cssText[0+status];
	}
    } else {
    /* This works in Firefox 4 */
    for(i=0; i<ssrules.length; i++) {
        if (ssrules[i].selectorText == (".aqm" + reportObjId)) {
		ssrules[i].style.cssText = cssText[0+status];
		break;
	    }
	}
    }

}

/*------------------------------------------------------------
   Display of the Metadata Table
  ------------------------------------------------------------*/
function showTipTable(tableIndex, reportObjId)
{
    var rows = tables[tableIndex].rows;
    var a = reportObjId - 1;

    if(rows.length != arrayMetadata[a].length)
	throw new Error("rows.length=" + rows.length+"  !=  arrayMetadata[array].length=" + arrayMetadata[a].length);

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = arrayMetadata[a][i];
}

function hideTipTable(tableIndex)
{
    var rows = tables[tableIndex].rows;

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = "";
}


/*------------------------------------------------------------
  From module 'name' (e.g. 'density'), find numeric index in the 
  'svgObjectNames' array.
  ------------------------------------------------------------*/
function getIndexFromName(name) 
{
    var i;
    for(i=0; i<svgObjectNames.length; i++)
        if(svgObjectNames[i] == name)
	    return i;

    throw new Error("Did not find '" + name + "'.");
}


/*------------------------------------------------------------
  SVG plot object callbacks
  ------------------------------------------------------------*/
function plotObjRespond(what, reportObjId, name)
{

    var a, i, status;

    switch(what) {
    case "show":
	i = getIndexFromName(name);
	showTipTable(i, reportObjId);
	break;
    case "hide":
	i = getIndexFromName(name);
	hideTipTable(i);
	break;
    case "click":
        a = reportObjId - 1;
	status = !checkboxes[a].checked;
	checkboxes[a].checked = status;
	setReportObj(reportObjId, status, true);
	break;
    default:
	throw new Error("Invalid 'what': "+what)
    }
}

/*------------------------------------------------------------
  checkboxes 'onchange' event
------------------------------------------------------------*/
function checkboxEvent(reportObjId)
{
    var a = reportObjId - 1;
    var status = checkboxes[a].checked;
    setReportObj(reportObjId, status, true);
}


/*------------------------------------------------------------
  toggle visibility
------------------------------------------------------------*/
function toggle(id){
  var head = safeGetElementById(id + "-h");
  var body = safeGetElementById(id + "-b");
  var hdtxt = head.innerHTML;
  var dsp;
  switch(body.style.display){
    case 'none':
      dsp = 'block';
      hdtxt = '-' + hdtxt.substr(1);
      break;
    case 'block':
      dsp = 'none';
      hdtxt = '+' + hdtxt.substr(1);
      break;
  }  
  body.style.display = dsp;
  head.innerHTML = hdtxt;
}
