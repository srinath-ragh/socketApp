var primus,
coreApp = angular.module('coreApp', ['ngRoute', 'ngCookies']);

function throwError(customMsg){
		$("#validations").attr("class", "alert alert-danger");
		$("#validations").attr("role", "alert");
		$("#validations").text(customMsg);
		$("#validations").show();
		$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
		window.setTimeout(function() { $("#validations").hide(); }, 4000);
}

function throwSuccess(customMsg){
		$("#validations").attr("class", "alert alert-success");
		$("#validations").attr("role", "alert");
		$("#validations").text(customMsg);
		$("#validations").show();
		$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
		window.setTimeout(function() { $("#validations").hide(); }, 3000);
}

// configure our routes
coreApp.config(function($routeProvider) {
    $routeProvider

        // route for the Login page
        .when('/login', {
            templateUrl : 'pages/login.html',
            controller  : 'loginController'
        })

        // route for the contact page
        .when('/home', {
            templateUrl : 'pages/home.html',
            controller  : 'homeController'
        })

        // route for the register page
        .when('/register', {
            templateUrl : 'pages/register.html',
            controller  : 'registerController'
        })

        // route for the contact page
        .when('/profile/:id', {
            templateUrl : 'pages/profile.html',
            controller  : 'profileController'
        })

        .otherwise({
            redirectTo : '/login'
        });
});

coreApp.controller('registerController', function($scope, $http, $location) {
    // $scope.message = 'Look! I am a register page.';
  $scope.registerForm = {};

	$scope.doRegister = function() {
		var email = $scope.registerForm.email,
		firstname = $scope.registerForm.firstname,
		lastname = $scope.registerForm.lastname,
		password = $scope.registerForm.password,
		cnfpassword = $scope.registerForm.cnfpassword,
		city = $scope.registerForm.city,
		sex = $scope.registerForm.sex;

		console.log('registerForm - ', $scope.registerForm);

		if(password!==cnfpassword){
			return throwError('The passwords do not match!');
		}

		if(email && firstname && (password===cnfpassword) && city && sex) {
			//Make an api call here and validate
			$http.post('/api/registerUser', $scope.registerForm)
			.success(function(data) {
				$scope.registerForm = {};
				throwSuccess('Registration success, Please login with your email and newly created password.');
				$location.path('/login');
			})
			.error(function(data) {
				return throwError('Error: ' + data);
			});
		} else {
			return throwError('Registration failed! Please check the field data.');
		}
	};

	$scope.goToLogin = function() {
		$location.path('/login');
	};
});

coreApp.controller('profileController', function($scope, $cookieStore, $location, $http, $routeParams) {
		$scope.profileData={};
		$scope.user = $cookieStore.get('user');
		$scope.userimg_url = $cookieStore.get('userimg_url');
		$scope.hashedUser = $cookieStore.get('hash');
		console.log($routeParams.id);
  //   //Make an api call here and validate
		$http.get('/api/getUserProfile/'+$routeParams.id)
		.success(function(data) {
			if($scope.hashedUser === $routeParams.id){
				//Self user
				$cookieStore.put('user', data[0].firstname);
				$cookieStore.put('email', data[0].email);
				$cookieStore.put('userimg_url', data[0].imgUrl);
				$cookieStore.put('hash', data[0]._id);
				$scope.profileData = data[0];				
			} else {
				//Other user
				$scope.profileData = data[0];
			}
		})
		.error(function(data) {
			return throwError('Error: ' + data);
		});

				//Logout Functionality
		$scope.doLogout = function() {
			$cookieStore.remove('user');
			$cookieStore.remove('email');
			$cookieStore.remove('hash');
			$cookieStore.remove('userimg_url');
			if(primus){
				primus.end();
			}
			$location.path('/login');
		};
});

coreApp.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

coreApp.controller('homeController', function($scope, $location, $cookieStore, $http) {
		$scope.user = $cookieStore.get('user');
		$scope.userimg_url = $cookieStore.get('userimg_url');
		$scope.hashedUser = $cookieStore.get('hash');
		var tempConvData=[],
		dataLoaded = false;
		//If no user login exists in the cookie store, redirect to login page
		if(!$scope.user){
			$location.path('/login');
		}

		//Socket connections
		var options = {
			authorization: 'sweetpass'
			//{ scheme: 'Basic', username: 'admin', password: 'password' }
		};
		primus = Primus.connect('http://'+$location.host());
    primus.on('data', function (data) {
   	//Testing sample engine.io
      if(data === 'usersActivityChange'){
  			getOnlineUsers();
      } else if(data === 'messagePosted'){
      	updateConvView();
      }
  	});
		
		var getOnlineUsers = function(){
		// Page load, get all online users to display
			$http.get('/api/getOnlineUsers')
				.success(function(data) {
					$scope.onlineUsers = data;
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
		};	   

		getOnlineUsers();

		var getConvData = function(){
			// Page load, get all conversations to display
			$http.get('/api/getAllConversations?room=public&limit=10'+'&skip='+tempConvData.length)
			// $http.get('/api/getAllConversations?room=public&limit=30')
			// $http.get('/api/getAllConversations?room=public')
				.success(function(data) {
					for (var i = 0; i < data.length; i++) {
						tempConvData.push(data[i]);
					}
					$('#chat_loader').hide();
					if(data.length < 10) {
						dataLoaded = true;
					}
					$scope.convData=tempConvData;
					// $('#chat').scrollTop($('#chat').prop("scrollHeight"));
					// $('html, body').animate({scrollTop:$('#chat').height()}, 'slow');
					// console.log($("#chat").prop("scrollHeight"));
					// console.log($("#chat")[0].scrollHeight);
					// $("#chat").animate({ scrollTop: $("#chat").prop("scrollHeight")}, 1000);
				})
				.error(function(data) {
					console.log('getConvData Error: ' + data);
				});
		};	

		getConvData();

		var updateConvView = function(){
			// Page load, get all conversations to display
			$http.get('/api/getAllConversations?room=public&limit='+(tempConvData.length+1)+'&skip=0')
				.success(function(data) {
					$('#chat_loader').hide();
					tempConvData = data;
					$scope.convData=tempConvData;
				})
				.error(function(data) {
					console.log('getConvData Error: ' + data);
				});
		};	

		$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		    // $("#chat").animate({ scrollTop: $("#chat").prop("scrollHeight")}, 1000);
		    $("#chat").scrollTop($("#chat").prop("scrollHeight"));
		});

		//Post chat message
		$scope.sendMessage = function() {
			var content = $scope.messageContent,
			postBody = {
				'content': content,
				'to': 'all',
				'room': 'public'
			};
			if(!content) {
				throwError('Please key in some text to post!');
				return;
			}
			//Clearing off the text box contents
			$scope.messageContent='';
			$http.post('/api/postMessage', postBody)
				.error(function(data) {
					console.log('Error: ' + data);
				});
		};

		//Logout Functionality
		$scope.doLogout = function() {
			$cookieStore.remove('user');
			$cookieStore.remove('email');
			$cookieStore.remove('hash');
			$cookieStore.remove('userimg_url');
			if(primus){
				primus.end();
			}
			$location.path('/login');
		};

		// //Load more data
		$('#chat').scroll(function() {
	    var chatDiv = $('#chat').scrollTop();
	    if (chatDiv === 0 && !dataLoaded) {
	    		$('#chat_loader').show();
	    		getConvData();
	    }
		});
});

coreApp.controller('loginController', function($scope, $http, $location, $cookieStore) {

	$scope.user = $cookieStore.get('user');
	//If user has already logged in and present in the cookie store, redirect to home page
	if($scope.user){
		$location.path('/home');
	}

	$scope.loginForm = {};

	$scope.doLogin = function() {
		var email = $scope.loginForm.email,
		password = $scope.loginForm.password,
		remember = $scope.loginForm.remember;

		if(email && password) {
			//Make an api call here and validate
			$http.get('/api/loginUser', {headers: {'email': email, 'password': password}})
			.success(function(data) {
				$scope.loginForm = {}; // clearing form
				$cookieStore.put('user', data.firstname);
				$cookieStore.put('email', data.email);
				$cookieStore.put('userimg_url', data.imgUrl);
				$cookieStore.put('hash', data._id);
				$location.path('/home');
			})
			.error(function(data) {
				return throwError('Error: ' + data);
			});
		} else {
			return throwError('Please enter valid username and password!');
		}
	};

	$scope.doSignUp = function() {
		$location.path('/register');
	};
});