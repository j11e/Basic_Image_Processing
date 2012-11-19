function loadBasicImageProcessingTests()
{
	BasicImageProcessing.loadImage("./kiwi.png");
	
	var canvas = document.createElement("canvas");
	canvas.id = "test_canvas";
	canvas.width = "400";
	canvas.height = "400";
	canvas.style.border = "1px solid red";
	document.body.appendChild(canvas);
	
	console.log("canvas added");
	
	setTimeout(doTests, 1000); // the image needs a little time to load, so let's wait a second
}

function drawPicture() 
{
	var canvas = document.getElementById("test_canvas");
	var imageDims = BasicImageProcessing.getImageDimensions();
	canvas.width = imageDims[0];
	canvas.height = imageDims[1];
	canvas.getContext("2d").putImageData(BasicImageProcessing.getImageData(),0,0);
}

function doTests()
{
	// 1st: let's draw the picture, which has been converted to grayscale
	drawPicture();
	console.log("Tests: picture drawn");
	
	// now let's compute the integral image
	BasicImageProcessing.computeIntegralImage();
	console.log("Tests: integral image computed");

	// okay, now let's see if that worked. 
	// let's print a bunch of numbers in a div.

	var div = document.createElement("div");
	div.style.border = "1px solid black";

	var results = [];
	results.push(BasicImageProcessing.getOriginalPixelValue(0,0));
	results.push(BasicImageProcessing.getOriginalPixelValue(0,1));
	results.push(BasicImageProcessing.getOriginalPixelValue(1,0));
	results.push(BasicImageProcessing.getOriginalPixelValue(1,1));
	
	results.push(BasicImageProcessing.getIntegralPixelValue(1,1));
	div.innerHTML = "Here are the values of pixels at (0,0), (0,1), (1,0), (1,1): <br/>";
	div.innerHTML += results[0] + "; " + results[1] + "; " + results[2] + "; " + results[3]+ "<br/>";
	div.innerHTML += "And here's the integral image's pixel value at (1,1), the sum of the four previous pixels: "+results[4]+".";
	
	document.body.appendChild(div);
	console.log("tests: div added.");	
}