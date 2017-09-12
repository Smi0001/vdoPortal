var mongoose = require('mongoose');
var q = require('q');

//defining schema for videos table
var videoSchema = new mongoose.Schema({
	  name: { type: String }, 
	  description: { type: String }, 
	  url: String,
	  ratings: []
});

var Video = mongoose.model('videos', videoSchema);

//Initlizing interface object of this model.
var videosModel = {};

//Function to seed videos data.
videosModel.seed = function(){
	var videos=Array();
	/*videos.push({name: 'metro', description:'A video of a monkey carelessly wandering around inside the Delhi Metro has surfaced online, and is being widely shared by people acorss social media. It is believed that humans have evolved from monkeys, and that there are a lot of similarities between the two. But, here’s a fun fact: monkeys and humans have one more thing in common — they love travelling in the Metro. Can’t believe it? A rare sight was encountered in the Delhi Metro when a monkey got inside a train compartment — leaping around, from one bogie to another.',
		url:'videos/metro.mp4', ratings:[1,5,5,4,3,4,2,5]});
	videos.push({name: 'modi', description:'Some people were trying to guess what his speech could be about, making bizarre guesses like, “For all we know, @narendramodi could just say, “Mitron, is 31st December se, 31st December legal New Year nahi manaya jaega.” #Modi.” Another wrote, “Modi’s Speech on 31st December at 7:30: Hata saavan ki ghata.. Aao mitro lets Partyyyyyyy!”',
		url:'videos/modi.mp4', ratings:[4,5,5,5,3,5,4,5]});
	videos.push({name: 'mommy', description: 'Micah Quinones was born a beautiful baby boy with a cute, big belly and 48 chromosomes (Trisomy 21/Downs Syndrome) that he rocks with style. Micah\'s dad, Mike Quinones, created this Instagram account to document his newborn\'s journey. ',
		url:'videos/mommy.mp4', ratings:[2,4,2,2,3,1,2,5]});
	videos.push({name: 'sott', description:'So what made the song turn into an overnight meme? Its problematic and notorious lyrics (which none of us at CNNNews18 endorse, by the way) that has somehow connected with the masses at a personal level.		The opening lines of the song go like this: 	Bol na aunty aau kya,	Ghanti main bajau kya,	Sot main lagau kya,		Bol na aunty aau kya?	Nope, not going to translate or explain any of it. The Internet has been dropping memes around the song since a couple of weeks. Oh and did I tell you, according to the Internet janta, Mishra is India\'s Eminem. Lol.',
		url:'videos/sott.mp4', ratings:[3,3,3,3,3,3,3,3]});
	videos.push({name: 'stone', description:' Scottish wildlife cameraman films polar bear and it tries to break ... and one of the few animals that actually see us as food,” Buchanan said.',
		url:'videos/stone.mp4', ratings:[4,3,4,3,4,3,4,3]});
	videos.push({name: 'toast', description:'This is how Samsung plans to prevent future phones from catching fire. Samsung said that it has implemented a new eight-step testing process for its lithium ion batteries, and that it’s forming a battery advisory board as well, comprised of academics from Cambridge, Berkeley, and Stanford. Note, this is for all lithium ion batteries in Samsung products, not just Note phablets or the anticipated Galaxy S8 phone. ',
		url:'videos/toast.mp4', ratings:[1,5,5,5,3,4,5,5]});*/
	videos.push({name: 'Getting Started With ReactJs', description:'React.js is a JavaScript library for building user interfaces. - Just the UI: Lots of people use React as the V in MVC. Since React makes no assumptions about the rest of your technology stack, its easy to try it out on a small feature in an existing project. - Virtual DOM: React uses a virtual DOM diff implementation for ultra-high performance. It can also render on the server using Node.js — no heavy browser DOM required. - Data flow: React implements one-way reactive data flow which reduces boilerplate and is easier to reason about than traditional data binding.', url:'videos/Getting_Started_With_React.js.mp4', ratings:[1,5,5,4,3,4,2,5]});
	videos.push({name: 'Google Cardboard Assembly', description:'Google Cardboard Assembly Step by Step Instructions [HD]', url:'videos/Google_Cardboard_Assembly.mp4', ratings:[4,5,5,5,3,5,4,5]});
	videos.push({name: 'How Does AngularJS Work Beginners Angular Tutorial', description: 'What you will learn in this course. How to use Angular.js to save time, create better projects and give your users a better experience. We’ll create a full SPA from scratch (client side). How to cloud-enable your SPA so that you can connect it to any kind of backend. Fully commented source code of the course project. Learn how to architecture a SPA: modules, controllers, services Learn how to add URL routes to your client-side SPA. We’ll be using Angular.js version 1.3.2. Access live examples at the end of each coding lesson. Learn how to use other great tools such as Boostrap 3, UnderscoreJS and Google Chrome’s Developer Tools!', url:'videos/How_Does_AngularJS_Work_Beginners_Angular_Tutorial.mp4', ratings:[2,4,2,2,3,1,2,5]});
	videos.push({name: 'How does Node.js work', description:'New to Node.js? Check out this video that explains "How does Node work?"', url:'videos/How_does_Node.js_work.mp4', ratings:[3,3,3,3,3,3,3,3]});
	videos.push({name: 'iPhone 7 Trailer 2016', description:'iPhone 7 concept trailer 2016! with Bluetooth AirPods by Beats and ChargingPad, and much more!', url:'videos/iPhone_7_Trailer_2016.mp4', ratings:[4,3,4,3,4,3,4,3]});
	videos.push({name: 'What is the MEAN Stack', description:'Do you know what the MEAN stack is? Watch our short intro video and get ready to kick your learning into shape with this full-stack development toolkit. Then head on over and play through our MEAN-related courses now.', url:'videos/What_is_the_MEAN_Stack.mp4', ratings:[1,5,5,5,3,4,5,5]});

	var dataToInsert = Array();
	for(var i=0; i<100; i++){
		var index = i%6;
		var videoObject = JSON.parse(JSON.stringify(videos[index]));//cloning object
		videoObject.name = '['+i+'] '+videoObject.name;
		dataToInsert.push(videoObject);
	}
	
	Video.collection.insert(dataToInsert, function(err, video) {
		if(err){
			console.log('error occured in populating database');	
			console.log(err);	
		} 
		else{
			console.log('Videos table populated.');	
		}	
	});
	
}

//function to get video listings
videosModel.get = function(skip, limit){
	var results = q.defer();

	skip = parseInt(skip) || 0;
	limit = parseInt(limit) || 10;

	Video.find(function(err, dbVideo) {
		if (err){
			results.reject(err);
		} 
		
		results.resolve(dbVideo);
	}).skip(skip).limit(limit);

	return results.promise;
	
}

//function to get single video by its id.
videosModel.getOne = function(id){
	var results = q.defer();

	if(!id){
		results.reject({status:'error', error:'Video Id not supplied.'});
	}

	Video.findOne({_id:id},function(err, dbVideo) {
		if (err){
			results.reject(err);
		} 
		
		if(dbVideo){
			results.resolve(dbVideo);	
		} else{
			results.reject({status:'error', error:'Invalid video Id supplied.'});	
		}
		
	});

	return results.promise;
	
}

//function to rate single video by its id.
videosModel.rate = function(id, ratting){
	var results = q.defer();
	ratting = parseInt(ratting);
	var error=false;

	if(!id){
		results.reject({status:'error', error:'Video Id not supplied.'});
		error = true;
	}
	if(!ratting){
		results.reject({status:'error', error:'User ratting not supplied.'});
		error = true;
	}

	if(ratting<0 || ratting>5){
		results.reject({status:'error', error:'User ratting is out of range.'});
		error = true;
	}

	if(error==false){
		Video.findOne({_id:id},function(err, dbVideo) {
			if (err){
				results.reject(err);
			} 

			dbVideo.ratings.push(ratting)
			
			dbVideo.markModified('array');
	    	dbVideo.save();

			results.resolve(dbVideo);
		});
	}
	

	return results.promise;
	
}

module.exports = videosModel;