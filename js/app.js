$(document).ready(function() {
	//jQuery elements
	var satBox = $( '.sat' );//saturation
	var hueBox = $( '.hue' );
	var satCursor = $( '.sat .cursor' );
	var hueCursor = $( '.hue .cursor' );
	var baseColour = $( '.basecolor' );
	//max value the saturation cursor can reach inside its bounding box, takes cursor size into account
	var maxSatW = satBox.width() - satCursor.width();
	var maxSatH = satBox.height() - satCursor.height();
	//max value the hue cursor can reach inside its bounding box, takes cursor size into account
	var maxHueW = hueBox.width() - hueCursor.width();
	/* The hue/spectrum box length is devided into 6 segments */
	var seg = maxHueW/6;
	var valPerPx = seg/255;	
	//initialise colour display
	displayColour();
	
	/*in an RGB colour model the hue changes according to this diagram http://upload.wikimedia.org/wikipedia/commons/5/5d/HSV-RGB-comparison.svg*/
	
	/**calculates hue based on hueCursor position inside hueBox
	@param 	x - int, position of hueCursor inside hueBox
	@return string of format "r,g,b"
	*/
	function calcHue(x){		
		var r=0,g=0,b=0;
		if(x<seg){
			r = 255;
			g = x/valPerPx;
			b = 0;
		}
		else if(x>seg && x<2*seg){
			r = 255-(x-seg)/valPerPx;
			g = 255;
			b = 0;
		}
		else if(x>2*seg && x<3*seg){
			r = 0;
			g = 255;
			b = (x-2*seg)/valPerPx;
		}
		else if(x>3*seg && x<4*seg){
			r = 0;
			g = 255-(x-3*seg)/valPerPx;
			b = 255;
		}
		else if(x>4*seg && x<5*seg){
			r = (x-4*seg)/valPerPx;
			g = 0;
			b = 255;
		}
		else if(x>5*seg){
			r = 255;
			g = 0;
			b = 255-(x-5*seg)/valPerPx;
		}	
		return Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b);
	}
	/**calculate saturation (shade) while dragging or clicking in the saturation box
	@param
	colour - string of format "r,g,b"
	top - top position of satCursor inside satBox
	left - left position of satCursor inside satBox
	@return - string "r,g,b"
	*/
	function calcSat(colour, top, left){	
		//if colour is in format of rgb(x,y,z)
		colour = colour.split(',');
		var r = parseInt(colour[0]);
		var g = parseInt(colour[1]);
		var b = parseInt(colour[2]);	
		//calculate x value (between white and max saturation) from cursor (x,y) position relative to box 
		r = Math.floor(255 - (255-r)*left/maxSatW);
		g = Math.floor(255 - (255-g)*left/maxSatW);
		b = Math.floor(255 - (255-b)*left/maxSatW);
		//calculate y value (between white and black) and multiply x by y
		r = Math.floor(r*(1-top/maxSatH));
		g = Math.floor(g*(1-top/maxSatH));
		b = Math.floor(b*(1-top/maxSatH));
		
		return r + ',' + g + ',' + b;
	}
	/**display selected colour as a swatch and as hex and rgb values*/
	function displayColour(){
		//hue cursor position inside bounding box
		var x = hueCursor.offset().left - hueBox.offset().left;
		//base colour at max saturation
		var satVal = calcHue(x);
		baseColour.css('background','rgb('+satVal+')');
		//saturation
		var left =  satCursor.offset().left - satBox.offset().left;
		var top = satCursor.offset().top - satBox.offset().top;
		var colour = calcSat(satVal, top, left);
		var rgb_color = 'rgb('+ colour + ')';
		var hex_colour = '#' + rgbToHex(colour);
		//show feedback swatch and rgb() colour value text
		$('.feedback p').text(rgb_color + ', ' + hex_colour);
		$('.feedback .swatch').css('background',rgb_color).attr({'data-rgb':rgb_color,'data-hex':hex_colour});
	}
	
	/**converts rgb to hex
	@param 	colour - string of format "r,g,b"
	@return - hex string of colour value*/
	function rgbToHex(colour){
		colour = colour.split(',');
		var r = parseInt(colour[0]);
		var g = parseInt(colour[1]);
		var b = parseInt(colour[2]);
		return decToHex(r) + '' + decToHex(g) + '' + decToHex(b);
	}
	
	/**converts decimal int value to hex string of two characters
	@param 	dec - int decimal value
	@return - hex string of two chars between 0-9 and A-F, e.g: FF, A5, 5B etc. 
	*/
	function decToHex(dec){
	/**The formula for converting an int value between 0-255 to hex value of two chars 	XY, if we have an int value R:
		X = parseInt(R/16);
		Y = parseInt(R%16);
		e.g:
		R = 182;
		X = parseInt(182/16) = 11;
		11 will then be converted to char B using function intToChar(11) that will return B
		Y = parseInt(6%16) = 6;
		and so: 182 = B6
		*/
		var hex = intToChar(parseInt(dec/16)) + '' + intToChar(dec%16);
		return hex;
	}
	
	/**convert int values between 10-15 to alphabet characters A-F to represent a hex value
	@param
	x - int value
	@return - x converted to hex character
	*/
	function intToChar(x){
		/**Hex characters 0-9 are numbers, 10-15 are letters A-F. 
		Because x is not entered by user but calculated in the code it'll never be larger than 15, so we only check if it's larger than 9 (lower limit).*/
		if(x>9){
			var chars = 'abcdef';
			var index = x.toString().charAt(1);
			/**e.g:
			If x=10  =>  x.charAt(1)=0 
			If x=15  =>  x.charAt(1)=5 
			*/
			x = chars[index];		
			/**e.g:
			x=chars[0] => x='a'
			*/
		}
		return x;
	}
	//set draggables
	satCursor.draggable({ 
		containment: 'parent',		 
		drag: function() {
			displayColour();
		}
	});
	hueCursor.draggable({ 
		containment: 'parent', 
		axis: 'x',
		drag: function() {
			displayColour();
		} 
	});
	//set click listeners
	satBox.click(function(e) {
		/*If clicked too close to right or bottom of saturation box (distance less than cursor width or height, accordingly) the cursor will appear outside the box, because the cursor's registration point is in its top left corner,so top left corner will be where the mouse click occured. We need to account for this and limit the max point of cursor appearance to "box.width - cursor.width" or "box.height - cursor.height".
		*/
		var limitX = satBox.offset().left + maxSatW;
		if(e.pageX >= limitX){
			satCursor.offset({left: limitX });
		}else{
			satCursor.offset({left: e.pageX });
		}
		var limitY = satBox.offset().top + maxSatH;
		if(e.pageY >= limitY){
			satCursor.offset({ top: limitY});
		}else{
			satCursor.offset({ top: e.pageY});
		}
		displayColour();
	});
	hueBox.click(function(e) {
		var limit = hueBox.offset().left + maxHueW;
		if(e.pageX > limit){
			hueCursor.offset({left: limit});
		}else{
			hueCursor.offset({left: e.pageX});
		}
		displayColour();
	});
	//custom drag and drop
	$('.swatch').mousedown(function(e){
		var drag = $(this).clone();
		drag.addClass("draggable").appendTo('body').css({"left": e.pageX, "top": e.pageY});
		//remove all bubbles
		$('.bubble').remove();
		
		$('html').mousemove(function (e) {
			drag.css({"left": e.pageX, "top": e.pageY});			
		});
		
		$('html').mouseup(function (e) {
			$('html').off("mousemove mouseup");
			var swb = $('.swatchbox');
			var l = swb.offset().left, 
			r = swb.offset().left + swb.width(), 
			t = swb.offset().top, 
			b = swb.offset().top + swb.height();
			//if clone swatch released over swatchbox allow drop, otherwise remove clone
			if(e.pageX > l && e.pageX < r && e.pageY > t && e.pageY < b){
				drag.appendTo('.swatchbox').removeClass("swatch draggable").addClass("saved").css({'left':'','top':''});
				drag.click(function() {
					//remove all other bubbles
					$('.bubble').remove();
					//create new bubble to show the rgb and hex value of the clicked swatch
					var bubble = $('<div class="bubble"/>');
					//add tooltip and close button
					bubble.append('<div class="tip"/>','<div class="close">x</div>');
					//place bubble under clicked swatch, extra 10px for tooltip height
					bubble.css({"left": $(this).offset().left, "top": $(this).offset().top + $(this).height() + 10});
					//display values of 'data-rgb' and 'data-hex' attributes of the clicked swatch
					bubble.append('<p>' +$(this).attr('data-rgb')+ '<br>'+ $(this).attr('data-hex')+'</p>');
					bubble.appendTo('body');
					$('.close').click(function(){
						bubble.remove();
					});
				});
			}else{
				$('.draggable').remove();
			}
		});
	});
});

