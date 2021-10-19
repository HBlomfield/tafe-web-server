// criteria
// part a
// X web service that supports at least four unique get and 4 unique post actions

// GET ACTIONS
// o user (w/ extra details)
// o user's posts
// o post (w/ comments)
// o group posts

// POST ACTIONS
// o user register
// o user login
// o user logout
// o user verify

// O build a correctly formed database
// O integrate the database for 2 crud actions
// O logging feature that accounts for every request with IP, session, username, user type, timestamp and action
// O rate limit to 1 request per second
// O rate limit to 1000 requests per day 
// O domain lock web service to whitelist of referers - only allows origin of localhost

// part b
// O one database object with all sql actions
// O use request, response and session objects instead of superglobals
// O use 3 response codes instead of 200
// O validate get and post data before it is processed
// O response body is in json form

// part c
// denote where and explani why you instantiated the database and session objects in that location
// explain the maths of either of your two rate limiting codes // line 457
// note where you are checking if a session exists, and what do if it does // session class
// write a readme file that explains how to set up and configure web service 
// write a test script to test all of the get and post requests // thunderclient

// Naming convention:
// Module / Package names: lowercase
// Variable names, json keys coming from the user: camelCase (starting with lower)
// Function / Class names, json keys coming from a file: CamelCase (starting with upper)

//#region declaring pretty console text
const terminal = {
	none: "\033[97m",
	note: "\033[90m",
	success: "\033[92m",
	warning: "\033[93m",
	danger: "\033[91m",
	info: "\033[94m",
	indent: "   "
}

function $(value) { // lets just make this function here for the sake of quickness, even though the $ is used for jquery we'll use it here for console logging, I guess it should be set to whatever is used the most
	console.log(value);
}
//#endregion
//#region packages
const http = require("https");
const fs = require("fs");
const crypto = require("crypto");
const mysql = require("mysql");
//#endregion

// const hashKey = crypto.generateKey("hmac",{length:64}); // generate a cryto key (because this is generated every time, I can this only being a temporary solution)
const hashKey = "lorem ipsum";
// const acceptedHost = "localhost:3000";
const serverHost = "";

// const sslOptions = {
// 	key: fs.readFileSync("site/config/ssl/localhost.decrypted.key"),
// 	cert: fs.readFileSync("site/config/ssl/localhost.crt")
// };
const sslOptions = {
	key: fs.readFileSync('site/config/ssl/key.pem', 'utf-8').toString(),
	cert: fs.readFileSync('site/config/ssl/server.crt', 'utf-8').toString(),
	// ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
	// honorCipherOrder: true,
	// secureProtocol: 'TLSv1_2_method'
};

// although the thunder client and such works, there are issues when using curl. Probably wont be a great idea to use openSSL when hosting, cloudflare or something would be used instead
const server = http.createServer(sslOptions, (request, response) => IndexProcess(request, response));

const accessPath = "site/IP/access/";
const blockedPath = "site/IP/blocked/";
const sessionPath = "site/sessions/";

const contentTypes = {
	"html": "text/html",
	"css": "text/css",
	"js": "application/javascript",
	"svg": "image/svg+xml",
	"png": "image/png",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"gif": "image/gif"
}

// we put this at the top cuz thats where it belongs
class Session { // class to manage the user's cookies and sessions
	constructor(requestObject, responseObject) {
		// this.cookie = cookie;
		// if (this.cookie == null) {
		// 	this.cookie = crypto.randomBytes(20).toString ('hex'); // session cookie will be a random hex string
		// }
		this.res = responseObject;
		this.req = requestObject;
		this.cookie = null;
		this.values = {};
	}
	Start() { // this function will return false if the session does not exist
		$(terminal.info + "Trying to start session...")
		this.cookie = this.req.headers["cookie"]; // get the cookie from the session
		// $(this.req.headers["cookie);
		if (this.cookie === undefined || this.cookie === null) {
			$(terminal.danger + "No cookies were sent")
			return false; // cookie hasnt been sent, probably doesnt exist
		}
		if (/session=[a-f0-9]{40}/.test(this.cookie)) { // if the cookie exists and is formatted properly
			this.cookie = this.cookie.match(/session=[a-f0-9]{40}/)[0].slice(8); // ditch the 'session=' part and just get the cookie token
			$(terminal.success + "Cookie was found (" + this.cookie + ")");
		} else {
			$(terminal.danger + "Cookies were sent, but session=[a-f0-9]{40} couldn't be found");
			return false; // cookies have been sent, but session is not there (or at least isnt correct)
		}
		if (fs.existsSync(sessionPath + this.cookie)) {
			$(terminal.success + "Session values have been retrieved");
			this.values = JSON.parse(fs.readFileSync(sessionPath + this.cookie)); // get the values from the existing session
			return true;
		}
		$(terminal.danger + "No file was found for the session");
		return false; // the session has been set, yet doesn't exist
	}
	Create() {
		$(terminal.info + "Creating Session...")
		this.cookie = crypto.randomBytes(20).toString('hex') // make a new cookie of 40 characters in length (caused a bit of frustration because it was assumed 1 byte = 1 char)
		// having 40 characters is almost certainly over-blown, especially because the user ids only have 10 characters, but even 1 mismatched cookie could ruin someone's day. I'll probably add some more characters to the user ids
		this.res.setHeader("Set-Cookie", `session=${this.cookie};path=/;httpOnly;max-age=31557600;sameSite=strict;`); // max age is equal to 365 days, although it is optional, it doesn't seem to be sent if it has no max age (browser assumes max-age=0 ?)
		// fs.writeFileSync(sessionPath + this.cookie, JSON.stringify(newData)); // store the session variables on the session file, alternatively the session could be created with nothing in it, values would be given to it and then updated to the file. That might be better
	}
	Update() {
		$(terminal.info + "Session updated");
		fs.writeFileSync(sessionPath + this.cookie, JSON.stringify(this.values)); // because the values of the session have to be added to the file, we update the session values after every time we access the session. This would probably be the last thing done before the session is closed (closed as in closed, not deleted)
	}
	Destroy() {
		this.res.setHeader("Set-Cookie", "session=;path=/;httpOnly;max-age=0;sameSite=strict;"); // this removes the cookie from the user's browser
		try { // delete the path containing the user's session
			fs.rmSync(sessionPath + this.cookie);
			$(terminal.success + "Session file was removed");
		} catch {
			$(terminal.info + "No session file existed, so nothing was destroyed")
			return false; // if the session doesn't exist
		}
	}
}

const configSQL = {
	"connectionLimit": 10, // maximum of 10 connections at a time
	"host": "localhost",
	"user": "root",
	"password": "",
	"database": "draw"
};
let databasePool = mysql.createPool(configSQL); // a pool allows each request to be accessing the database seperately

class CRUD { // class to access the database
	async GetUser(withEmail, readValue) { // this was to just get the user's id, email, and password, but now it gets everything to save the headache
		// withEmail being true means it searches the database for the users email, withEmail being false means it searches for the user ID
		let value = undefined; // if nothing is found the function will return [], if there is an sql error, undefined
		let promise = new Promise((resolve) => {
			databasePool.getConnection(function (err, connection) { // connect to the database pool, max of 10 at a time but because they close almost instantly after they are opened, I imagine it would require an incredibly slow cpu or busy server to max out
				if (err) throw err; // if there is an error, stop execution. this will be a big issue for anyone trying to use the site and accidentally causing an error, but it helps the error get fixed				
				let query = "SELECT ID, Email, DisplayName, hex(DisplayIcon) as DisplayIcon, DisplayBio, Password, JoinedOn, IsVerified, VerificationCode, LastUsedIP, IsPrivate, IsDisabled FROM users WHERE users.ID = '" + readValue + "' AND IsDisabled != 1;" // query used if withEmail is false
				if (withEmail) {
					query = "SELECT ID, Email, DisplayName, hex(DisplayIcon) as DisplayIcon, DisplayBio, Password, JoinedOn, IsVerified, VerificationCode, LastUsedIP, IsPrivate, IsDisabled FROM users WHERE users.Email = '" + readValue + "' AND IsDisabled != 1;";
				}
				connection.query(query, function (err, result) { // do the query
					$(terminal.indent + terminal.note + query);
					if (err) throw err;
					// console.log(result);
					value = result; // set to the 1st value
					connection.release() // stops the connection to the pool as soon as the query is done
					resolve();
				});
			});
		});
		await promise;
		return value;
	}
	async GetPublicUserInfo(ID) { // get all public information about the user; their posts, their friends, their groups  
		let userInfo = []; // the info of the specific user
		let userFriends = []; // the info of all of the user's friends
		let userGroups = []
		//let recentPosts = []; // because we don't want to send all of the user's posts at once, we send the most recent, probably the 3 to 5 most recent for the sake of the client
		let userPosts = []; // for now just send it all
		await new Promise((resolve) => {
			databasePool.getConnection(async function (err, connection) {
				let query = ""
				if (err) throw err;
				await new Promise((resolve) => { // we reuse the same name but with different promises -> sounds like a song lyric
					query = "SELECT DisplayName, hex(DisplayIcon), DisplayBio, JoinedOn FROM users WHERE ID = '" + ID + "' AND IsDisabled != 1 AND IsPrivate != 1 ORDER BY JoinedOn LIMIT 1;"; // get the user's basic info				
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						// $(result);
						if (err) throw err;
						userInfo = result;
						// if (result == [] || result == undefined || result == null) { // if the user doesn't exist
						// 	return -1; // we return -1, cancel the function, because it menas the user's account dpesmt exist, was deactivated or is private
						// }
						resolve();
					})
				});
				await new Promise((resolve) => {
					query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM users INNER JOIN userrelations ON ((userrelations.UserID = users.ID AND userrelations.RelationUserID = '" + ID + "') OR (userrelations.UserID = '" + ID + "' AND userrelations.RelationUserID = users.ID)) AND userrelations.SocialStatus = 1 AND userrelations.IsDisabled != 1 AND users.IsPrivate != 1 AND users.IsDisabled != 1 GROUP BY users.ID;";
					// this here is a massive query and the longest line of the code so I'll break it down on this line instead of that one
					// [select users.accountname, users.accounticon from users] the first part just selects the name and icon from the friends, simple
					// [inner join userrelations] // we check the requested user's friend list 
					// [ON ((userrelations.UserID = users.ID AND userrelations.RelationUserID = '" + ID + "')] if the user has been friended by another user
					// [OR (userrelations.UserID = '" + ID + "' AND userrelations.RelationUserID = users.ID))] if the user has friended another user
					// [AND userrelations.SocialStatus = 1 ] if the users are actually friended; we use this same table to tell if users have blocked eachother too, or for pending friend requests
					// [AND userrelations.IsDisabled = false] if the user relation has been disabled/deleted, I'm tempted to make data in the database actually be deletable, but then what do you do with users that get deleted? what happens to their posts?
					// [AND users.IsPrivate != 1] if the user account is not private, wouldn't want to show someones account if they don't want it being shown
					// [AND users.IsDisabled != 1] if the user account is not disabled, same rambling as before
					// [GROUP BY users.ID] makes sure that there aren't duplicate users being selected
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						userFriends = result;
						// $(userFriends);
						resolve();
					})
				});
				await new Promise((resolve) => {
					query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime,posts.ID as PostID, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW, posts.CreationDate as PostCreateTime, count(replies.ID) as ReplyCount FROM posts INNER JOIN posts as replies ON replies.ReplyToID = posts.ID INNER JOIN users ON users.ID = posts.UserID AND posts.UserID = '" + ID + "' AND posts.IsDisabled != 1 GROUP BY posts.ID ORDER BY posts.CreationDate DESC"; // LIMIT 3;";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						userPosts = result;
						// console.log (result);
						resolve();
					});
				});
				await new Promise((resolve) => {
					query = "SELECT groups.ID as GroupID, groups.DisplayName as GroupDisplayName, hex(groups.DisplayIcon) as GroupDisplayIcon, groups.description as GroupDescription, users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM groups INNER JOIN users ON users.ID = groups.OwnerID INNER JOIN groupmembers ON groups.ID = groupmembers.GroupID AND groupmembers.UserID =  '" + ID + "' WHERE groups.IsPrivate != 1 AND groupmembers.IsDisabled != 1;";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						userGroups = result;
						resolve();
					})
				});
				connection.release();
				resolve();
			});
		});
		return {
			user: userInfo,
			friends: userFriends,
			posts: userPosts,
			groups: userGroups
		};
	}
	async CreateNewUser(ID, email, displayName, password, time) { // create a new user
		// let pKey = crypto.randomBytes(5).toString('hex'); // the primary key of the new user, because the combinations are 10^16, or 10000000000000000, theres a lot chance someone will get someone elses, unless the population bounces to 10 quintillion
		let verifyCode = crypto.randomBytes(3).toString('hex'); // the 3 digit code used to verify the user account, again, lots of combinations
		await new Promise((resolve) => { // the promise that will resolve when the database has been accessed
			databasePool.getConnection(function (err, connection) { // swim in da pool
				if (err) throw err;
				let query = "INSERT INTO users (`ID`,`Email`,`DisplayName`,`Password`, `VerificationCode`, `JoinedOn`) VALUES ('" + ID + "','" + email + "','" + displayName + "','" + password + "','" + verifyCode + "', " + time + ");";
				$(terminal.note + terminal.indent + query);
				connection.query(query, function (err, result) { // splash some wattar
					$(terminal.indent + terminal.note + query);
					if (err) throw err;
					connection.release(); // get out of da pool
					resolve(); // dry yourself off
				});
			});
		});
	}
	async VerifyUser(ID) { // we only need a function to verify the account, no point to un-verify it
		await new Promise((resolve) => {
			databasePool.getConnection(function (err, connection) {
				if (err) throw err;
				connection.query("UPDATE users SET IsVerified = 1 WHERE ID = '" + ID + "';", function (err) {
					if (err) throw err;
					connection.release();
					resolve();
				}); // set the IsVerified value from 0 to 1, boolean
			})
		})
	}
	async GetUserPosts(ID) {
		let posts = {};
		await new Promise((resolve) => {
			databasePool.getConnection(function (err, connection) {
				if (err) throw err;
				let query = "SELECT posts.ID as PostID, posts.Text as PostText, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW FROM posts WHERE posts.UserID = '" + ID + "' AND posts.IsDisabled !=1;";
				connection.query(query, function (err, result) {
					$(terminal.note + terminal.indent + query);
					if (err) throw err;
					posts = result;
					// $(result);
					connection.release();
					resolve();
				});
			})
		});
		return posts;
	}
	async GetUserGroups(ID) { // we get the groups from the user
		let joinedGroups = [];
		let pendingGroups = [];
		await new Promise((resolve) => {
			databasePool.getConnection(async function (err, connection) {
				if (err) throw err;
				await new Promise((resolve) => {
					if (err) throw err;

					let query = "SELECT groups.ID as GroupID, groups.DisplayName as GroupDisplayName, hex(groups.DisplayIcon) as GroupDisplayIcon, groups.description as GroupDescription, users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM groups INNER JOIN users ON users.ID = groups.OwnerID INNER JOIN groupmembers ON groups.ID = groupmembers.GroupID AND groupmembers.UserID =  '" + ID + "' WHERE groupmembers.IsDisabled != 1 AND groupmembers.Status = 1;"
					connection.query(query, function (err, result) {
						$(terminal.note + terminal.indent + query);
						if (err) throw err;
						joinedGroups = result;
						// $(result);
						resolve();
					});
				})
				await new Promise((resolve) => {
					if (err) throw err;
					// we only select the group's name and icon, as they haven't joined the group yet and so have no permission to access it
					let query = "SELECT groups.ID as GroupID, groups.DisplayName as GroupDisplayName, hex(groups.DisplayIcon) as GroupDisplayIcon FROM groups INNER JOIN users ON users.ID = groups.OwnerID INNER JOIN groupmembers ON groups.ID = groupmembers.GroupID AND groupmembers.UserID =  '" + ID + "' WHERE groupmembers.IsDisabled != 1 AND groupmembers.Status = 0;"
					connection.query(query, function (err, result) {
						$(terminal.note + terminal.indent + query);
						if (err) throw err;
						pendingGroups = result;
						// $(result);
						resolve();
					});
				})
				connection.release();
				resolve();
			});
		});
		return {
			groups: joinedGroups,
			invites: pendingGroups
		};
	}
	async GetUserFriends(ID) { // get the friends of the user

	}
	async GetGroup(ID) {
		let groupInfo = {};
		let groupPosts = {};
		let groupUsers = {};
		await new Promise((resolve) => {
			databasePool.getConnection(async function (err, connection) {
				if (err) throw err;
				await new Promise((resolve) => {
					let query = "SELECT groups.ID as GroupID, groups.DisplayName as GroupDisplayName, hex(groups.DisplayIcon) as GroupDisplayIcon, groups.description as GroupDescription, users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM groups INNER JOIN users ON users.ID = groups.OwnerID WHERE groups.ID = '" + ID + "'";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						groupInfo = result;
						// $(result)
						resolve();
					})
				});
				await new Promise((resolve) => {
					let query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime,posts.ID as PostID, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW, posts.CreationDate as PostCreateTime, count(replies.ID) as ReplyCount FROM posts LEFT JOIN posts AS replies ON replies.ReplyToID = posts.ID INNER JOIN users ON users.ID = posts.UserID WHERE posts.IsDisabled != 1 and posts.ReplyToId IS NULL AND posts.GroupID = '" + ID + "' GROUP BY posts.ID;";
					connection.query(query, function (err, result) {
						$(terminal.note + terminal.indent + query);
						if (err) throw err;
						groupPosts = result;
						resolve();
					});
				})
				await new Promise((resolve) => {
					let query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM groupmembers INNER JOIN users on users.ID = groupmembers.UserID AND groupmembers.groupID = '" + ID + "'";
					connection.query(query, function (err, result) {
						$(terminal.note + terminal.indent + query);
						if (err) throw err;
						groupUsers = result;
						resolve();
					});
				})
				connection.release();
				resolve();
			})
		});
		return {
			groupInfo,
			groupPosts,
			groupUsers
		};
	}
	async GetPost(ID) { // get the post, the group's name, drawing and ID and the user's name drawing and ID, as well as the username and posts of all the comments
		let postInfo = {} // post and user info
		let groupInfo = {}
		let postReplies = {};
		await new Promise((resolve) => {
			databasePool.getConnection(async function (err, connection) {
				if (err) throw err;
				await new Promise((resolve) => {
					// so heres a doozy. sending the raw data to json converts it all to numbers and adds ',' and \n's to it, and makes it larger(69.3kb) than if we send as a string converted to hex(39.6kb). both of these methods are still larger than the original file, which is only 19.7kb. We might as well send it as a string of hex
					let query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime,posts.ID as PostID, posts.Text as PostText, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW, posts.CreationDate as PostCreateTime FROM posts INNER JOIN users ON users.ID = posts.UserID WHERE posts.IsDisabled != 1 AND posts.ID = '" + ID + "';";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						postInfo = result;
						// $(result);
						$(typeof (result[0]["PostDrawing"]));
						resolve();
					});
				});
				await new Promise((resolve) => {
					let query = "SELECT groups.ID as GroupID, groups.DisplayName as GroupDisplayName, hex(groups.DisplayIcon) as GroupDisplayIcon, groups.description as GroupDescription, users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime FROM posts INNER JOIN groups ON groups.ID = posts.GroupID INNER JOIN users ON users.ID = groups.OwnerID WHERE posts.ID = '" + ID + "'";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						groupInfo = result;
						// $(result)
						resolve();
					})
				});
				await new Promise((resolve) => {
					let query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime, posts.Text as PostText, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW FROM posts INNER JOIN users ON users.ID = posts.UserID WHERE posts.IsDisabled != 1 AND posts.ReplyToID = '" + ID + "' ORDER BY posts.CreationDate DESC;";
					connection.query(query, function (err, result) {
						$(terminal.indent + terminal.note + query);
						if (err) throw err;
						postReplies = result;
						resolve();
					})
				});
				connection.release();
				resolve();

			})
		});
		return {
			post: postInfo,
			group: groupInfo,
			replies: postReplies,

		}
	}
	async GetExplore() {
		let posts = {};
		let query = "SELECT users.ID as UserID, users.DisplayName as UserDisplayName, hex(users.DisplayIcon) as UserDisplayIcon, users.DisplayBio as UserBio, users.JoinedOn as UserCreateTime,posts.ID as PostID, hex(posts.Drawing) as PostDrawing, posts.IsSpoiler as PostIsSpoiler, posts.IsNSFW as PostIsNSFW, posts.CreationDate as PostCreateTime, count(replies.ID) as ReplyCount FROM posts LEFT JOIN posts AS replies ON replies.ReplyToID = posts.ID INNER JOIN users ON users.ID = posts.UserID WHERE posts.IsDisabled != 1 and posts.ReplyToId IS NULL GROUP BY posts.ID;";
		await new Promise((resolve) => {
			databasePool.getConnection(async function (err, connection) {
				if (err) throw err;
				await new Promise((resolve) => {
					connection.query(query, function (err, result) {
						$(terminal.note + terminal.indent + query);
						if (err) throw err;
						posts = result;
						resolve();
					});
				});
				connection.release();
				resolve();
			});
		});
		// $(posts);
		return posts;
	}

	// GetUser
}
var crud = new CRUD();

async function IndexProcess(req, res) {
	// remove this later
	res.setHeader("Access-Control-Allow-Origin", "*");
	// await crud.GetPublicUserInfo('');
	// await crud.GetUserRelation('a00e8530167659caaaf2','ad43fae0aa1720c60b63');
	function Stop(code, message) {
		res.statusCode = code;
		if (res.statusCode > 199 && res.statusCode < 299) {
			$(terminal.note + terminal.indent + "Code " + terminal.success + code + terminal.note + " was sent");
		} else {
			$(terminal.note + terminal.indent + "Code " + terminal.danger + code + terminal.note + " was sent");
		}
		if (message != undefined) {
			res.write(JSON.stringify({
				"message": message
			}));
		}
		res.end();
		return null;
	}

	function CheckRequestKeys(keys) { // function that will check the keys of the requestJSON, and return true if the keys are the same regardless of order (using an array match command would only match if they have the same order)
		if (requestKeys.length == keys.length) { // check the request has the same amount of keys as what we need
			for (var i = 0; i < keys.length; i++) { // go through each key
				if (requestKeys.includes(keys[i])) { // we don't need to worry about duplications, because that would change the length. The function only checks for the same values
					continue;
				} else {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	//#region print general request info
	$(terminal.note + "------------------------------------------------------------");
	$(terminal.info + "New " + req.method + " request from " + req.headers["host"] + " (" + req.headers["user-agent"] + ")");
	$(terminal.note + terminal.indent + "IP: " + req.connection.remoteAddress);
	$(terminal.note + terminal.indent + "URL: " + req.url);
	$(terminal.note + terminal.indent + "Time: " + new Date(Date.now()).toString());
	//#endregion
	//#region send resources
	// if the user is requesting a site element, it shouldn't be rate limited or blocked, so we check for it here and return something to cancel, to not waste server resources
	if (/^(\/public\/(.+\.)+(.+)|\/)$/.test(req.url)) { // the url is / or starts with /public/ and then has strings for the filename and different filetypes, seperated by . (some filetypes have multiple extensions)
		$(terminal.info + "User is requesting a site element");
		let reqFile = "/"
		if (req.url == "/" || req.url == "/index.html") { // if the user is trying to access the main site, send the index
			reqFile = "public/index.html";
		} else {
			reqFile = req.url.slice(1); // remove the / at the start because the folder name needs to come before the /
		}
		// $(reqFile);
		if (fs.existsSync(reqFile)) { // does the file exist?
			$(terminal.success + "Requested file exists (" + reqFile + ")");
			let fileType = reqFile.match(/(?!(.+)\.)([a-z0-9]+)/)[0]; // get the final .* out of possibly multiple *.'s
			if (contentTypes[fileType] != undefined) { // if we have added that content type
				res.setHeader("Content-Type", contentTypes[fileType]); // make sure that the content type is set
				$(terminal.success + "Sending as " + contentTypes[fileType]);
			}
			res.write(fs.readFileSync(reqFile)); // the body of the file
			$(terminal.success + "File sent")
			return Stop(200);
		} else {
			$(terminal.danger + "File does not exist")
			return Stop(404); // file does not exist
		}
	}
	//#endregion
	//#region rate limiting
	// to add: use access file to track last access, and block if more than 1 per second, 1000 per day (429)
	if (fs.existsSync(accessPath + req.connection.remoteAddress)) { // check the file exists before trying to read it
		let accessFile = fs.readFileSync(accessPath + req.connection.remoteAddress).toString();
		let access = Number(accessFile.split("\n")[0]); // read the contents of the file that stores the access data
		let accessToday = Number(accessFile.split("\n")[1]);
		$(terminal.note + terminal.indent + "Last Access: " + new Date(access).toString());
		if (Date.now() - access < (1000 * 60 * 60 * 24)) { // if it has been a day since the last access, reset the amount of accesses in the 24 hour period
			accessToday += 1;
		} else {
			accessToday = 0;
		}
		// if (accessToday > 1000) { // turn this off while I work on the UX2 
		// 	$(terminal.danger + "More than 1000 accesses today");
		// 	return Stop(429);
		// }
		fs.writeFileSync(accessPath + req.connection.remoteAddress, Date.now().toString() + "\n" + accessToday); // update the last access time in the file, we do this before checking the time otherwise the requester can still squeeze 1 request in
		// if (Date.now() - access < 1000) { // the user has requested multiple times in the span of 1 seconds
		// 	$(terminal.danger + "Last access was less than a second ago"); // 1000 milliseconsd is 1 second, if the time+1000 is less time, it means a second has not yet psased 
		// 	return Stop(429);

		// }
	} else {
		$(terminal.info + "This is the first access by this IP");
		fs.writeFileSync(accessPath + req.connection.remoteAddress, 'test') //Date.now().toString()); // create a new file with the time of access
	}
	//#endregion
	//#region origin blocking
	// if (req.headers["host"] != acceptedHost) { // if coming from terminal (and sketchy user forgets the origin), or coming from a fake website, block the request and send a 401
	// 	$(terminal.danger + "Request is not from an acceptable host");
	// 	return Stop(403);
	// }
	if (fs.existsSync(blockedPath + req.connection.remoteAddress)) { // the blocked IP addresses only contain the time they can be unblocked, or -1 for permabans
		$(terminal.danger + "Request is coming from a previously blocked IP address");
		let unblockTime = Number(fs.readFileSync(blockedPath + req.connection.remoteAddress));
		if (unblockTime == -1) {
			$(terminal.danger + "IP is perma banned");
			return Stop(403);
		} else if (Date.now() > unblockTime) {
			$(terminal.info + "IP is no longer blocked");
			// fs.rmSync(blockedPath + req.connection.remoteAddress); // probably don't remove the file, we should keep track of who has been blocked in the past
			// fs.writeFileSync (blockedPath + req.connection.remoteAddress, "") // also don't reset the time, might as well keep it because its being checked anyways
		} else {
			$(terminal.danger + "IP is blocked until " + unblockTime + " (" + new Date(unblockTime).toDateString() + ")");
			return Stop(403);
		}
	}
	//#endregion
	//#region ensuring url is valid
	if (/^\/api\/([a-z]+\/)+(|[a-f0-9]{20}\/)$/.test(req.url)) { // url is /api/action/ or /api/action-with-id/[40 hex characters]/
		$(terminal.none + "URL is formatted correctly (" + req.url + ")");
	} else {
		$(terminal.danger + "Invalid url given");
		// sendCode(403,res);
		return Stop(400);
	}
	//#endregion
	//#region check that user is accepting json ! deprecated, no point
	// if (req.headers["accept != "application/json") { // this server is only going to send json
	// 	// 406
	// 	$(terminal.danger + "Request is not accepting json responses"); // if the use is requesting something that isnt json, we can't really give them anything, so cancel 
	// 	return Stop(406);
	// }
	//#endregion
	//#region get the action from the url
	// set the action here and then continue after we get the body
	const actions = {
		// /api/user/
		checkSession: 0,
		login: 1,
		logout: 2,
		register: 3,
		verifyUserAccount: 4,
		resetPassword: 5,
		getUser: 6,
		explorePosts: 7, // /api/post/
		// /api/post/{id}
		readPost: 8,
		createPost: 9,
		deletePost: 10,
		updatePost: 11,
		// /api/post/user/{id}
		getUserPosts: 12,
		// /api/groups/{id}
		getGroup: 13,
		// /api/me/
		getUserSessionDetails: 14,
		// /api/me/groups
		getUserSessionGroups: 15,
		// /api/me/friends
		getUserSessionFriends: 16
	}
	let action = -1;
	let wrongMethod = false; // just so that we only do Stop(405) once instead of in every case, otherwise we'll have double the lines cause of $
	let actionIndex = ""; // some api links will contain an id, this stores that id on supported actions 
	req.method = req.method.toUpperCase(); // just convert it to uppercase in case it isnt
	// $(req.method);
	if (req.url == "/api/user/login/") { //login
		if (req.method == "POST") action = actions.login;
		else wrongMethod = true; //return Stop (405); // login can only use post
	}
	if (req.url == "/api/user/logout/") { //logout 
		if (req.method == "POST") action = actions.logout;
		else wrongMethod = true; //return Stop(405)
	}
	if (req.url == "/api/user/register/") { //register
		if (req.method == "POST") action = actions.register;
		else wrongMethod = true; //return Stop(405);
	}
	if (req.url == "/api/user/verify/") { // verify user account
		if (req.method == "POST") action = actions.verifyUserAccount;
		else wrongMethod = true; //return Stop(405);
	}
	if (/^\/api\/user\/[0-9a-f]{20}\/$/.test(req.url)) { // access info on a user account
		actionIndex = req.url.slice(-21, -1);
		if (req.method == "GET") action = actions.getUser;
		else wrongMethod = true;
	}
	if (req.url == "/api/me/groups/") {
		if (req.method == "GET") action = actions.getUserSessionGroups;
		else wrongMethod = true;
	}
	if (req.url == "/api/me/") {
		if (req.method == "GET") action = actions.getUserSessionDetails;
		else wrongMethod = true;
	}
	if (req.url == "/api/session/") {
		if (req.method == "GET") action = actions.checkUserSession;
		else wrongMethod = true;
	}
	// if (req.url == "/api/reset-password/") {
	// 	if(req.method=="POST") action=actions.resetPassword;
	// 	else wrongMethod = true; //return Stop(405);
	// }
	// if (req.url == "/api/change-password/") {
	// 	if(req.method=="POST") action=actions.changePassword;
	// 	else wrongMethod = true; //return Stop(405);
	// } - worry about these later
	// $(req.url);
	if (req.url == "/api/post/") {
		if (req.method == "GET") action = actions.explorePosts;
		else wrongMethod = true;
	}
	if (/^\/api\/post\/[a-f0-9]{20}\/$/.test(req.url)) { // /api/post/{id}
		actionIndex = req.url.slice(-21, -1); //get the post ID from the url
		if (req.method == "POST") action = actions.createPost;
		else if (req.method == "GET") action = actions.readPost;
		else if (req.method == "UPDATE") action = actions.updatePost;
		else if (req.method == "DELETE") action = actions.deletePost;
		else wrongMethod = true;
	}
	if (/^\/api\/post\/user\/[a-f0-9]{20}\/$/.test(req.url)) { // /api/post/user/{id}
		actionIndex = req.url.slice(-21, -1);
		if (req.method == "GET") action = actions.getUserPosts; // as the client view only shows a few posts, this is a version that shows all of the posts of the user
		else wrongMethod = true;
	}
	if (/^\/api\/group\/[a-f0-9]{20}\/$/.test(req.url)) { // /api/group/{id}
		actionIndex = req.url.slice(-21, -1);
		if (req.method == "GET") action = actions.getGroup; // as the client view only shows a few posts, this is a version that shows all of the posts of the user
		else wrongMethod = true;
	}
	if (wrongMethod == true) {
		$(terminal.danger + "Requested action exists, but method was incorrect");
		return Stop(405); // method not allowed
	}
	$(action);
	if (action == -1) {
		$(terminal.danger + "Requested action does not exist, wrong method or link")
		return Stop(404);
	}
	//#endregion
	//#region get the request body
	$(terminal.info + "Getting chunks for request body");
	let requestBody = ""; // for larger data, requests might be chunked into seperate pieces 
	await new Promise(
		(resolve, reject) => { // start a promise so that we wait for the request body to be fully received
			req.on("data", (chunk) => { // whenever a new chunk of data comes in
				requestBody += chunk; // add the chunk to the body
				$(terminal.note + terminal.indent + chunk);
			});
			req.on("end", () => { // when the data is finished being sent, 
				return resolve(); // continue everything because data is finished chunking
			});
		}
	);
	// wait for the request body to be obtained
	let requestJson = {};
	let requestKeys = [];
	if (requestBody.length > 0) {
		try {
			requestJSON = JSON.parse(requestBody);
			requestKeys = Object.keys(requestJSON);
		} // if the request is not json formatted, send a 400
		catch {
			$(terminal.danger + "Request body was not JSON, or had syntax errors");
			return Stop(400);
		}
	}
	// $(Object.keys(requestJSON));
	// $(requestKeys);
	$(terminal.success + "Finished getting request body");
	//#endregion
	//#region start session
	var session = new Session(req, res);
	if (session.Start()) { // if the session exists, we don't need to do login or register functions, only logout is needed

		if (action == actions.login || action == actions.register) {
			$(terminal.danger + "User is already logged in");
			let result = await crud.GetUser(false, session.values.UserID);
			// console.log(result);
			res.write(JSON.stringify({
				"username":result[0].DisplayName,
				"email":result[0].Email,
				"data":result[0].DisplayIcon,
				"bio":result[0].DisplayBio,
				"date":result[0].JoinedOn,
				"message":"ALREADY_LOGGED_IN",
				
			}));
			return Stop(409) // send a 409, conflict
		}
	}
	//#endregion
	//#region check user session
	if (action == actions.checkSession) {
		$(terminal.info + "Selected action: check session");
		if (session.values !== undefined && session.values.UserID !== undefined) {
			$(terminal.success + "User is logged in");
			return Stop(200);
		} else {
			$(terminal.danger + "User is not logged in");
			return Stop(404);
		}
	}
	//#endregion
	//#region /user/login
	if (action == actions.login) {
		$(terminal.info + "Selected action: login")
		// seems that *.includes works, but not the in keyword
		// if (requestKeys.length == 3 && requestKeys.includes("email") && requestKeys.includes("password")) { // make sure the json is formatted properly, by checking the length, and that the values are present, we are able to match the keys without them being in the same order
		if (!CheckRequestKeys(["email", "password"])) { // use our new function to check the requests keys
			if (requestJSON["email"] == undefined) {
				$(terminal.danger + "Email is missing");
				return Stop(400, "LOGIN_MISSING_EMAIL");
			}
			if (requestJSON["password"] == undefined) {
				$(terminal.danger + "Password is missing");
				return Stop(400, "LOGIN_MISSING_PASSWORD");
			}
			// return Stop(400, "LOGIN_MISSING_VALUE");
		}
		if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(requestJSON["email"])) { // the defacto email regexp
			$(terminal.success + "Email is correct (" + requestJSON["email"] + ")");
		} else {
			$(terminal.danger + "Email is invalid");
			return Stop(400, "LOGIN_EMAIL_INVALID");
		}
		// later on, implement a more stable encryption using salts and the crypto verify function
		let hashedPassword = crypto.createHmac('sha1', hashKey).update(requestJSON["password"]).digest("hex"); // generate the hash as hexidecimal characters, I have no clue what this stuff means
		let result = await crud.GetUser(true, requestJSON["email"]);
		// $(result);
		$(result);
		if (result[0] === undefined) {
			$(terminal.danger + "No account was found with that email address.");
			return Stop(404, "LOGIN_USER_NOT_FOUND");
		} else {
			$(terminal.success + "Account was found.");
		}
		if (result[0]["Password"] == hashedPassword) { // after hashing, the client password matches the database password
			$(terminal.success + "Client password matches account password")
			session.Create(); // doesn't actually make the file, only sets the cookie and generates the cookie
			session.values["UserID"] = result[0]["ID"]; // set the user id of the session
			session.Update(); // create the file
			res.write(JSON.stringify({
				email: result[0]["Email"],
				username: result[0]["DisplayName"],
				data: result[0]["DisplayIcon"],
				bio: result[0]["DisplayBio"],
				message:"LOGIN_CORRECT"
			}));
			return Stop(200)
		} else {
			$(terminal.danger + "Client password does not match account password")
			return Stop(404, "LOGIN_PASSWORD_INCORRECT")
		}
	}
	//#endregion
	//#region /user/logout
	if (action == actions.logout) {
		$(terminal.info + "Selected action: logout");
		session.Destroy(); // unset the session cookie and destroy the session file
		return Stop(200, "LOGOUT_SUCCESS"); // I dont even want to know how this could fail, or the security implimincations of not being able to log out
	}
	//#endregion
	//#region /user/register
	if (action == actions.register) {
		$(terminal.info + "Selected action: register");
		if (!CheckRequestKeys(["email", "displayName", "password", "passwordRetype"])) {
			if (requestJSON["email"] == undefined) { // email wasnt given
				$(terminal.danger + "Email is missing");
				return Stop(400, "REGISTER_MISSING_EMAIL");
			}
			if (requestJSON["displayName"] == undefined) { // display name wasnt given
				$(terminal.danger + "Display name is missing");
				return Stop(400, "REGISTER_MISSING_DISPLAYNAME");
			}
			if (requestJSON["password"] == undefined) { // password wasnt given
				$(terminal.danger + "Password is missing");
				return Stop(400, "REGISTER_MISSING_PASSWORD");
			}
			if (requestJSON["passwordRetype"] == undefined) { // second password / retype wasnt given
				$(terminal.danger + "Password retype is missing");
				return Stop(400, "REGISTER_MISSING_PASSWORD_RETYPE");
			}
		}
		if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(requestJSON["email"])) { // the defacto email regexp
			$(terminal.success + "Email is correct");
		} else {
			return Stop(400, "REGISTER_EMAIL_INVALID");
		}
		if (requestJSON["password"] === requestJSON["passwordRetype"]) { // the password and retyped password from the client are matching
			$(terminal.success + "Passwords match");
		} else {
			$(terminal.danger + "Passwords aren't matching");
			return Stop(400, "REGISTER_PASSWORD_NOT_EQUAL");
		}
		if (/^[a-zA-z0-9-+_.()\[\]\!\@\#\$\%\^\&\*]{1,40}$/.test(requestJSON["displayName"])) { // if the display name has invalid characters, only somewhat standard characters are allowed
			$(terminal.success + "Display name is valid");
		} else {
			$(terminal.danger + "Display name is invalid");
			return Stop(400, "REGISTER_DISPLAYNAME_INVALID");
		}
		let hashedPassword = crypto.createHmac('sha1', hashKey).update(requestJSON["password"]).digest("hex"); // generate the hash as hexidecimal characters

		let result = await crud.GetUser(true, requestJSON["email"]);
		// $(result);
		if (result === undefined || result.length == 0) { // the sql query always returns the [0] of the result an array, if nothing is found it will be undefined
			$(terminal.success + "Account does not exist");
		} else {
			$(terminal.danger + "Account already exists");
			return Stop(409, "REGISTER_ACCOUNT_EXISTS"); // return a 409 conflict
		}

		let newID = crypto.randomBytes(10).toString('hex'); // 10 bytes, 20 characters, considering its hexidecimal, theres 16 possible characters per character, so 16^20 = a number so big it doesnt fit on the calculator
		await crud.CreateNewUser(newID, requestJSON["email"], requestJSON["displayName"], hashedPassword, Date.now() / 1000); // insert the account, Date.now()/1000 gets the current unix time, which is to be valid until 2038, and if this code hasn't been changed or superceeded by then, its safe to assume I've died or been kidnapped
		session.Create(); // set the cookie
		session.values["UserID"] = newID; // set the user id of the cookie
		session.Update(); // create the file with the values
		$(terminal.success + "New account was created")
		res.write(JSON.stringify({
			email: requestJSON["email"],
			username: requestJSON["displayName"],
			message:"REGISTER_SUCCESS"
		}));
		return Stop(200);
	}
	//#endregion
	//#region /user/verify
	if (action == actions.verifyUserAccount) {
		$(terminal.info + "Selected action: verify user account");
		if (requestKeys.length == 1 && requestKeys[0] == ["verificationCode"]) { // dont need the function, just check for the single key
			if (/^[0-9a-f]{6}$/i.test(requestJSON["verificationCode"])) { // 3 hex bytes, 6 characters
				$(terminal.success + "Verification code is valid");
			} else {
				$(terminal.danger + "Verification code is invalid");
				return Stop(400, "VERIFY_INVALID_CODE");
			}
		} else {
			$(terminal.danger + "Missing verify code")
			return Stop(400, "VERIFY_NO_CODE");
		}
		// try {
		if (session.values == {}) { // if the user is not logged in .values will be empty, unless it has been edited before hand, but each action does things on its own so it doesnt matter
			$(terminal.danger + "User is not logged in");
			return Stop(403, "VERIFY_NO_LOGIN"); // not authorised to validate your account if you aren't logged in to said account?
		}
		// let result = await crud.GetUser(false, session.values["UserID"]); // get the values of the user from the session
		let result = await crud.GetUser(false, session.values["UserID"]); // get the values of the user from the session
		if (result[0]["IsVerified"] == 1) {
			$(terminal.danger + "User is already verified");
			return Stop(409, "VERIFY_CONFLICT"); // trying to verify verified account
		}
		$(result[0]["VerificationCode"], requestJSON["verificationCode"])
		if (result[0]["VerificationCode"] == requestJSON["verificationCode"]) { // verification code matches the client verification code
			$(terminal.success + "Verification code is correct");
			await crud.VerifyUser(session.values["UserID"]); // set the verified value of the user account to 1
			$(terminal.success + "User is now verified");
			return Stop(200, "VERIFY_SUCCESS");
			// $(terminal.danger + "SQL ERROR! Check that SQL is running");
		} else {
			$(terminal.danger + "Code is incorrect");
			// possibly reshuffle the code here? maybe later
			return Stop(404, "VERIFY_INCORRECT_CODE");
		}
		// } catch {
		// 	$(terminal.danger + "SQL ERROR! Check that SQL is running");
		// 	return Stop (500, "abcd");
		// }
	}
	//#endregion
	//#region drawing storage ramblings
	// image resolution is 256x192

	// method A: images would be stored with 4 bits to store colour (0-16) and 8 bits to store an amount (0-255),
	// assuming a single colour for each row (192), it would only add up to 12x192x192, 2302 bits, 288 bytes, ~0.2 kilobytes
	// assuming every pixel was a different colour, and only had a length of 1, it would add up to 12x192x256, 589824 bits, 73728 bytes, exactly 72 kilobytes

	// method B: store just the colour for every single pixel, which would add up to 8x192x256, 383216 bits, 49152 bytes, exactly 48 kilobytes

	// is method A > method B?
	// the most perfectly average image for method A could be (2302 + 589824) / 2, or 592126/2 = 296062 bits, which is 37007.875 bytes, 36.14 kilobytes
	// understanding how most images are drawn, using lots of whitespace, its rare an image would be anything above even a third of that 
	// every image of method B would be 48 bytes, regardless of complexity
	// so if everyone on the site decided to make fully dithered 3d renderings, it would be less expensive to store direct pixels, but because of the way people draw, it would rarely exceed 10 kilobytes (estimate)

	// which means method A wins, and the blob size 

	// apparently mysql blobs cant store more than 64kb, so a medium blob will be used which stores up to 64mb, but now its a BIT excessive although its only 1 extra byte to store the size, so the sacrifice must be made

	// user icons will be 64x64 pixels, cause its way cooler to let people draw their own icons
	// unlike before, 4 bits store the colour, 6 bits store the amount
	// method A, like before, 10x1x64 = 640 , which is the max possible size for the 64x64 image, with 64 rows of 1 colour
	// 10x64x64 = 40960 for a fully dithered image in method A
	// method B simply stores the colour for each pixel, so 4*64*64 = 16384
	// like before, because the way people draw it'd be smaller over time to just use the 10 bits

	// this means that it can be stored in a normal sized blob, saving us 1 extra byte compared to the other one, even though it doesn't matter

	//#endregion
	//#region /user/{id} get user
	if (action == actions.getUser) {
		$(terminal.info + "Selected action: Get user");
		let result = await crud.GetPublicUserInfo(actionIndex);
		if (result === undefined || result.user === undefined || result.user.length == 0) { // if the user is not found, or an sql error of some sort happens
			$(terminal.danger + "User was not found");
			return Stop(404, "USER_NOT_FOUND");
		}

		// $(result);
		res.write(JSON.stringify({ // get the data from the multiple queries, into 1 json file
			"user": result.user, //[0],
			"friends": result.friends, //[0],
			"posts": result.posts, //[0],
			"groups": result.groups //[0]
		}));
		return Stop(200); // the user has been found 
	}
	//#endregion
	//#region /post/ get explore (all posts for now)
	if (action == actions.explorePosts) {
		$(terminal.info + "Selected action: Explore posts");
		let result = await crud.GetExplore();
		if (result === undefined || result.length == 0) { // if the post was not found, or slq error happened
			$(terminal.danger + "No Posts were found")
			return Stop(404, "POST_NOT_FOUND");
		}
		$(terminal.success + "Posts were found")
		res.write(JSON.stringify(result));
		return Stop(200);
	}
	//#endregion
	//#region /post/{id} get post
	if (action == actions.readPost) {
		$(terminal.info + "Selected action: Get post");
		let result = await crud.GetPost(actionIndex);
		if (result === undefined || result.post === undefined || result.post.length == 0) { // if the post was not found, or slq error happened
			$(terminal.danger + "Post was not found")
			return Stop(404, "POST_NOT_FOUND");
		}
		$(terminal.success + "Post was found")
		res.write(JSON.stringify({
			"post": result.post,
			"group": result.group,
			"replies": result.replies
		}));
		return Stop(200);
	}
	//#endregion
	//#region /group/{id}
	if (action == actions.getGroup) {
		$(terminal.info + "Selected action: Get group info and posts");
		$(actionIndex);
		let result = await crud.GetGroup(actionIndex);

		// $(result);

		if (result === undefined || result === undefined || result.length == 0) { // if the post was not found, or slq error happened
			$(terminal.danger + "Post was not found")
			return Stop(404, "POST_NOT_FOUND");
		}
		$(terminal.success + "Posts were found")
		res.write(JSON.stringify(result));
		return Stop(200);

	}
	//#endregion
	//#region /me/ get the account details of the session
	if (action == actions.getUserSessionDetails) { // this gets the basic details of the user's account from the session. We don't want to be sending the user's password to the client, for example
		$(terminal.info + "Selected action: Get user account details from session");
		if (session.values.UserID !== undefined) {
			let result = await crud.GetUser(false, session.values.UserID);
			if (result.length == 0 || result === undefined) {
				$(terminal.danger + "User was not found");
				return Stop(404);
			}
			res.write(JSON.stringify({
				"Email": result[0]["Email"],
				"DisplayName": result[0]["DisplayName"],
				"DisplayIcon": result[0]["DisplayIcon"],
				"DisplayBio": result[0]["DisplayBio"],
				"JoinedOn": result[0]["JoinedOn"],
				"IsVerified": result[0]["IsVerified"]
			}));
			return Stop(200);
		} else {
			$(terminal.danger + "No session was found");
			return Stop(401);
		}
	}
	//#endregion
	//#region /me/groups/
	if (action == actions.getUserSessionGroups) { // this gets the details of the user's groups, as well as 
		$(terminal.info + "Selected action: Get user groups from session");
		if (session.values.UserID !== undefined) {
			let result = await crud.GetUserGroups(session.values.UserID);
			if (result.length == 0 || result === undefined) {
				$(terminal.danger + "User was not found");
				return Stop(404, "USER_NOT_FOUND");
			}
			res.write(JSON.stringify({
				groups: result.groups,
				invites: result.invites
			}));
			return Stop(200);
		} else {
			$(terminal.danger + "No session was found");
			return Stop(401, "NOT_SIGNED_IN");
		}
	}
	return Stop(400);
}

// server.listen(3000, '192.168.0.143');
server.listen(3000, serverHost);