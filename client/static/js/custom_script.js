var domain = 'http://localhost';
var port = '5000';
var mainUrl = domain + ':' + port;

var videoPortalApp = angular.module('videoPortalApp',
 ['angular-md5', 'ngSanitize', 'infinite-scroll'])
 .controller('videoPortalController', ['$window', '$rootScope','$scope', '$compile', 'md5', '$http',
 	function($window, $rootScope, $scope, $compile, md5, $http) {

	 	var authurl = mainUrl + '/user/auth';
	 	var usrnmInput = document.querySelector('#j-loginDiv [type="username"]');
	 	var pswdInput = document.querySelector('#j-loginDiv [type="password"]');
	 	var loginBtnDiv = document.querySelector('.j-login-btn-div button');
	 	$scope.userName = 'User';
	 	$scope.injectVdoList = function(username, sessionId) {
			var $injector = angular.element(document.getElementById('j-videoPortalController')).injector();
			$injector.invoke(['$rootScope', '$compile',function($rootScope, $compile) {
				var $scope = $rootScope.$new();
				var	html = '<video-list class="video-list-div" user-name="' +
					username + '" session-id="' + sessionId + '" ></video-list>';
				html = $compile(html)($scope);
				$('#j-videoListDiv').html(html);
			}]);
	 	};

	 	if ($window.sessionStorage && $window.sessionStorage.getItem('userSession')) {
			$rootScope.isAuthenticated = true;
			$scope.userName = $window.sessionStorage.getItem('userName');
			$scope.injectVdoList($scope.userName , $window.sessionStorage.getItem('userSession'));
	 	} else {
	 		$rootScope.isAuthenticated = false;
	 		$window.sessionStorage.clear();
	 	}
	 	
	 	$scope.login = function(usrnm, pswd) {
	 		pswd = md5.createHash(pswd);
	 		$http.post(authurl, { 'username': usrnm, 'password': pswd})
			.then(function(res) {
			  	if(res.data && res.data.status == "success") {
			  		showSuccessMsg('Login successful');
					$scope.userName = res.data.username;
					var sessionId = res.data.sessionId;
					$rootScope.isAuthenticated = true;

					//setting in sessionStorage to skip login in case of session is not expired
					$window.sessionStorage.setItem('userName', $scope.userName);
					$window.sessionStorage.setItem('userSession', sessionId);
			  		//injecting 
					$scope.injectVdoList($scope.userName, sessionId);
				} else if (res.data && res.data.status == "error") {
					showSuccessMsg('Error: ' + res.data.error, true);
					usrnmInput.value = "";
					pswdInput.value = "";
				} else {
					$window.sessionStorage.setItem('isAuthenticated', false);
				}
			})
			.catch(function(res) {
				$window.sessionStorage.setItem('isAuthenticated', false);
				showSuccessMsg('Some Error Occured', true);
			})
			.finally(function() {
				removeClass(loginBtnDiv, 'loading');
				console.log("finally login hit finished");
			});
	 	};

	 	$scope.tryLogin = function() {
	 		var usrnm = usrnmInput.value;
	 		var pswd = pswdInput.value;
	 		if (!usrnm || !pswd || pswd == "") {
	 			showSuccessMsg('Invalid username or password', true);
	 			return false;
	 		}
	 		addClass(loginBtnDiv, 'loading');
	 		$scope.login(usrnm, pswd);
	 	};

	 	$scope.logOut = function() {
	 		document.querySelector('video-list').remove();
//	 		sessionStorage.clear();
	 		$rootScope.isAuthenticated = false;
	 		$scope.userName = 'User';
	 	};
	 	$scope.activateSearch = function(e) {
	 		var _this = e.target;
			var sibling = _this.nextElementSibling
			if (!sibling) sibling = _this.nextSibling;
			sibling.style.display = 'block';
			addClass(_this, 'expand');
			//search vdos autocomplete
		};
		$scope.blurSearch = function(e) {
			var _this = e.target;
			var sibling = _this.nextElementSibling
			if (!sibling) sibling = _this.nextSibling;
			sibling.style.display = 'none';
			removeClass(_this, 'expand');
		};
		
}]);

videoPortalApp.filter('avg', function() {
  return function(arr) {
  	var sum = 0;
  	angular.forEach(arr, function(value, index) {
  		sum += value;
  	});
  	var rate = (sum / arr.length).toFixed(1);
  	var rateStr = '';
  	if (rate < 1) rateStr = '0';
  	else if (rate < 1.5) rateStr = '1';
  	else if (rate < 2) rateStr = '15';
  	else if (rate < 2.5) rateStr = '2';
  	else if (rate < 3) rateStr = '25';
  	else if (rate < 3.5) rateStr = '3';
  	else if (rate < 4) rateStr = '35';
  	else if (rate < 4.5) rateStr = '4';
  	else if (rate < 5) rateStr = '45';
  	else rateStr = '5';
    return rateStr;
  };
});

videoPortalApp.filter("trustUrl", ['$sce', function ($sce) {
	return function (recordingUrl) {
		return $sce.trustAsResourceUrl(recordingUrl);
	};
}]);


/* video-list directive*/
videoPortalApp.directive('videoList', function() {
	return {
		restrict: 'E',
		scope: {
			userName: '@',
			sessionId: '@'
		},
		controller: ['$window', '$rootScope', '$scope', '$http', '$compile', '$timeout',
			function($window, $rootScope, $scope, $http, $compile, $timeout) {
			$scope.vdoArr = [];
			var skipVdoCount = 0;
			var vdoLimit = 10
			$scope.loadVdo = function(vdoUrl) {
				console.log('..loading ' + vdoLimit + ' more videos...');
				$http.get(vdoUrl)
				.then(function(res) {
					if(res.status == 200 && res.data && res.data.data) {
						angular.forEach(res.data.data, function(item, index) {
					    	$scope.vdoArr.push(item);
					    });
					}
				})
				.catch(function(res) {
					if (res.status == "error" || res.status == 401) {
						//prompting to login again
						$rootScope.isAuthenticated = false;
						$window.sessionStorage.clear();
					}
					showSuccessMsg('Some Error Occured', true);
				})	
				.finally(function() {
					addClass(document.querySelector('.j-vdo-loader'), 'displaynone');
					console.log($scope.vdoArr.length + ' vdos loaded');
				});
			};
			//loading first 10 vdos
			var vdoparams = '?sessionId=' + $scope.sessionId + '&skip=' + skipVdoCount + '&limit=' + vdoLimit;
			var vdoUrl = mainUrl + '/videos' + vdoparams;
			// addClass(loginBtnDiv, 'loading');
			$scope.loadVdo(vdoUrl);

			//lazy loading
			$scope.loadNextVdoListPage = function() {
				if ($scope.vdoListLoadBusy || skipVdoCount >= 100) {
					return;
				}
				$scope.vdoListLoadBusy = true;
				skipVdoCount += vdoLimit;
				vdoparams = '?sessionId=' + $scope.sessionId + '&skip=' + skipVdoCount + '&limit=' + vdoLimit;
				vdoUrl = mainUrl + '/videos' + vdoparams;
				$scope.loadVdo(vdoUrl);
			};
			$scope.injectBigVdo = function(vdo) {
				if (document.querySelector('big-video'))
					document.querySelector('big-video').remove();
				
				
				var html = "<big-video id='"+ vdo.id+"'></big-video>"
				var scope = $rootScope.$new();
				var content = $compile(html)(scope);
				document.querySelector('.j-vdo-rows').appendChild(content[0]);
			};
			$scope.vdoTitleClicks = function($eve) {
				var _this = $eve.target;
				vdoTitleClicks(_this);
				var selectedVdo = _this.parentNode;
				if (!selectedVdo) selectedVdo = _this.parentElement;
				var vdo = {
					id: selectedVdo.attributes.vdoid.value,
					url: selectedVdo.attributes.vdourl.value,
					ratings: selectedVdo.attributes.vdoratings.value,
					name: selectedVdo.attributes.vdoname.value,
					description: selectedVdo.attributes.vdodesc.value
				};
				$scope.injectBigVdo(vdo);
			};

		}],
		templateUrl: function() {
			return '/video-list.html';
		}
	};
});


videoPortalApp.directive('bigVideo', function() {
	return {
		restrict: 'E',
		scope: {
			id: '@'
		},
		controller: ['$window','$scope', '$http', '$timeout', function($window, $scope, $http, $timeout) {
			$scope.bigVdo = {};
			var vdoparams = '?sessionId=' + $window.sessionStorage.getItem('userSession') + '&videoId=' + $scope.id;
			var vdoUrl = mainUrl + '/video' + vdoparams;
			//fetch single video
			$http.get(vdoUrl)
			.then(function(res) {
				if(res.status == 200 && res.data && res.data.data) {
					$scope.bigVdo = res.data.data;
				}
			});

			$scope.rateVdo = function(rate, id) {
				var vdoparams = '?sessionId=' + $window.sessionStorage.getItem('userSession');
				var vdoUrl = mainUrl + '/video/ratings' + vdoparams;
				var params = {
					'videoId': id,
					'rating': rate
				};
				$http.post(vdoUrl, params)
				.then(function(res) {
					if(res.status == 200 && res.data && res.data.data) {
						showSuccessMsg('This video is Rated as ' + id + ' star.');
					}
				})
				.catch(function(res) {
					if (res.status == "error") {
						//prompting to login again
						$window.sessionStorage.clear();
						$rootScope.isAuthenticated = false;
					}
					showSuccessMsg('Some Error Occured', true);
				});
			};

		}],
		templateUrl: function() {
			return '/big-video.html';
		}
	};
});
/* Utility functions */

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

function hideMsg() {
	var _sel = document.querySelector('.notifications');
	removeClass(_sel, 'ht-20');
	removeClass(_sel, 'bg-green');
	removeClass(_sel, 'bg-red');
	addClass(_sel, 'displaynone');
}

function showSuccessMsg(msg, error) {
	var _sel = document.querySelector('.notifications');
	removeClass(_sel, 'displaynone');
	console.log('show error Msg', msg, error);
	_sel.innerHTML = "";
	if (error) {
		addClass(_sel, 'bg-red');
	} else {
		addClass(_sel, 'bg-green');
	}
	addClass(_sel, 'ht-20');
	var fn = function() {_sel.innerHTML = msg;};
	setTimeout(fn, 800);
	setTimeout(hideMsg, 4000);
}

function loginOnEnter(e) {
	if(e.which == 13 || e.keyCode == 13) {
		e.stopPropagation();
		e.preventDefault();
		document.querySelector('.j-login-btn-div button').click();
	}
}

/* Play single video at a time */
function stopOtherVdos(_this) {
	var videos = document.querySelectorAll('.j-vdo-preview>video');
	var id = _this.attributes.id.value;
    for (var i = 0; i < videos.length; i++) {
        if (videos[i].id !== id) {//same id videos doesn't stop
            videos[i].pause();
        }
    }
    if (hasClass(_this.parentNode, 'big-vdo')) {//pause thumbnail
    	var vdo = document.querySelectorAll('.vdo-preview.j-vdo-preview>video[id="' + id + '"]');
    	vdo[0].pause();
    } else {//pause big vdo
    	var vdo = document.querySelectorAll('.big-vdo.j-vdo-preview>video[id="' + id + '"]');
    	vdo[0].pause();
    }
}

function vdoTitleClicks(_this) {
	var vdoListDiv = document.querySelector('#j-videoListDiv');
	addClass(vdoListDiv, 'disp-block');
	
	/*var videoRows = document.querySelectorAll('.j-vdo-rows');
	for (var i = 0; i < videoRows.length; i++) {
		addClass(videoRows[i], );
	}*/
	var thumbnails = document.querySelectorAll('.j-thumbnail');
	for (var i = 0; i < thumbnails.length; i++) {
		removeClass(thumbnails[i], 'selected');
	}
	var selectedVdo = _this.parentNode;
	if (!selectedVdo) selectedVdo = _this.parentElement;
	addClass(selectedVdo, 'selected');
}

function gotoIndexPage() {
	var vdoListDiv = document.querySelector('#j-videoListDiv');
	removeClass(vdoListDiv, 'disp-block');
	
	/*var videoRows = document.querySelectorAll('.j-vdo-rows');
	for (var i = 0; i < videoRows.length; i++) {
		removeClass(videoRows[i], 'disp-block');
	}*/
	var thumbnails = document.querySelectorAll('.j-thumbnail');
	for (var i = 0; i < thumbnails.length; i++) {
		removeClass(thumbnails[i], 'selected');
	}
	if (document.querySelector('big-video'))
					document.querySelector('big-video').remove();
}
