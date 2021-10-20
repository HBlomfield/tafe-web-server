const hostURL = window.location.href.slice(0, -18);
function LoadServiceWorker() {
	navigator.serviceWorker.register("/public/serviceWorker.js").then(registration => {
		// console.log(registration);
	}, (err) => console.log(err));
	// console.log("service worker added");
}

function $(ID) { // I always thought the $ used in jquery was some magic thing, but apparently you can just use $ as a name for functions
	return document.getElementById(ID);
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
class Post { // store posts inside a class, makes it easier to use
	// if isReply, slightly change the layout to put the comment count on the right next to the username, and remove the favourites star
	constructor(isReply, user, postID, postData, postIsSpoiler, postIsNSFW, postDate, commentCount) {
		this.isReply = isReply;
		this.user = user;
		this.ID = postID;
		this.favouriteCount = 0;
		this.data = postData;
		this.isSpoiler = postIsSpoiler;
		this.isNSFW = postIsNSFW;
		this.date = postDate;
		this.commentCount = commentCount;

	}
	render(parent) {
		let me = this;
		this.mainElement = document.createElement("article");
		if (this.isReply) {
			this.mainElement.className = "ReplyPost";
		} else {
			this.mainElement.className = "ContextPost";
		}
		this.canvasHolder = document.createElement("div");
		this.canvas = document.createElement("canvas");
		if (this.isNSFW || this.isSpoiler) {
			this.canvas.className = "Blur";
			// this.canvasCensor
			this.canvasCensorButton = document.createElement("button");
			if (this.isNSFW) { // need to think about what it would say if its nsfw and a spoiler, or if there should just be 2 seperate censors
				this.canvasCensorButton.innerHTML = "NSFW";
			} else {
				this.canvasCensorButton.innerHTML = "Spoiler";
			}
			this.canvasCensorButton.addEventListener("click", function () { // clicking on the button in the middle of the canvas
				me.canvas.className = "";
				me.canvasCensorButton.remove();
				if (!this.isReply) {
					me.canvas.addEventListener('click', function () {
						OpenPost(me, true); // open the single page view of the post, but only after the user has accepted they want to see a spolier or nsfw stuff
					});
				}
			})
			this.canvasHolder.append(this.canvasCensorButton);
		} else if (!this.isReply) {
			me.canvas.addEventListener('click', function () {
				OpenPost(me, true); // open the single page view of the post
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
			this.commentsDiv.innerHTML += `<i class='bi bi-chat-square'></i><span>${this.commentCount}</span>`
			this.numbersDiv.append(this.commentsDiv);
		}
		this.favouritesDiv = document.createElement("div");
		this.favouritesDiv.innerHTML += `<i class='bi bi-star'></i><span>${this.favouriteCount}</span>`;
		this.favouritesDiv.addEventListener("click", function () {
			//this function is to add a post to the user's favourites, which is yet to be implemented on the databaes
		});

		this.numbersDiv.append(this.favouritesDiv);


		// this.userFigure.append(this.userIconCanvas);
		// this.userFigure.append(this.username);

		this.canvasHolder.append(this.canvas);
		this.mainElement.append(this.canvasHolder);
		// this.mainElement.append(this.userFigure);

		this.user.render(this.mainElement);
		this.mainElement.append(this.numbersDiv);

		if (this.data != null) {
			if (this.isReply) this.imageData = renderImage(this.canvas, this.data, 192, 144); // render the image
			else this.imageData = renderImage(this.canvas, this.data, 256, 192); // render the image
		}
		this.parent = parent;
		this.parent.append(this.mainElement);
	}
	remove() {
		this.mainElement.remove();
	}

}
class Group { // making these classes with their render functions makes me appreciate what react and stuff aim to do, because this can get a bit tedious
	constructor(user, groupID, groupName, groupData, groupDescription, groupDate) {

		this.ID = groupID;
		this.name = groupName;
		this.data = groupData;
		this.description = groupDescription;
		this.date = groupDate;
		this.user = user;
	}
	render(parent) { // render this element into a parent, creating every html object. Doing this is the reason why a layout framework wasn't used, cause I save time having to add classnames (I guess having so much css would balance that out, but it gives me total control)
		let me = this;
		// this only renders the small block used for single posts and the groups page
		this.mainElement = document.createElement("figure");

		this.nameElement = document.createElement("figcaption");
		this.nameElement.innerHTML = this.name;

		this.canvas = document.createElement("canvas");
		this.canvas.width = 96;
		this.canvas.height = 96;

		this.mainElement.append(this.canvas);
		this.mainElement.append(this.nameElement);
		this.mainElement.addEventListener('click', function () {
			OpenGroup(me, true) // opens the single page view of the group
		});
		// this.mainElement.
		this.parent = parent;
		this.parent.append(this.mainElement);

		if (this.data != null) this.imageData = renderImage(this.canvas, this.data, 96, 96);
	}
	remove() {
		this.mainElement.remove();
	}
}
class User {
	constructor(userID, userUsername, userData, userBio, userDate) {
		this.userID = userID;
		this.username = userUsername;
		this.data = userData;
		this.bio = userBio;
		this.userDate = userDate;
	}
	render(parent) { // render this element into a parent, creating every html object. Doing this is the reason why a layout framework wasn't used, cause I save time having to add classnames (I guess having so much css would balance that out, but it gives me total control)
		let me = this;
		// this only renders the small block used for single posts and the groups page
		this.mainElement = document.createElement("figure");

		this.nameElement = document.createElement("figcaption");
		this.nameElement.innerHTML = this.username;

		this.canvas = document.createElement("canvas");
		this.canvas.width = 96;
		this.canvas.height = 96;

		this.mainElement.append(this.canvas);
		this.mainElement.append(this.nameElement);
		this.mainElement.addEventListener('click', function () {
			OpenUser(me, true) // opens the single page view of the group
		});
		// this.mainElement.
		this.parent = parent;
		this.parent.append(this.mainElement);
		// console.log(this);
		if (this.data != null) this.imageData = renderImage(this.canvas, this.data, 96, 96);
	}
	remove() {
		this.mainElement.remove();
	}
}

// fetch ()


let localUserEmail = localStorage.getItem("localUserEmail");
let localUserName = localStorage.getItem("localUserName");
let localUserData = localStorage.getItem("localUserData");
let localUserBio = localStorage.getItem("localUserBio");
let localUserDate = localStorage.getItem("localUserDate");
let localUserVerified = localStorage.getItem("localUserVerified");

if (localUserEmail) {
	// Alert("You are already logged in.", OptionsPage, "OK");

	// localUserEmail = data.email;
	// localUserData = data.data;
	// localUserBio = data.bio;
	// localUserName = data.username;
	// // localStorage.setItem("localUserEmail", localUserEmail)
	// localStorage.setItem("localUserData", localUserData)
	// localStorage.setItem("localUserBio", localUserBio)
	// localStorage.setItem("localUserName", localUserName)
	$("OptionsUserEmail").innerHTML = localUserEmail;
	$("OptionsUserName").innerHTML = localUserName;
	// console.log(localUserName);
	if (localUserData) renderImage($("OptionsUserIcon"), localUserData, 96, 96);
	$("OptionsLoggedIn").hidden = true;
	$("OptionsUser").hidden = false;
	$("OptionsLoginButton").hidden = true;
	$("OptionsRegisterButton").hidden = true;
	$("OptionsLogoutButton").hidden = false;
	if (localUserVerified == "1") {
		$("OptionsVerifyButton").hidden = true;
	} else {
		$("OptionsVerifyButton").hidden = false;
	}
} else {
	$("OptionsUser").hidden = true;
	$("OptionsLoggedIn").hidden = false;
	$("OptionsLoginButton").hidden = false;
	$("OptionsRegisterButton").hidden = false;
	$("OptionsLogoutButton").hidden = true;
	$("OptionsVerifyButton").hidden = true;


}
// }
let colour = localStorage.getItem("colour") ?? "primary-green";
$("OptionsPrimaryColour").value = colour;

let isDark = localStorage.getItem("isDark") ?? "false";
if (isDark == "false") isDark = "false";
else isDark = "true";

if (isDark == "true") {
	$("OptionsDarkMode").innerHTML = "<div>On</div><i class='bi bi-check-square'></i>";
	document.body.parentNode.className = "dark " + colour;
} else document.body.parentNode.className = "" + colour;

function Alert(text, func, funcName) {
	$("Alert").hidden = false;
	$("AlertText").innerHTML = text;
	if (func) {
		$("AlertClose").hidden = true;
		$("AlertFunc").hidden = false;
		$("AlertFunc").innerHTML = funcName;
		$("AlertFunc").removeEventListener('click', function () {
			func();
			$("Alert").hidden = true;
		})
		$("AlertFunc").addEventListener('click', function () {
			func();
			$("Alert").hidden = true;
		});
	} else {
		$("AlertFunc").hidden = true;
		$("AlertClose").hidden = false;
	}
}

function test() {
	console.log('test');
}

let tabs = [{
		name: "Explore",
		func: ExplorePage,
		history: [],
		onMostRecentPage: false
	},
	{
		name: "Groups",
		func: MyGroupsPage,
		history: [],
		onMostRecentPage: false
	},
	{
		name: "Draw",
		func: test,
		history: [],
		onMostRecentPage: false
	},
	{
		name: "Friends",
		func: test,
		history: [],
		onMostRecentPage: false
	}
]
let currentTab = 0;

// if (localStorage.getItem("tabs")) tabs = JSON.parse(localStorage.getItem("tabs"));

function TabbarPage(index, me) {
	currentTab = index;
	$("PageIntro").innerHTML = tabs[index].name;
	// pages[index].func(); // should call the function

	// if (tabs[currentTab].history == []) $("BackButton").hidden = true
	// else $("BackButton").hidden = false;

	if (tabs[index].history.length > 0) {
		tabs[index].history[tabs[index].history.length - 1].func(tabs[index].history[tabs[index].history.length - 1].obj); // call the most recent thing in the history
	} else {
		tabs[index].func();
	}
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
	// if (tabs[currentTab].history.length == 0) $("BackButton").hidden = true
	// else $("BackButton").hidden = false;
	$("ExplorePage").hidden = true;
	$("SinglePostPage").hidden = true;
	$("SingleGroupPage").hidden = true;
	$("SingleUserPage").hidden = true;
	$("LoginPage").hidden = true;
	$("RegisterPage").hidden = true;
	$("VerifyPage").hidden = true;
	$("OptionsPage").hidden = true;
	$("OptionsButton").childNodes[0].className = "bi bi-gear";
	$("MyGroups").hidden = true;

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

function LoginPage() {
	$("NavbarTitle").innerHTML = "Login";
	CloseAllPages()
	$("OptionsButton").childNodes[0].className = "bi bi-gear-fill active";
	$("LoginPage").hidden = false;
}

function RegisterPage() {

	$("NavbarTitle").innerHTML = "Register";
	CloseAllPages()
	$("OptionsButton").childNodes[0].className = "bi bi-gear-fill active";
	$("RegisterPage").hidden = false;
}
function VerifyPage () {
	$("NavbarTitle").innerHTML = "Verify";
	CloseAllPages()
	$("OptionsButton").childNodes[0].className = "bi bi-gear-fill active";
	$("VerifyPage").hidden = false;
}
function OptionsPage() {
	$("TabbarIcons").children[0].children[0].className = "bi bi-grid-1x2";
	$("TabbarIcons").children[0].className = "";
	$("TabbarIcons").children[1].children[0].className = "bi bi-house";
	$("TabbarIcons").children[1].className = "";
	$("TabbarIcons").children[2].children[0].className = "bi bi-pencil";
	$("TabbarIcons").children[2].className = "";
	$("TabbarIcons").children[3].children[0].className = "bi bi-people";
	$("TabbarIcons").children[3].className = "";
	if ($("OptionsPage").hidden == true) {
		// for(let i=0; i < $("TabbarIcons").childNodes.length; i++) {
		// 	$("TabbarIcons").childNodes[i].childNodes[0]
		// }
		$("NavbarTitle").innerHTML = "Options";
		CloseAllPages();
		$("OptionsButton").childNodes[0].className = "bi bi-gear-fill active";
		$("OptionsPage").hidden = false;
		if ($("BackButton").hidden == false) {
			$("BackButton").hidden = true;
		}
	} else {
		$("OptionsPage").hidden = true;
		TabbarPage(currentTab, $("TabbarIcons").children[currentTab]);
	}
}

function ToggleDarkMode() {
	// isDark = !isDark;
	if (isDark == "false") {
		$("OptionsDarkMode").innerHTML = "<div>On</div><i class='bi bi-check-square'></i>";
		isDark = "true";
	} else {
		$("OptionsDarkMode").innerHTML = "<div>Off</div><i class='bi bi-square'></i>";
		isDark = "false";
	}
	localStorage.setItem("isDark", isDark);

}

function UpdateTheme() {
	colour = $("OptionsPrimaryColour").value;
	if (isDark == "true") document.body.parentNode.className = "dark " + colour;
	else document.body.parentNode.className = "" + colour;
	localStorage.setItem("colour", colour);
}

function Login() {
	if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("LoginEmail").value)) { // the defacto email regexp
		if ($("LoginPassword").value != "" && $("LoginPassword").value !== undefined) {
			fetch(hostURL + "/api/user/login/", {
				method: "POST",
				body: JSON.stringify({
					"email": $("LoginEmail").value,
					"password": $("LoginPassword").value
				})
			}).then((response) => response.json()).then((data) => {
				// if (response.status == 409) {
				// 	Alert("You are already logged in!", OptionsPage, "OK");
				// 	loggedIn = true;
				// 	localUserEmail = $("LoginEmail").value;
				// 	$("OptionsUser").innerHTML = "Logged in as " + localUserEmail;
				// }
				// if (response.status == 400) {
				// 	Alert("Email or password was missing somehow.");
				// }
				if (data.message == "ALREADY_LOGGED_IN" || data.message == "LOGIN_CORRECT") {

					if (data.message == "ALREADY_LOGGED_IN") Alert("You are already logged in.", OptionsPage, "OK");
					else Alert("Logged in as " + data.email + ".", OptionsPage, "OK");
					localUserEmail = data.email;
					localUserData = data.data;
					localUserBio = data.bio ?? "";
					localUserName = data.username;
					localUserVerified = data.verified.toString();
					localStorage.setItem("localUserEmail", localUserEmail)
					localStorage.setItem("localUserData", localUserData)
					localStorage.setItem("localUserBio", localUserBio)
					localStorage.setItem("localUserName", localUserName)
					localStorage.setItem("localUserVerified", localUserVerified);
					if (localUserVerified == "1") {
						$("OptionsVerifyButton").hidden = true;
					}else {
						$("OptionsVerifyButton").hidden = false;
					}
					$("OptionsUserEmail").innerHTML = localUserEmail;
					$("OptionsUserName").innerHTML = localUserName;
					renderImage($("OptionsUserIcon"), localUserData, 96, 96);
					$("OptionsLoggedIn").hidden = true;
					$("OptionsUser").hidden = false;
					$("OptionsLoginButton").hidden = true;
					$("OptionsRegisterButton").hidden = true;
					$("OptionsLogoutButton").hidden = false;
					
				};
			}).catch (function () {
				Alert("Login failed. Connect to the internet or try again later.");
			});
		} else {
			Alert("No password was given.")
		}
	} else if ($("LoginEmail").value == "" || $("LoginEmail").value === undefined) {
		Alert("No email was given.");
	} else {
		Alert("Email was incorrect.");
	}
}

function Register() {
	if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("RegisterEmail").value)) { // the defacto email regexp
		if ($("RegisterUsername").value !== undefined && $("RegisterUsername").value != "") {
			if (/^[a-zA-z0-9-+_.()\[\]\!\@\#\$\%\^\&\*]{1,40}$/.test($("RegisterUsername").value)) {
				if ($("RegisterPassword").value != "" && $("RegisterPassword").value !== undefined) {
					if ($("RegisterRetype").value != "" && $("RegisterPassword").value !== undefined) {
						if ($("RegisterRetype").value == $("RegisterPassword").value) {
							fetch(hostURL + "/api/user/register/", {
								method: "POST",
								body: JSON.stringify({
									"email": $("RegisterEmail").value,
									"displayName": $("RegisterUsername").value,
									"password": $("RegisterPassword").value,
									"passwordRetype": $("RegisterRetype").value

								})
							}).then(response => response.json()).then(data => {
								if (data.message == "REGISTER_MISSING_EMAIL") Alert("No email was given.");
								if (data.message == "REGISTER_MISSING_DISPLAYNAME") Alert("No username was given.")
								if (data.message == "REGISTER_MISSING_PASSWORD") Alert("No password was given.");
								if (data.message == "REGISTER_MISSING_PASSWORD_RETYPE") Alert("Password needs to be retyped.");
								if (data.message == "REGISTER_EMAIL_INVALID") Alert("Email was invalid.");
								if (data.message == "REGISTER_DISPLAYNAME_INVALID") Alert("Username is invalid.");
								if (data.message == "REGISTER_PASSWORD_NOT_EQUAL") Alert("Retyped password does not match the original.");
								if (data.message == "REGISTER_ACCOUNT_EXISTS") Alert("An account already exists with that email.");
								// if (data.message == "REGISTER_MISSING_EMAIL") Alert("");
								if (data.message == "ALREADY_LOGGED_IN") {
									Alert("Registered " + data.email + ".", OptionsPage, "OK");
									localUserEmail = data.email;
									localUserData = data.data;
									localUserBio = data.bio ?? "";
									localUserName = data.username;
									localUserName = data.verified;
									localStorage.setItem("localUserEmail", localUserEmail)
									localStorage.setItem("localUserData", localUserData)
									localStorage.setItem("localUserBio", localUserBio)
									localStorage.setItem("localUserName", localUserName)
									localStorage.setItem("localUserVerified", localUserVerified)
									$("OptionsUserEmail").innerHTML = localUserEmail;
									$("OptionsUserName").innerHTML = localUserName;
									if (data.data) renderImage($("OptionsUserIcon"), localUserData, 96, 96);
									$("OptionsLoggedIn").hidden = true;
									$("OptionsUser").hidden = false;
									$("OptionsLoginButton").hidden = true;
									$("OptionsRegisterButton").hidden = true;
									$("OptionsLogoutButton").hidden = false;
								};
								if (data.message == "REGISTER_SUCCESS") {
									Alert("Registered " + localUserEmail + ".", OptionsPage, "OK");
									localUserEmail = $("RegisterEmail").value;
									localUserName = $("RegisterUsername").value;
									localUserData = "";
									localUserBio = "";
									localStorage.setItem("localUserEmail", localUserEmail)
									localStorage.setItem("localUserName", localUserName)
									localStorage.setItem("localUserData", localUserData)
									localStorage.setItem("localUserBio", localUserBio)
									localStorage.setItem("localUserVerified", localUserVerified)
									
									$("OptionsUserEmail").innerHTML = localUserEmail;
									$("OptionsUserName").innerHTML = localUserName;
									// renderImage($("OptionsUserIcon"), localUserData, 96,96);
									$("OptionsLoggedIn").hidden = true;
									$("OptionsUser").hidden = false;
									$("OptionsLoginButton").hidden = true;
									$("OptionsRegisterButton").hidden = true;
									$("OptionsLogoutButton").hidden = false;
									$("OptionsVerifyButton").hidden = true;
								};
							}).catch (function () {
								Alert("Registration failed. Connect to the internet or try again later.");
							})
						} else {
							Alert("Retyped password does not match the original.")
						}
					} else {
						Alert("Password must be retyped.");
					}
				} else {
					Alert("No password was given.");
				}
			} else {
				Alert("Username is invalid.");
			}
		} else {
			Alert("No username was given.")
		}
	} else if ($("RegisterEmail").value == "" || $("RegisterEmail").value === undefined) {
		Alert("No email was given.");
	} else {
		Alert("Email was invalid.");
	}
}

function Logout() {
	fetch(hostURL + "/api/user/logout/", {
		method: "POST"
	}).then((response) => {
		if (response.status == 200) {
			localUserEmail = "";
			localUserName = "";
			localUserData = "";
			localUserBio = "";
			localUserVerified = "";
			localStorage.removeItem("localUserEmail");
			localStorage.removeItem("localUserName");
			localStorage.removeItem("localUserBio");
			localStorage.removeItem("localUserData");
			localStorage.removeItem("localUserVerified");
			Alert("You are now logged out.");
			$("OptionsUser").hidden = true;
			$("OptionsLoggedIn").innerHTML = "Not logged in."
			$("OptionsLoggedIn").hidden = false;
			$("OptionsLoginButton").hidden = false;
			$("OptionsRegisterButton").hidden = false;
			$("OptionsVerifyButton").hidden = true;
			$("OptionsLogoutButton").hidden = true;
		}
	}).catch (function () {
		Alert("Logout failed. Connect to the internet or try again later.");
	});
}

function VerifyUser () {
	if (/^[a-f0-9]{6}$/.test($("VerifyCode").value)) {
		fetch (hostURL + "/api/user/verify/", {
			method: "POST",
			body :JSON.stringify({"verificationCode":$("VerifyCode").value})
		}).then (response=> response.json()).then ( data=> {
			if (data.message == "VERIFY_INVALID_CODE") Alert("Verification code is invalid.");
			if (data.message == "VERIFY_NO_CODE") Alert("Verificaton code is missing.");
			if (data.message == "VERIFY_NO_LOGIN") Alert("You aren't currently logged in.");
			if (data.message == "VERIFY_CONFLICT") Alert("Your account is already verified.");
			if (data.message == "VERIFY_INCORRECT_CODE") Alert("Your verification code was incorrect.");
			if (data.message == "VERIFY_SUCCESS") {
				Alert("Your account has been verified, you are now free to post.", OptionsPage, "OK");
				localUserVerified = "1";
				localStorage.setItem("localUserVerified", localUserVerified);
				$("OptionsVerifyButton").hidden = true;
			}
		}).catch (function () {
			Alert("Verification failed. Connect to the internet or try again later.");
		})
	} else if ($("VerifyCode").value != "" || $("VerifyCode").value !== undefined){
		Alert("Verification code is invalid.");
	} else {
		Alert ("Verification code is invalid.");
	}
}

let explorePosts = [];

function ExplorePage() { // at the moment this is just selects a bit of data from all posts, but in the future this will filter based on the users preferences
	$("NavbarTitle").innerHTML = "Explore";
	for (let i = 0; i < explorePosts.length; i++) {
		explorePosts[i].remove() // remove existing html
	}
	CloseAllPages()
	$("ExplorePage").hidden = false;
	$("ExplorePageLoading").hidden = false;
	fetch(hostURL + "/api/post/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		$("ExplorePageLoading").hidden = true;
		for (let i = 0; i < data.length; i++) {
			let newPost = new Post(false, new User(data[i]["UserID"], data[i]["UserDisplayName"], data[i]["UserDisplayIcon"], data[i]["UserBio"], data[i]["UserCreateTime"]), data[i]["PostID"], data[i]["PostDrawing"], data[i]["PostIsSpoiler"], data[i]["PostIsNSFW"], data[i]["PostCreateTime"], data[i]["ReplyCount"]);
			newPost.render($("ExplorePage"));
			explorePosts.push(newPost);
		}
	}).catch(function () {
		$("ExplorePageLoading").hidden = true;
		Alert("Explore page could not be loaded.");
	});

}
let myGroups = [];

function MyGroupsPage() { // ge thte user's groups as well as the ones that they are a part of
	$("NavbarTitle").innerHTML = "My Groups"
	for (let i = 0; i < myGroups.length; i++) {
		myGroups[i].remove();
	}
	CloseAllPages();
	$("MyGroups").hidden = false;
	$("MyGroupsLoading").hidden = false;

	fetch(hostURL + "/api/me/groups/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		if (data["message"] !== undefined && data["message"] == "NOT_SIGNED_IN") {
			Alert("You must be logged in to view your groups.", OptionsPage, "Log In")
		}
		// console.log(data);
		$("MyGroupsLoading").hidden = true;
		// if (data["message"] == "USER_NOT_FOUND") {
		// $("Alert").show();
		// }
		for (let i = 0; i < data.groups.length; i++) {
			// let newFriend = new User (data.friends[i].UserID, data.friends[i].UserDisplayName, data.friends[i].UserData, data.friends[i].UserBio, data.friends[i].UserCreateTime);
			let newGroup = new Group(new User(data.groups[i]["UserID"], data.groups[i]["UserDisplayName"], data.groups[i]["UserDisplayIcon"], data.groups[i]["UserBio"], data.groups[i]["UserCreateTime"]), data.groups[i]["GroupID"], data.groups[i]["GroupDisplayName"], data.groups[i]["GroupDisplayIcon"], data.groups[i]["GroupDescription"], data.groups[i]["GroupDate"]); // the little group icon with the groupname

			myGroups.push(newGroup);
			newGroup.render($("MyGroups"));
		}
	}).catch(function () {
		Alert("Your groups could not be loaded.");
		$("MyGroupsLoading").hidden = true;
	});
}

let currentSinglePostReplies = [];

function OpenPost(post, addToHistory) {
	$("NavbarTitle").innerHTML = "Post";
	$("BackButton").hidden = false;
	if (post.isReply) {
		return null
	}
	if (addToHistory) {
		tabs[currentTab].history.push({
			func: OpenPost,
			obj: post
		});
		tabs[currentTab].onMostRecentPage = true;
	}

	for (let i = 0; i < currentSinglePostReplies.length; i++) {
		currentSinglePostReplies[i].remove();
	}
	currentSinglePostReplies = [];
	CloseAllPages();
	$("SinglePostCommentsLoading").hidden = false;
	$("SinglePostDate").innerHTML = new Date(post.date * 1000).toLocaleDateString("en-GB"); // convert the unix time int of the post into a date time - timezones arent accounted for yet
	$("SinglePostUserHolder").innerHTML = "";
	post.user.render($("SinglePostUserHolder"));
	$("SinglePostGroupHolder").innerHTML = ""; // remove the html from the previous group wasnt cleared, finish the job
	$("SinglePostCanvas").getContext("2d").putImageData(post.imageData, 0, 0);
	$("SinglePostPage").hidden = false;
	$("SinglePostCommentsHeader").innerHTML = post.commentCount + " Replies";
	if (post.commentCount == 1) $("SinglePostCommentsHeader").innerHTML = "1 Reply"; // grammar
	fetch(hostURL + "/api/post/" + post.ID + "/", { // in the future, instead of sending an object with all of the posts that includes their data, send an array like ['0123', '4567', 'etc'] that the server can fetch for each post individually - or in sections - instead of all at once
		method: "GET"
	}).then(response => response.json()).then((data) => { // the usual fetch json
		$("SinglePostCommentsLoading").hidden = true;
		let group = new Group(new User(data.group[0]["UserID"], data.group[0]["UserDisplayName"], data.group[0]["UserDisplayIcon"], data.group[0]["UserBio"], data.group[0]["UserCreateTime"]), data.group[0]["GroupID"], data.group[0]["GroupDisplayName"], data.group[0]["GroupDisplayIcon"], data.group[0]["GroupDescription"], data.group[0]["GroupDate"]); // the little group icon with the groupname
		group.render($("SinglePostGroupHolder"));
		for (let i = 0; i < data.replies.length; i++) {
			let newReply = new Post(true, new User(data.replies[i]["UserID"], data.replies[i]["UserDisplayName"], data.replies[i]["UserDisplayIcon"], data.replies[i]["UserBio"], data.replies[i]["UserCreateTime"]), data.replies[i]["PostID"], data.replies[i]["PostDrawing"], data.replies[i]["PostIsSpoiler"], data.replies[i]["PostIsNSFW"]); // the replies to the post
			newReply.render($("SinglePostComments"));
			currentSinglePostReplies.push(newReply); // there isnt a 100% reason that these posts are inside an array, considering this array isn't accessed... might need to rethink
		}
	}).catch(function () {
		Alert("Post replies could not be loaded.");
		$("SinglePostCommentsLoading").hidden = true;
		//couldn't connect to server
	});

	// let group = new Group($("SinglePostGroupHolder"), post.group.ID, post.group.name, post.group.data, post.group.description, post.group.date, post.group.user
}

let currentSingleGroupPosts = [];
let currentSingleGroupUsers = [];

function OpenGroup(group, addToHistory) {
	$("NavbarTitle").innerHTML = group.name;
	$("BackButton").hidden = false;
	if (addToHistory) {
		tabs[currentTab].history.push({
			func: OpenGroup,
			obj: group
		});
		tabs[currentTab].onMostRecentPage = true;
	}

	for (let i = 0; i < currentSingleGroupPosts.length; i++) {
		currentSingleGroupPosts[i].remove();
	};
	for (let i = 0; i < currentSingleGroupUsers.length; i++) {
		currentSingleGroupUsers[i].remove();
	}
	currentSingleGroupPosts = [];
	CloseAllPages();

	$("SingleGroupPostsLoading").hidden = false;
	$("SingleGroupName").innerHTML = group.name;
	$("SingleGroupOwnerHolder").innerHTML = "";
	$("SingleGroupPage").hidden = false;

	group.user.render($("SingleGroupOwnerHolder"));
	if (group.data != null) renderImage($("SingleGroupCanvas"), group.data, 96, 96);

	fetch(hostURL + "/api/group/" + group.ID + "/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		$("SingleGroupPostsLoading").hidden = true;
		for (let i = 0; i < data.groupPosts.length; i++) {
			let newPost = new Post(false, new User(data.groupPosts[i]["UserID"], data.groupPosts[i]["UserDisplayName"], data.groupPosts[i]["UserDisplayIcon"], data.groupPosts[i]["UserBio"], data.groupPosts[i]["UserCreateTime"]), data.groupPosts[i]["PostID"], data.groupPosts[i]["PostDrawing"], data.groupPosts[i]["PostIsSpoiler"], data.groupPosts[i]["PostIsNSFW"], data.groupPosts[i]["PostCreateTime"], data.groupPosts[i]["ReplyCount"]);
			currentSingleGroupPosts.push(newPost);
			newPost.render($("SingleGroupPosts"));
		}
		if (currentSingleGroupPosts.length == 1) "1 Post";
		else $("SingleGroupPostCount").innerHTML = currentSingleGroupPosts.length + " Posts";

		for (let i = 0; i < data.groupUsers.length; i++) {
			let newUser = new User(data.groupUsers[i]["UserID"], data.groupUsers[i]["UserDisplayName"], data.groupUsers[i]["UserDisplayIcon"], data.groupUsers[i]["UserBio"], data.groupUsers[i]["UserCreateTime"])
			currentSingleGroupUsers.push(newUser);
			newUser.render($("SingleGroupUserHolder"));
		}
	}).catch(function () {
		Alert("Group posts could not be loaded.")
		$("SingleGroupPostsLoading").hidden = true;
	})
}


let currentSingleUserPosts = [];
let currentSingleUserFriends = [];
let currentSingleUserGroups = [];

function OpenUser(user, addToHistory) {
	$("NavbarTitle").innerHTML = user.username;

	$("BackButton").hidden = false;
	if (addToHistory) {
		tabs[currentTab].history.push({
			func: OpenUser,
			obj: user
		});
		tabs[currentTab].onMostRecentPage = true;
	}

	for (let i = 0; i < currentSingleUserPosts.length; i++) {
		currentSingleUserPosts[i].remove();
	};
	for (let i = 0; i < currentSingleUserFriends.length; i++) {
		currentSingleUserFriends[i].remove();
	}
	for (let i = 0; i < currentSingleUserGroups.length; i++) {
		currentSingleUserGroups[i].remove();
	}
	currentSingleUserPosts = []
	currentSingleUserFriends = []
	currentSingleUserGroups = []
	CloseAllPages();
	$("SingleUserPostsLoading").hidden = false;
	$("SingleUserName").innerHTML = user.username;
	$("SingleUserBio").innerHTML = user.bio;
	$("SingleUserGroupHolder").innerHTML = "";
	$("SingleUserFriendHolder").innerHTML = "";
	$("SingleUserPage").hidden = false;

	if (user.data != null) renderImage($("SingleUserCanvas"), user.data, 96, 96);

	fetch(hostURL + "/api/user/" + user.userID + "/", {
		method: "GET"
	}).then((response) => response.json()).then((data) => {
		$("SingleUserPostsLoading").hidden = true;
		// for (let i = 0; i < data.groupPosts.length; i++) {
		// 	let newPost = new Post(false, new User(data.groupPosts[i]["UserID"], data.groupPosts[i]["UserDisplayName"], data.groupPosts[i]["UserDisplayIcon"], data.groupPosts[i]["UserBio"], data.groupPosts[i]["UserCreateTime"]), data.groupPosts[i]["PostID"], data.groupPosts[i]["PostDrawing"], data.groupPosts[i]["PostIsSpoiler"], data.groupPosts[i]["PostIsNSFW"], data.groupPosts[i]["PostCreateTime"], data.groupPosts[i]["ReplyCount"]);
		// 	currentSingleGroupPosts.push(newPost);
		// 	newPost.render($("SingleGroupPosts"));
		// }
		for (let i = 0; i < data.friends.length; i++) {
			let newFriend = new User(data.friends[i].UserID, data.friends[i].UserDisplayName, data.friends[i].UserData, data.friends[i].UserBio, data.friends[i].UserCreateTime);
			currentSingleUserFriends.push(newFriend);
			newFriend.render($("SingleUserFriendHolder"));
		}
		if (data.friends.length > 0) {
			$("SingleUserFriendLabel").hidden = false;
			$("SingleUserFriendHolder").hidden = false;
		} else {
			$("SingleUserFriendLabel").hidden = true;
			$("SingleUserFriendHolder").hidden = true;
		}

		for (let i = 0; i < data.groups.length; i++) {
			// let newFriend = new User (data.friends[i].UserID, data.friends[i].UserDisplayName, data.friends[i].UserData, data.friends[i].UserBio, data.friends[i].UserCreateTime);
			let newGroup = new Group(new User(data.groups[i]["UserID"], data.groups[i]["UserDisplayName"], data.groups[i]["UserDisplayIcon"], data.groups[i]["UserBio"], data.groups[i]["UserCreateTime"]), data.groups[i]["GroupID"], data.groups[i]["GroupDisplayName"], data.groups[i]["GroupDisplayIcon"], data.groups[i]["GroupDescription"], data.groups[i]["GroupDate"]); // the little group icon with the groupname

			currentSingleUserGroups.push(newGroup);
			newGroup.render($("SingleUserGroupHolder"));
		}
		if (data.groups.length > 0) {
			$("SingleUserGroupLabel").hidden = false;
			$("SingleUserGroupHolder").hidden = false;
		} else {
			$("SingleUserGroupLabel").hidden = true;
			$("SingleUserGroupHolder").hidden = true;
		}
		for (let i = 0; i < data.posts.length; i++) {
			let newPost = new Post(false, new User(data.posts[i]["UserID"], data.posts[i]["UserDisplayName"], data.posts[i]["UserDisplayIcon"], data.posts[i]["UserBio"], data.posts[i]["UserCreateTime"]), data.posts[i]["PostID"], data.posts[i]["PostDrawing"], data.posts[i]["PostIsSpoiler"], data.posts[i]["PostIsNSFW"], data.posts[i]["PostCreateTime"], data.posts[i]["ReplyCount"]);
			currentSingleUserPosts.push(newPost);
			newPost.render($("SingleUserPosts"));
		}
		if (currentSingleUserPosts.length == 1) $("SingleUserPostCount").innerHTML = "1 Post";
		else $("SingleUserPostCount").innerHTML = currentSingleUserPosts.length + " Posts";
	});
}



function GoBack(index = currentTab) {
	if (tabs[index].onMostRecentPage) { // && tabs[index].history.length > 1) { // if we are at the end of the page history, and it is possible to, we pop twice. Because the most recent page in the history is already opened, we would essentially be opening the current page again
		tabs[index].history.pop()
	}
	let lastPage = null;
	if (tabs[index].history[0] !== undefined) {
		lastPage = tabs[index].history.pop()
		$("BackButton").hidden = false;
	} else {
		lastPage = tabs[index];
		$("BackButton").hidden = true;
	}
	lastPage.func(lastPage.obj, false) // the false means that the action won't be added to the history, otherwise there would be an infinite loop of removing the page and then adding it back again. The last true means it wont set endOfPageHistory to true
	tabs[index].onMostRecentPage = false;
	// localStorage.setItem("tabs", JSON.stringify(tabs));
	// if (tabs[currentTab].history.length == 0) $("BackButton").hidden = true
	// else $("BackButton").hidden = false;
	// console.log(tabs[index].history);
}

// add a page history with the type of content adn the ID ? maybe a list of functions?
// [OpenPost('abdabsdsadsad'), Opengroup('absdbasbdbsd')] etc ect
// go back by -1 when using the back arrow
// lets hope that works gotta go to work now
ExplorePage();