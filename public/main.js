// console.log ((0x2f+0x1a).toString());

//
// this should give 128 white pixels, 1 blakc pixel, and 127 white pixels again
var l = "00800101007f00800101007f00800101007f00800101007f00800101007f00800101007f00800101007f00800101007f00800101007f"

for (var i = 0; i < l.length; i+=3) {
	console.log(l[i],l[i+1],l[i+2]);
}