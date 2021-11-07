const http = require("http");
const crypto = require("crypto");
const options = {
	host: "localhost",
	port: 2000,
	path: "/public/index.html",
	method: "GET",
	headers:{
		"Cookie":""
	}
}

const colours = {
	none: "\033[97m",
	note: "\033[90m",
	success: "\033[92m",
	warning: "\033[93m",
	danger: "\033[91m",
	info: "\033[94m",
	indent: "   "
}

function $(text="", colour = "\033[97m") {
	if (typeof(text)=="string") {
	console.log(colour + text);
	}
	else {
		console.log(text);
	}
}

var cookie = "";
function request(data = null, setCookie=false) {
	return new Promise((resolve) => {
		let req = http.request(options, function (res) {
			
			res.on("data", chunk=> {
				$(chunk.slice(0, 50) + "...", colours.note);	
			})
			if (res.statusCode > 199 && res.statusCode < 300) {
				$("✓ " + res.statusCode, colours.success);
			} else if (res.statusCode > 399 && res.statusCode < 500) {
				$("✕ " + res.statusCode, colours.danger);
			} else {
				$("⚙ " + res.statusCode, colours.note);
			}
			if(res.headers["set-cookie"] !== undefined ) if (setCookie) cookie = res.headers["set-cookie"];
			// if (res.getHeader("Cookie")){
			// 	cookie = res.getHeader("Cookie");
			// 	$("COOOKCIE" + cookie);
			// }
			// console.log(res.headers)
			resolve();
		})
		if(data) req.write(JSON.stringify(data))
		req.end();
	});

}
async function test() {
	$("Starting tests...");
	$("Getting public index");
	$("/api/post/",colours.note);
	await request();
	$()

	$("Getting all posts (target:200)")
	$("/api/post/", colours.note);
	options.path = "/api/post/";
	options.method = "GET";
	await request();
	$()
	
	$("Getting a specific post (correct id) (target:200)")
	$("/api/post/a5d548d75cab67bf5e7b/", colours.note);
	options.path = "/api/post/a5d548d75cab67bf5e7b/";
	options.method = "GET";
	await request();
	$()

	$("Getting a specific post (incorrect id) (target:404)")
	$("/api/post/12345678901234567890/", colours.note);
	options.path = "/api/post/12345678901234567890/";
	options.method = "GET";
	await request();
	$()
	
	$("Getting info on a specific user (correct id) (target:200)")
	$("/api/user/ad43fae0aa1720c60b63/", colours.note);
	options.path = "/api/user/ad43fae0aa1720c60b63/";
	options.method = "GET";
	await request();
	$()
	
	$("Getting info on a specific user (incorrect id) (target:404)")
	$("/api/user/12345678901234567890/", colours.note);
	options.path = "/api/user/12345678901234567890/";
	options.method = "GET";
	await request();
	$()

	$("Getting info on a specific group (correct id) (target:200)")
	$("/api/group/7b85a9b2a97a57ac4b10/", colours.note);
	options.path = "/api/group/7b85a9b2a97a57ac4b10/";
	options.method = "GET";
	await request();
	$()

	$("Getting info on a specific group (incorrect id) (target:404)")
	$("/api/group/12345678901234567890/", colours.note);
	options.path = "/api/group/12345678901234567890/";
	options.method = "GET";
	await request();
	$()
	
	
	$("Check we are logged in (we aren't) (target:404)")
	$("/api/session/", colours.note);
	options.path = "/api/session/";
	options.method = "GET";
	options.headers.Cookie = cookie;
	await request();
	$()

	$("Log in (existing account) (target:200)")
	$("/api/user/login/", colours.note);
	options.path = "/api/user/login/";
	options.method = "POST";
	await request( {"email":"abc@123.xyz","password":"abcd"},SetCookie = true);
	$()
	// $(cookie)
	$("Check we are logged in (we should be) (target:200)")
	$("/api/session/", colours.note);
	options.path = "/api/session/";
	options.method = "GET";
	options.headers["Cookie"] = cookie;
	await request();
	$()
	// $(cookie)
	$("Logging out (target:200)");
	$("/api/user/logout/", colours.note);
	options.path = "/api/user/logout/";
	options.method = "POST";
	options.headers["Cookie"] = cookie;
	await request({}, SetCookie = true);
	$()
	$("Check we are logged in (we shouldn't be) (target:404)")
	$("/api/session/", colours.note);
	options.path = "/api/session/";
	options.method = "GET";
	options.headers["Cookie"] = cookie;
	await request();
	$()
	$("Trying to register an existing account(target:409)")
	$("/api/user/register/", colours.note);
	options.path = "/api/user/register/";
	options.method = "POST";
	// options.headers["Cookie"] = cookie;
	await request({"email":"abc@123.xyz","displayName":"ABCDEF", "password":"ABCDEFG","passwordRetype":"ABCDEFG"});
	$()
	$("Try to register a new account(target:200)")
	$("/api/user/register/", colours.note);
	options.path = "/api/user/register/";
	options.method = "POST";
	options.headers["Cookie"] = cookie;
	let eml="abc@" + crypto.randomBytes(10).toString('hex')+ ".zezeze";
	let dsn = crypto.randomBytes(10).toString('hex');
	await request({"email":eml,"displayName":dsn, "password":"ABCDEFG","passwordRetype":"ABCDEFG"}, SetCookie=true);
	$()

	$("Log in to new account (target:200)")
	$("/api/user/login/", colours.note);
	options.path = "/api/user/login/";
	options.method = "POST";
	await request( {"email":eml,"password":"ABCDEFG"},SetCookie = false);
	$()
	$("Try to verify account email (incorrect code) (target:404)")
	$("/api/user/verify/", colours.note);
	options.path = "/api/user/verify/";
	options.method = "POST";
	options.headers["Cookie"] = cookie;
	await request( {"verificationCode":"12aed1"},SetCookie = false);
	// $("Try to  a new account(target:200)")
	// $("/api/user/register/", colours.note);
	// options.path = "/api/user/register/";
	// options.method = "POST";
	// // options.headers["Cookie"] = cookie;
	// await request({"email":"abc@" + crypto.randomBytes(10).toString('hex')+ ".zezeze","displayName":crypto.randomBytes(10).toString('hex'), "password":"ABCDEFG","passwordRetype":"ABCDEFG"});
	$()
	// $(cookie)
	// $("This should be a 409, but is interpreted as 200");


}
test();