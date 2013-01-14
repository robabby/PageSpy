var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	console.log("Device is ready!");
        document.addEventListener('menubutton', doMenu, false);
        document.addEventListener('backbutton', onBackKeyDown, false);
        document.getElementById('submit').addEventListener('touchstart', submitYQL, false);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	
    },
    closeApp: function() {
    	device.exitApp();
    }
};

//Load external template files
function loadTemplates(path2root) {
	$('div[data-include]').each(function() {
	      $(this).load('file:///android_asset/www/inc/' + $(this).attr('data-include') + '.html').trigger('create');
	});
}

//Handle menu button
function doMenu() {
    console.log("Menu button hit");
	if(!$('#menu').hasClass('open')) {
		$('#menu').animate({opacity:1}, 350, 'easeInOutCubic', function() {
			$(this).addClass('open');
            console.log("Menu was opened");
		});
	} else {
        $('#menu').animate({opacity:0}, 350, 'easeInOutCubic', function() {
			$(this).removeClass('open');
            console.log("Menu was closed");
		});
	}
    
}

// Handle back button
function onBackKeyDown(e) {
	if($('#menu').hasClass('open')){
		$('#menu').animate({opacity:0}, 350, 'easeInOutCubic', function() {
            $(this).removeClass('open');
            console.log('Menu was closed');
        });
    } else if (window.location.href === "file:///android_asset/www/index.html") {
		console.log('Exiting App');
        e.preventDefault();
        navigator.app.exitApp();
    } else {
     	window.history.back();
    }
}

// Submit YQL query   
function submitYQL() {
    console.log("You hit submit!");
    var data = $('#url').val();
    console.log("The submitted URL: " + data);
    var url = "http://query.yahooapis.com/v1/public/yql?q=";
    var query = "select * from html where url=\"http://"+data+"\"";
    console.log("The YQL query: " + query);
    
    console.log(url+query);
    $.ajax({ 
        url: url, 
        data: query,
        beforeSend: function () {
            $('#loading').fadeIn();
        },
        success: function (data) { 
            console.log("AJAX Success!")
        },
        complete: function(){
            $('#loading').fadeOut();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('AJAX Error: ' + errorThrown);
        }
    });
}
        
// Prepare database
var db = window.openDatabase("Search_History", "1.0", "Log of Webpage Queries", 200000); //will create database Dummy_DB or open it
db.transaction(populateDB, errorCB, successCB);

//Database Activity
//create table and insert some record
function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS searchHistory (id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, url TEXT NOT NULL)');
    tx.executeSql('INSERT INTO searchHistory(Name,url) VALUES ("Google", "http://google.com")');
    tx.executeSql('INSERT INTO searchHistory(Name,url) VALUES ("Rob Abby", "http://robabby.com")');
}

//function will be called when an error occurred
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}

//function will be called when process succeed
function successCB() {
    alert("success!");
    db.transaction(queryDB,errorCB);
}

//select all from searchHistory
function queryDB(tx){
    tx.executeSql('SELECT * FROM searchHistory',[],querySuccess,errorCB);
}

function querySuccess(tx,result){
    $('#history-list').empty();
    $.each(result.rows,function(index){
        var row = result.rows.item(index);
        $('#history-list').append('<li><a href="'+row['url']+'"><h3>'+row['Name']+'</h3><p>URL: '+row['url']+'</p></a></li>');
    });
}