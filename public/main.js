function $(ID) { // I always thought the $ used in jquery was some magic thing, but apparently you can just use $ as a name for functions
	return document.getElementById(ID);
}

function ToggleDarkKey(me, event = new KeyboardEvent()) {
	// let me = event.target;
	if (event.key == 'd') {
		if (me.className == "dark") {
			me.className = "";
		} else {
			me.className = "dark";
		}
	}
}


const pageNames = [
	"Explore",
	"Groups",
	"Draw",
	"Friends"
]

function TabbarPage(index, me) {
	$("PageIntro").innerHTML = pageNames[index];
	$("PageIntro").className = "";
	for (let i = 0; i < 4; i++) {
		let child = $("TabbarIcons").children[i];
		child.className = "";
		if (child.children[0].className == "bi bi-grid-1x2-fill") {
			child.children[0].className = "bi bi-grid-1x2";
		}
		if (child.children[0].className == "bi bi-house-fill") {
			child.children[0].className = "bi bi-house";
		}
		if (child.children[0].className == "bi bi-pencil-fill") {
			child.children[0].className = "bi bi-pencil";
		}
		if (child.children[0].className == "bi bi-people-fill") {
			child.children[0].className = "bi bi-people";
		}
	}
	me.className = "active";
	me.children[0].className += "-fill"
	setTimeout(function () {
		$("PageIntro").className = "exit"
	}, 1000)
}


class Post {
	// if isReply, slightly change the layout to put the comment count on the right next to the username, and remove the favourites star
	constructor(parent, isReply, userID, userUsername, userData, postID, postData, postIsSpoiler, postIsNSFW) {

		let me = this;
		this.user = {
			ID: userID,
			username: userUsername,
			data: userData,
		};
		this.post = {
			ID: postID,
			commentCount: 100,
			favouriteCount: 100,
			// text: postText,
			data: postData,
			isSpoiler: postIsSpoiler,
			isNSFW: postIsNSFW
		};

		this.mainElement = document.createElement("article");
		this.mainElement.className = "ContextPost";

		this.canvasHolder = document.createElement("div");
		this.canvas = document.createElement("canvas");
		if (this.post.isNSFW || this.post.isSpoiler) {
			this.canvas.className = "Blur";
			this.canvasCensor = document.createElement("div");
			// this.canvasCensor
			this.canvasCensorLabel = document.createElement("h1");
			if (this.post.isNSFW) {
				this.canvasCensorLabel.innerHTML = "This post is marked as NSFW";
			} else {
				this.canvasCensorLabel.innerHTML = "This post is marked as a spoiler";
			}
			this.canvasCensorButton = document.createElement("button");
			this.canvasCensorButton.innerHTML = "View anyways";
			this.canvasCensorButton.addEventListener("click", function () {
				me.canvas.className = "";
				me.canvasCensor.remove();
				me.canvas.addEventListener('click', function () {
					OpenPost(me)
				});
			})
			this.canvasCensor.append(this.canvasCensorLabel);
			this.canvasCensor.append(this.canvasCensorButton);
			this.canvasHolder.append(this.canvasCensor);
		} else {
			me.canvas.addEventListener('click', function () {
				OpenPost(me)
			});
		}
		if (isReply) {
			this.canvas.width = 196;
			this.canvas.height = 144;
		} else {
			this.canvas.width = 256;
			this.canvas.height = 196;
		}
		this.userFigure = document.createElement("figure");

		this.username = document.createElement("figcaption");
		this.username.innerHTML = this.user.username;
		this.userIconCanvas = document.createElement("canvas");
		this.userIconCanvas.width = 64;
		this.userIconCanvas.height = 64;

		this.extraButton = document.createElement("button");
		this.extraButton.addEventListener("click", function () {
			console.log('more button')
		});
		this.extraButton.innerHTML = "<i class='bi bi-three-dots'></i>";

		this.postText = document.createElement("p");
		this.postText.innerHTML = this.post.text;


		this.numbersDiv = document.createElement("div");
		this.commentsDiv = document.createElement("div");
		this.commentsDiv.innerHTML += `<i class='bi bi-chat-square'></i><span>${this.post.commentCount}</span>`
		this.commentsDiv.addEventListener('click', function () {

		})
		this.favouritesDiv = document.createElement("div");
		this.favouritesDiv.innerHTML += `<i class='bi bi-star'></i><span>${this.post.favouriteCount}</span>`;
		this.favouritesDiv.addEventListener("click", function () {
			console.log("eeeee")
		});

		this.numbersDiv.append(this.commentsDiv);
		this.numbersDiv.append(this.favouritesDiv);

		this.userFigure.append(this.userIconCanvas);
		this.userFigure.append(this.username);

		this.canvasHolder.append(this.canvas);
		// if (this.post.data != null) {
			this.mainElement.appendChild(this.canvasHolder);
			this.renderImage()
		// }
		this.mainElement.appendChild(this.userFigure);
		if (this.post.text != "" && this.post.text != null) {
			this.mainElement.append(this.postText);
		}
		this.mainElement.append(this.numbersDiv);
		this.postText.addEventListener('click', function () {
			OpenPost(me);
		})



		parent.append(this.mainElement);
	}
	renderImage() {
		let context = this.canvas.getContext("2d");
		let imageData = context.createImageData(256, 196);
		context.imageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.oImageSmoothingEnabled = false;

		let cursor = 0;
		for (let i = 0; i < this.post.data.length; i += 3) {
			let colour = parseInt("0x" + this.post.data[i], 16);
			let duration = parseInt("0x" + this.post.data[i + 1] + this.post.data[i + 2], 16);
			for (let d = 0; d < duration; d++) {
				imageData.data[cursor * 4] = colours[colour][1];
				imageData.data[cursor * 4 + 1] = colours[colour][2];
				imageData.data[cursor * 4 + 2] = colours[colour][3];
				imageData.data[cursor * 4 + 3] = 255;
				cursor += 1;
				if (cursor > 256 * 196 && this.isReply) {
					break;
				} else if (cursor > 196 * 144 && this.isReply) {
					break;
				}
			}

			if (cursor > 256 * 196 && this.isReply) {
				break;
			} else if (cursor > 196 * 144 && this.isReply) {
				break;
			}

		}
		context.putImageData(imageData, 0, 0);
	}
}
const colours = [
	["black", 00, 00, 00],
	["white", 255, 255, 255],
	["gray", 123, 123, 123],
	["red", 255, 0, 0],
	["orange", 255, 128, 0],
	["yellow", 255, 255, 0],
	["green", 0, 255, 0],
	["blue", 0, 64, 192],
	["indigo", 0, 0, 255],
	["violet", 255, 0, 255],
	["dark red", 128, 0, 0],
	["dark orange", 128, 64, 0],
	["dark yellow", 128, 128, 0],
	["dark green", 0, 128, 0],
	["dark blue", 0, 32, 96],
	["dark indigo", 0, 0, 64],
	["dark violet", 0, 96, 96],
]

var posts = [

]

async function RefreshExplore() {
	$("ExplorePageLoading").hidden = false;
	let request = await fetch("https://localhost:3000/api/post/", {
		method: "GET"
	});
	// console.log(request.status);
	let json = await request.json();
	$("ExplorePageLoading").hidden = true;
	for (let i = 0; i < json.length; i++) {
		posts.push(new Post($("ExplorePage"), false, json[i]["UserID"], json[i]["UserDisplayName"], json[i]["UserDisplayIcon"], json[i]["PostID"], json[i]["PostDrawing"], json[i]["PostIsSpoiler"], json[i]["PostIsNSFW"]));
	}

}
RefreshExplore();

var currentPostReplies = []
async function OpenPost(post) {
	$("SinglePostPage").hidden = false;
	$("ExplorePage").hidden = true;
	$("SinglePostCommentsLoading").hidden = false;
	let request = await fetch("https://localhost:3000/api/post/" + post.post.ID + "/", {
		method: "GET"
	});
	let json = await request.json();
	console.log(json);
	$("SinglePostCommentsLoading").hidden = true;
	for (let i = 0; i < json.replies.length; i++) {
		currentPostReplies.push(new Post($("SinglePostComments"), true, json.replies[i]["UserID"], json.replies[i]["UserDisplayName"], json.replies[i]["UserDisplayIcon"], json.replies[i]["PostID"], json.replies[i]["PostDrawing"], json.replies[i]["PostIsSpoiler"], json.replies[i]["PostIsNSFW"]))
	}
}