function $(ID) { // I always thought the $ used in jquery was some magic thing, but apparently you can just use $ as a name for functions
	return document.getElementById(ID);
}

class Post { // store posts inside a class, makes it easier to use
	// if isReply, slightly change the layout to put the comment count on the right next to the username, and remove the favourites star
	constructor(isReply, userID, userUsername, userData, postID, postData, postIsSpoiler, postIsNSFW, postDate, commentCount) {
		this.isReply = isReply;
		this.user = {
			ID: userID,
			username: userUsername,
			data: userData,
		};
		this.post = {
			ID: postID,
			commentCount: commentCount,
			favouriteCount: 0,
			data: postData,
			isSpoiler: postIsSpoiler,
			isNSFW: postIsNSFW,
			date: postDate
		};
	}
	render (parent) {
		let me = this;
		this.mainElement = document.createElement("article");
		if (this.isReply) {
			this.mainElement.className = "ReplyPost";
		} else {
			this.mainElement.className = "ContextPost";
		}
		this.canvasHolder = document.createElement("div");
		this.canvas = document.createElement("canvas");
		if (this.post.isNSFW || this.post.isSpoiler) {
			this.canvas.className = "Blur";
			// this.canvasCensor
			this.canvasCensorButton = document.createElement("button");
			if (this.post.isNSFW) { // need to think about what it would say if its nsfw and a spoiler, or if there should just be 2 seperate censors
				this.canvasCensorButton.innerHTML = "NSFW";
			} else {
				this.canvasCensorButton.innerHTML = "Spoiler";
			}
			this.canvasCensorButton.addEventListener("click", function () { // clicking on the button in the middle of the canvas
				me.canvas.className = "";
				me.canvasCensorButton.remove();
				if (!this.isReply) {
					me.canvas.addEventListener('click', function () {
						OpenPost(me); // open the single page view of the post, but only after the user has accepted they want to see a spolier or nsfw stuff
					});
				}
			})
			this.canvasHolder.append(this.canvasCensorButton);
		} else if (!this.isReply) {
			me.canvas.addEventListener('click', function () {
				OpenPost(me); // open the single page view of the post
			});
		}
		if (this.isReply) {
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
			// bring up the menu to report the post
		});
		this.extraButton.innerHTML = "<i class='bi bi-three-dots'></i>";


		this.numbersDiv = document.createElement("div");
		if (!this.isReply) { // for now I don't want to have replies to replies, but due to a lack of text you can't really mention a user without having it be nested. further considerations for later
			this.commentsDiv = document.createElement("div");
			this.commentsDiv.innerHTML += `<i class='bi bi-chat-square'></i><span>${this.post.commentCount}</span>`
			this.numbersDiv.append(this.commentsDiv);
		}
		this.favouritesDiv = document.createElement("div");
		this.favouritesDiv.innerHTML += `<i class='bi bi-star'></i><span>${this.post.favouriteCount}</span>`;
		this.favouritesDiv.addEventListener("click", function () {
			//this function is to add a post to the user's favourites, which is yet to be implemented on the databaes
		});

		this.numbersDiv.append(this.favouritesDiv);

		this.userFigure.append(this.userIconCanvas);
		this.userFigure.append(this.username);

		this.canvasHolder.append(this.canvas);
		this.mainElement.append(this.canvasHolder);
		this.mainElement.append(this.userFigure);

		this.userFigure.append(this.numbersDiv);

		if (this.isReply) this.imageData = renderImage(this.canvas, this.post.data, 192, 144); // render the image
		else this.imageData = renderImage(this.canvas, this.post.data, 256, 192); // render the image
		
		this.parent = parent;
		this.parent.append(this.mainElement);
	}
	remove() {
		this.mainElement.remove();
	}

}
class Group { // making these classes with their render functions makes me appreciate what react and stuff aim to do, because this can get a bit tedious
	constructor(groupID, groupName, groupData, groupDescription, groupDate, userID, userUsername, userData) {
		this.group = {
			ID: groupID,
			name: groupName,
			data: groupData,
			description: groupDescription,
			date: groupDate,
			user: {
				ID: userID,
				username: userUsername,
				data: userData
			}
		};
	}
	render(parent) { // render this element into a parent, creating every html object. Doing this is the reason why a layout framework wasn't used, cause I save time having to add classnames (I guess having so much css would balance that out, but it gives me total control)
		let me = this;
		// this only renders the small block used for single posts and the groups page
		this.mainElement = document.createElement("figure");

		this.nameElement = document.createElement("figcaption");
		this.nameElement.innerHTML = this.group.name;

		this.canvas = document.createElement("canvas");
		this.canvas.width = 96;
		this.canvas.height = 96;

		this.mainElement.append(this.canvas);
		this.mainElement.append(this.nameElement);
		this.mainElement.addEventListener('click', function () {
			OpenGroup(me) // opens the single page view of the group
		});
		// this.mainElement.
		this.parent = parent;
		this.parent.append(this.mainElement);

		this.imageData = renderImage(this.canvas, this.group.data, 96, 96);
	}
	remove() {
		this.mainElement.remove();
	}
}

function ToggleDarkKey(me, event = new KeyboardEvent()) { // just for debugging, toggle the theme when d is pressed
	// let me = event.target;
	if (event.key == 'd') {
		if (me.className == "dark") {
			me.className = "";
		} else {
			me.className = "dark";
		}
	}
}

function test() {
	console.log('test');
}

const pages = [{
		name: "Explore",
		func: ExplorePage
	},
	{
		name: "Groups",
		func: test
	},
	{
		name: "Draw",
		func: test
	},
	{
		name: "Friends",
		func: test
	}
]

function TabbarPage(index, me) {
	$("PageIntro").innerHTML = pages[index].name;
	pages[index].func(); // should call the function
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

function CloseAllPages() {
	$("ExplorePage").hidden = true;
	$("SinglePostPage").hidden = true;
	$("SingleGroupPage").hidden = true;
}

function renderImage(canvas, data, width, height) {
	let context = canvas.getContext("2d");
	let imageData = context.createImageData(256, 196);
	context.imageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.msImageSmoothingEnabled = false;
	context.oImageSmoothingEnabled = false;

	let cursor = 0;
	for (let i = 0; i < data.length; i += 3) {
		let colour = parseInt("0x" + data[i], 16);
		let duration = parseInt("0x" + data[i + 1] + data[i + 2], 16);
		for (let d = 0; d < duration; d++) {
			imageData.data[cursor * 4] = colours[colour][1];
			imageData.data[cursor * 4 + 1] = colours[colour][2];
			imageData.data[cursor * 4 + 2] = colours[colour][3];
			imageData.data[cursor * 4 + 3] = 255;
			cursor += 1;
			if (cursor > width * height) {
				break;
			}
		}

		if (cursor > width * height) {
			break;
		}

	}
	context.putImageData(imageData, 0, 0);
	return imageData;
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

var explorePosts = []

function ExplorePage() { // at the moment this is just selects a bit of data from all posts, but in the future this will filter based on the users preferences
	for (let i = 0; i < explorePosts.length;i++) {
		explorePosts[i].remove() // remove existing html
	}
	explorePosts = [];
	CloseAllPages()
	$("ExplorePage").hidden = false;
	$("ExplorePageLoading").hidden = false;
	fetch("https://localhost:3000/api/post/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		$("ExplorePageLoading").hidden = true;
		for (let i = 0; i < data.length; i++) {
			let newPost = new Post(false, data[i]["UserID"], data[i]["UserDisplayName"], data[i]["UserDisplayIcon"], data[i]["PostID"], data[i]["PostDrawing"], data[i]["PostIsSpoiler"], data[i]["PostIsNSFW"], data[i]["PostCreateTime"], data[i]["ReplyCount"]);
			newPost.render($("ExplorePage"));
			explorePosts.push(newPost);
		}
	}).catch();

}

let currentSinglePostReplies = [];

function OpenPost(post) {
	if (post.isReply) {
		return null
	}
	for (let i = 0; i < currentSinglePostReplies.length; i++) {
		currentSinglePostReplies[i].remove();
	}
	currentSinglePostReplies = [];
	CloseAllPages();
	$("SinglePostPage").hidden = false;
	$("SinglePostCommentsLoading").hidden = false;
	$("SinglePostDate").innerHTML = new Date(post.post.date * 1000).toLocaleDateString("en-GB"); // convert the unix time int of the post into a date time - timezones arent accounted for yet
	$("SinglePostUsername").innerHTML = post.user.username;
	$("SinglePostCanvas").getContext("2d").putImageData(post.imageData, 0, 0);
	$("SinglePostGroupHolder").innerHTML = ""; // remove the html from the previous group wasnt cleared, finish the job
	$("SinglePostCommentsHeader").innerHTML = post.post.commentCount + " Replies";
	if (post.post.commentCount == 1) $("SinglePostCommentsHeader").innerHTML = post.post.commentCount + "Reply"; // grammar
	fetch("https://localhost:3000/api/post/" + post.post.ID + "/", { // in the future, instead of sending an object with all of the posts that includes their data, send an array like ['0123', '4567', 'etc'] that the server can fetch for each post individually - or in sections - instead of all at once
		method: "GET"
	}).then(response => response.json()).then((data) => { // the usual fetch json
		$("SinglePostCommentsLoading").hidden = true;
		let group = new Group(data.group[0]["GroupID"], data.group[0]["GroupDisplayName"], data.group[0]["GroupDisplayIcon"], data.group[0]["GroupDescription"], data.group[0]["GroupDate"], data.group[0]["UserID"], data.group[0]["UserDisplayName"], data.group[0]["UserDisplayIcon"]); // the little group icon with the groupname
		group.render($("SinglePostGroupHolder"));
		for (let i = 0; i < data.replies.length; i++) {
			let newReply = new Post(true, data.replies[i]["UserID"], data.replies[i]["UserDisplayName"], data.replies[i]["UserDisplayIcon"], data.replies[i]["PostID"], data.replies[i]["PostDrawing"], data.replies[i]["PostIsSpoiler"], data.replies[i]["PostIsNSFW"]); // the replies to the post
			newReply.render($("SinglePostComments"));
			currentSinglePostReplies.push(newReply); // there isnt a 100% reason that these posts are inside an array, considering this array isn't accessed... might need to rethink
		}
	}).catch(
		//couldn't connect to server
	);

	// let group = new Group($("SinglePostGroupHolder"), post.group.ID, post.group.name, post.group.data, post.group.description, post.group.date, post.group.user
}

let currentSingleGroupPosts = [];

function OpenGroup(group) {
	for (let i = 0; i < currentSingleGroupPosts.length; i++) {
		currentSingleGroupPosts[i].remove();
	};
	currentSingleGroupPosts = [];
	CloseAllPages();

	$("SingleGroupPage").hidden = false;
	$("SingleGroupPostsLoading").hidden = false;
	$("SingleGroupName").innerHTML = group.group.name;
	renderImage($("SingleGroupCanvas"), group.group.data, 96, 96);
	fetch("https://localhost:3000/api/post/group/" + group.group.ID + "/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		$("SingleGroupPostsLoading").hidden = true;
		for (let i = 0; i < data.length; i++) {
			let newPost = new Post(false, data[i]["UserID"], data[i]["UserDisplayName"], data[i]["UserDisplayIcon"], data[i]["PostID"], data[i]["PostDrawing"], data[i]["PostIsSpoiler"], data[i]["PostIsNSFW"], data[i]["PostCreateTime"], data[i]["ReplyCount"]);
			currentSingleGroupPosts.push(newPost);
			newPost.render($("SingleGroupPosts"));
		}
	}).catch()
}


// add a page history with the type of content adn the ID ? maybe a list of functions?
// [OpenPost('abdabsdsadsad'), Opengroup('absdbasbdbsd')] etc ect
// go back by -1 when using the back arrow
// lets hope that works gotta go to work now