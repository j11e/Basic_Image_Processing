/*
	Basic Image Processing library v0.0.1
	by Jean-Dominique Innocenti <jd.innocenti@gmail.com>
	
	Released under DWTFYWT licence
	Date: Nov 17 2012
*/

(function(window, undefined) {
	var	document = window.document,
		canvas = undefined,	 // defined at the end of the file. The canvas element used to get image data.
		context = undefined, // will store the canvas' context. Defined at the end of the file.
		imageIsLoaded = false, // used to make sure no operation is done without an image loaded in the canvas.
		pixelsData = undefined, // used to store the imageData object retrieved from the canvas in loadImage()
		BasicImageProcessing = {};	
	
	BasicImageProcessing.convertToGrayscale = function(rgbaImageData) 
	{
		// this functin can be used without an image loaded in the canvas, as it takes any image data object as argument.
		
		// inspired by http://jsperf.com/convert-rgba-to-grayscale
		var srcLength = rgbaImageData.data.length;
		var grayscaleArray = new Array(srcLength >> 2); // ie srcLength/4
		
		for (var i = 0; i < srcLength; i += 4) {
			grayscaleArray[i >> 2] = (rgbaImageData.data[i] * 306 + rgbaImageData.data[i + 1] * 601 + rgbaImageData.data[i + 2] * 117) >> 10;
		}
		
		for(var i=0; i< rgbaImageData.data.length; i++)
		{
			rgbaImageData.data[4*i] = grayscaleArray[i];
			rgbaImageData.data[(4*i)+1] = grayscaleArray[i];
			rgbaImageData.data[(4*i)+2] = grayscaleArray[i];
			
			// the line below is useless: the alpha value stays unchanged
			//rgbaImageData.data[(4*i)+3] = grayscaleArray[i+3]; 
		}
		
		console.log("BasicImageProcessing: Pixel data converted to grayscale.");
		return rgbaImageData;
	};

	BasicImageProcessing.loadImage = function(url) 
	{
		imageIsLoaded = false;
		
		var imageObj = document.createElement("img");
		imageObj.id = "basicImageProcessing_tempImg";
		imageObj.style.position = "absolute"; // absolutely placed somewhere it can't be seen
		imageObj.style.top = -1000;			  // the image element needs to be displayed for its size to be known
		imageObj.style.left = -1000;
		
		imageObj.onload = function() {  // the onload event is fired when the image finished loading.
			imageIsLoaded = true;
			canvas.width = imageObj.clientWidth; // clientWidth/Height is the width/height of the displayed content, not counting any margin/border
			canvas.height = imageObj.clientHeight;
			
			context.drawImage(imageObj, 0,0); // draws the image in the canvas, necessary to get the image data
			pixelsData = context.getImageData(0,0,imageObj.clientWidth,imageObj.clientHeight);
			// computing the integral image is done on a grayscale picture, so we convert the image data
			pixelsData = BasicImageProcessing.convertToGrayscale(pixelsData);
			
			document.body.removeChild(document.getElementById(imageObj.id)); // cleans up the DOM
			console.log("BasicImageProcessing: Image loaded.");
		};
		
		document.body.appendChild(imageObj);
		imageObj.src = url;
	};

	BasicImageProcessing.getImageData = function() 
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}
		
		return pixelsData;
	};

	BasicImageProcessing.getOriginalPixelValue = function(x, y)
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}
		
		// checking the parameters are valid
		
		// x and y must be integers >= 0
		if(isNaN(Number(x)) || isNaN(Number(y)))
		{
			throw "The coordinates must be numbers."
		}	
		if(Number(x) < 0 || Number(y) < 0)
		{
			throw "The coordinates must be positive.";
		}
		
		x = Number(x);
		y = Number(y);
		
		// (X,Y): Xth column, Yth row, (0,0) being the top left hand corner of the picture
		// each pixel is represented by four values (red, green, blue, and alpha, in that order; aka "RGBA" format)
		// but the image has been converted to grayscale, so red==green==blue
		// the pixelsData.data array contains all pixels, row by row. So array[0-3] is (0,0), array[4-7] is (1,0)...
		var value = pixelsData.data[((y*(canvas.width*4)) + (x*4))];
		
		return value;
	};

	BasicImageProcessing.getIntegralPixelValue = function(x, y)
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}	
	
		// checking the parameters are valid

		// x and y must be integers >= 0
		if(isNaN(Number(x)) || isNaN(Number(y)))
		{
			throw "The coordinates must be numbers."
		}	
		if(Number(x) < 0 || Number(y) < 0)
		{
			throw "The coordinates must be positive.";
		}	
		x = Number(x);
		y = Number(y);
		
		return integralPixelValuesArray[y*canvas.width + x];
	};

	BasicImageProcessing.getImageDimensions = function() 
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}
		
		var dims = [canvas.width, canvas.height];
		return dims;
	};

	BasicImageProcessing.getRegionIntegralImage = function(x, y, width, height)
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}
		
		// checking the parameters are valid

		// x and y must be integers >= 0
		if(isNaN(Number(x)) || isNaN(Number(y)))
		{
			throw "The coordinates must be numbers."
		}	
		if(Number(x) < 0 || Number(y) < 0)
		{
			throw "The coordinates must be positive.";
		}	
		x = Number(x);
		y = Number(y);
		
		// width and height must be integers >= 0
		if(isNaN(Number(width)) || isNaN(Number(height)))
		{
			throw "The region's dimensions must be numbers."
		}	
		if(Number(width) < 0 || Number(height) < 0)
		{
			throw "The region's dimensions must be positive.";
		}	
		width = Number(width);
		height = Number(height);
		
		// computes the integral image of the rectangular region defined by the four points:
		// (x,y), (x+width, y), (x, y+height), (x+width, y+height)
		// if x == 0 and y ==0 , then:
		var integralArray = integralPixelValuesArray;
		var regionIntegral = integralArray[(y+height)*canvas.width + (x+width)];
		console.log("lol "+regionIntegral);
		
		// if x != 0, or y != 0, or both, we have some pixel values to substract.
		if(!(x == 0 && y == 0)) 
		{
			// x != 0: we remove all the pixel values on the left
			if(x != 0) 
			{
				regionIntegral -= BasicImageProcessing.getRegionIntegralImage(0, 0, x, y+height);
			}
			
			// y != 0: we remove all the pixel values above
			if(y != 0)
			{
				regionIntegral -=  BasicImageProcessing.getRegionIntegralImage(0, 0, x+width, y);
			}
			
			// y != 0 and x != 0: we removed the (0, 0, x, y) area twice, so we correct that
			if(x != 0 && y != 0) 
			{
				regionIntegral += BasicImageProcessing.getRegionIntegralImage(0, 0, x, y);
			}
		}
							
		return regionIntegral;
	};

	BasicImageProcessing.computeIntegralImage = function() 
	{
		// this function can only be called if an image has been loaded.
		if(!imageIsLoaded)
		{
			throw "The image hasn't finished loading or no image was loaded.";
		}
		
		// computes the integral image of the whole picture
		var originalPixelValue;
		var integralArray = new Array(canvas.width*canvas.height);
		
		for(var column=0; column<canvas.width; column++) 
		{
			for(var row=0; row<canvas.height; row++)
			{
				originalPixelValue = BasicImageProcessing.getOriginalPixelValue(column,row);
				
				// top left hand corner: no pixels on the left nor above
				if(column==0 && row==0)
				{
					integralArray[(row*canvas.width)+column] = originalPixelValue;
				}
				
				// no pixels on the left
				else if(column == 0)
				{
					integralArray[row*canvas.width + column] = originalPixelValue + integralArray[(row-1)*canvas.width + column];
				}
				
				// no pixels above
				else if(row == 0)
				{
					integralArray[row*canvas.width + column] = originalPixelValue + integralArray[row*canvas.width + (column-1)];
				}
				
				// pixels on the left and above
				else 
				{
					integralArray[row*canvas.width + column] = originalPixelValue + integralArray[row*canvas.width + (column-1)]
																+ integralArray[(row-1)*canvas.width + column]
																- integralArray[(row-1)*canvas.width + (column-1)];
				}
			}
		}
		
		integralPixelValuesArray = integralArray;
		console.log("BasicImageProcessing: Integral image computed.");
	};

	canvas = document.createElement("canvas");
	canvas.width = "200"; // when it comes to canvas elements, width and height are set using direct attributes, not the style attribute
	canvas.height = "200"; 
	canvas.id = "monCanvas";

	var context = canvas.getContext('2d');
	
	window.BasicImageProcessing = BasicImageProcessing;
	
	console.log("BasicImageProcessing loaded");
})(window);