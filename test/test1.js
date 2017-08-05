var  request = require('supertest');
var app = require('../app');
describe("Loginpage",function () {
	it("welcomes the user",function(done){
		request(app).get("/login")
		.expect(200,done);

	});
	
});
describe("Loginpage",function () {
	it("Post the login details",function(done){
		request(app).post("/login")
		.send({username:"evelabs",password:"evelabs"})
		.expect(302,done);
	});
	
});
describe("add station",function () {
	it("User Selects or add Station",function(done){
		request(app).get("/addstation")
		.expect(302,done);

	});
	
});
describe("Register",function () {
	it("User can register",function(done){
		request(app).get("/register")
		.expect(200,done);

	});
	
});
describe("Register",function () {
	it("User can register",function(done){
		request(app).post("/register")
		.send({hname:"test",username:"rahulaunni@gmail.com",password_confirmation:"pass",password:"pass"})
		.expect(200,done);

	});
	
});

describe("forgotpassword",function () {
	it("User can able to request a password reset link",function(done){
		request(app).get("/forgot")
		.expect(200,done);

	});
	
});
describe("Home Page",function () {
	it("Home page of the Server App",function(done){
		request(app).get("/")
		.expect(302,done);

	});
	
});
//patient route testing
describe("Add Patient Page",function () {
	it("Add patient details",function(done){
		request(app).get("/addpatient")
		.expect(302,done);

	});
	
});
describe("List Patient Page",function () {
	it("List patient details",function(done){
		request(app).get("/listpatient")
		.expect(302,done);

	});
	
});
describe("Edit Patient Page",function () {
	it("Edit patient details",function(done){
		request(app).get("/editpatient")
		.expect(302,done);

	});
	
});
describe("Add Patient Page",function () {
	it("Add patient details",function(done){
		request(app).post("/addpatient")
		.expect(302,done);

	});
	
});

describe("Edit Patient Page",function () {
	it("Edit patient details",function(done){
		request(app).post("/updatepatient")
		.expect(302,done);

	});
	
});
//bed pages routes
describe("Add bed Page",function () {
	it("Add bed details",function(done){
		request(app).get("/addbed")
		.expect(302,done);

	});
	
});
describe("Edit bed Page",function () {
	it("Edit bed details",function(done){
		request(app).get("/editbed")
		.expect(302,done);

	});
	
});
describe("Add bed Page",function () {
	it("Add bed details",function(done){
		request(app).post("/addbed")
		.expect(302,done);

	});
	
});

describe("Edit bed Page",function () {
	it("Edit bed details",function(done){
		request(app).post("/editbed")
		.expect(302,done);

	});
});	
//device routes
describe("Add device Page",function () {
	it("Add device details",function(done){
		request(app).get("/adddevice")
		.expect(302,done);

	});
	
});
describe("Edit device Page",function () {
	it("Edit device details",function(done){
		request(app).get("/editdevice")
		.expect(302,done);

	});
	
});
describe("Add device Page",function () {
	it("Add device details",function(done){
		request(app).post("/adddevice")
		.expect(302,done);

	});
	
});

describe("Edit device Page",function () {
	it("Edit device details",function(done){
		request(app).post("/editdevice")
		.expect(302,done);

	});
});	
//ivset routes
describe("Add ivset Page",function () {
	it("Add ivset details",function(done){
		request(app).get("/addivset")
		.expect(302,done);

	});
	
});
describe("Edit ivset Page",function () {
	it("Edit ivset details",function(done){
		request(app).get("/editivset")
		.expect(302,done);

	});
	
});
describe("Add ivset Page",function () {
	it("Add ivset details",function(done){
		request(app).post("/addivset")
		.expect(302,done);

	});
	
});

describe("Edit ivset Page",function () {
	it("Edit ivset details",function(done){
		request(app).post("/editivset")
		.expect(302,done);

	});
});