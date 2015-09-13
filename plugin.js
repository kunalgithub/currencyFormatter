/** 

  In the event where key is not allowed , executing preventDefault , will allow only keydown and keyup event.
  KeyPress event is not executed.


  Order of Execution of events : keydown --> keypress --> keyup.

  Keyup holds the new value


*/
(function($){
	
"use strict";

var currencyPrefixer='$';
var vMin=999999.99;
var specialKeys=[36,190,189,46,45];// . = 190 , - = 189 , $ = 36
var numberKeys = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
var arrow=[37,38,39,40];
var del=[8];
var allKeys=[];
allKeys=allKeys.concat(specialKeys,numberKeys,arrow,del);

/** Strip off $ and commas */
function stripOff(value){
    value=value.replace(/,/g ,'');
    return value.replace(/[\u0024]/g ,'');
}

/** https://github.com/drpheltright/jquery-caret/blob/master/jquery.caret.js */
function setCP(jQueryObject,oldValue,newValue,cp,delKey){

    var elem=jQueryObject[0],startPos,endPos;
    
    if( newValue==='$' || newValue==='-$' )
        return;

    /* Remove this piece . Make Standardized ccp method */
    if(typeof cp === 'object'){
        startPos=cp.startPos;
        endPos=cp.endPos;
    }else{
        startPos=endPos=cp;
    }
    //Detect BackSpace / Delete with keeping in mind the Selection of text
    if(delKey){
        if(startPos===endPos){/* Not a selection */
            var newLeft,oldLeft;
            console.log(newValue,oldValue,'left',oldLeft=oldValue.substr(0,startPos),'right',oldValue.substr(startPos+1));
            console.log('newLeft',newLeft=newValue.substr(0,startPos));
            
            if(oldLeft.length!=newLeft.length)
                startPos=startPos-(oldLeft.length-newLeft.length)-1;

            

        }else{
            //Whole new Animal to tackle
        }

    }

    console.log('startPos',startPos,endPos);
    
    jQueryObject[0].setSelectionRange(startPos+1,endPos+1);
}
function determineQuick(keyCode,value){
    //Do a Quick Assesment of Beyond Limit Numbers and then prevent Bubbling
    if($.inArray(keyCode,numberKeys)>-1 && cursorPosition >= value.length ){
        //Determine that keyCode is not for decimal
        if(value.indexOf('.')>-1)
            return true;//This means that a keyCode is after decimal.




        formatNumber();


    }

    return false;
}
function formatNumber(value){

    var negSign=false,integerValue,decimalValue='',formattedValue,decSign=false;
    value=stripOff(value);
    var negIndex=value.indexOf('-');

    if(negIndex>-1){
        negSign=true;
        value=value.replace(/-/g ,'');//Remove the - sign.
    }
    
    var decIndex=value.indexOf('.');


    if(decIndex>-1)
        
        { 
            decSign=true;

        if(value.substr(decIndex+1).length < 2 ) {
            //Incomplete decimal formation. Just Output the comma formatting.
            decimalValue=value.substr(decIndex+1);
            integerValue=value.substr(0,decIndex);//Gets the Integer part only
            decSign=true;
        }
        else if (value.substr(decIndex+1).length >= 2)
        {
            decimalValue=value.substr(decIndex+1,decIndex+2);
            integerValue=value.substr(0,decIndex);
            console.log(decimalValue,integerValue);
        }

    }else{
        integerValue=value;
    }

    if(integerValue==='')
        return ( negSign ? '-' : '' ) + currencyPrefixer + integerValue+ (decSign  ? '.'+decimalValue : '');

     //Format the integer Value
    integerValue=parseInt(integerValue = Math.abs(+integerValue).toFixed(2)).toString();
    
    if(parseFloat(integerValue + (decSign  ? '.'+decimalValue : '')) > vMin ){
        console.log('Infinite',integerValue);
        return 'Infinite';
    }
        

    var j = (j = integerValue.length) > 3 ? j % 3 : 0;
    integerValue=(j ? integerValue.substr(0, j) + ',' : "") + integerValue.substr(j).replace(/(\d{3})(?=\d)/g, "$1" +',');

    formattedValue=( negSign ? '-' : '' ) + currencyPrefixer + integerValue+ (decSign  ? '.'+decimalValue : '');
    return formattedValue
}

/** Get Current Cursor Position */
function ccp(jQueryObject){
    var ctl = jQueryObject[0];
    var startPos = ctl.selectionStart;
    var endPos = ctl.selectionEnd;
    console.log('cursorPoistion',startPos,endPos);
    return (startPos===endPos ? endPos : {'startPos':startPos,'endPos':endPos});
}

function isValKey(e,cursorPosition){

    var target=$(e.target);
    var keyCode=e.keyCode;
    var value=target.val();
    var decIndex=value.indexOf('.');
    
    //Dont Allow Negative Symbol beyond 2 cursor positions
    if(keyCode===189 && cursorPosition>2){
        return false;
    }
	 //Dont Allow more than two decimalkeyCode= Signs
    if(keyCode===190 && value.indexOf('.')>-1){
            return false;    
    }

     //Also dont allow more than 2 decimal places
    if(decIndex > -1 && ( $.inArray(keyCode,numberKeys) > -1 ) && cursorPosition>=value.length){
        if (value.substr(decIndex+1).length === 2)
            return false;
     }

    return ($.inArray(keyCode,allKeys) > -1 ? true : false) ;
}
/* Allow deciMal and negative Sign only once */
function allow(e){

}

var methods = {

	init: function (options) 
		  {
            
             return this.each(function (){


            				$(this).on('keyup',function(e){
            					
                                var $this=$(this);
                                var oldValue=$this.data('formatter').oldValue;
                                var cp=$this.data('formatter').cursorPosition;
                                var delKey=false;

                                if($.inArray(e.keyCode,arrow)>-1 || e.shiftKey===true || e.keyCode===16){
                                    return false;
                                }
                               
                                var newValue=$this.val();
                                var formattedValue=formatNumber(newValue);
                                
                                if(formattedValue==='Infinite'){
                                    formattedValue=formatNumber($this.data('formatter').oldValue);
                                }
                                    

                                if(e.keyCode===8){
                                    delKey=true;
                                }

                                //console.log('keyup - formattedValue',formattedValue);
                                $this.val(formattedValue);
                                setCP($this,oldValue,$this.val(),cp,delKey);

            				});

                            /** only executed when the key is allowed i.e. preventDefault is executed.*/
            				$(this).on('keypress',function(e){
          
            					//console.log('keypress',$(this).val());
                                // /formatNumber($(this).val());
            					
            				});

            				$(this).on('keydown',function(e){
            					
            					
                                var $this=$(this);
                                var cursorPosition=ccp($this);

                                console.log('cursorPosition',cursorPosition);

            					if(!isValKey(e,cursorPosition))
            					  e.preventDefault();

                                //Do a Quick Assesment of Beyond Limit Numbers and then prevent Bubbling
                                if($.inArray(e.keyCode,numberKeys)>-1 && cursorPosition >= $this.val().length ){
                                    
                                    var j=$this.val();
                                    var i=0;
                                    j.indexOf("-") > -1 ? i++:i;
                                    j.indexOf("$") > -1 ? i++:i;

                                    //console.log('#',cursorPosition,parseInt(stripOff(j.substr(i))) , parseInt(vMin));

                                    if(parseInt(stripOff(j.substr(i))+String.fromCharCode(e.keyCode)) > parseInt(vMin))
                                        e.preventDefault();

                                }
                               
                                $this.data('formatter',{'oldValue':$this.val(), 'cursorPosition':cursorPosition});

            				});


                            $(this).on('focusin',function(e){
                                var $this=$(this);
                                var value=$this.val();
                                
                                /* Set the Currency Symbol Default is dollar */
                                if(value===''){
                                    $this.val(currencyPrefixer);
                                }

                            });

            				});
            				
            		}

}

$.fn.autoFormatter=function(options){
	return methods.init.apply(this, arguments);
}



}(jQuery));
