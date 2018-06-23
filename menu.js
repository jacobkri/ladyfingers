
let menu_state_open = false;

add_event_listeners();
scrollFunction();

function toggle_burger_menu() {
	let burger_menu = document.querySelector("#burgerMenu");
	let menu_list   = document.querySelector("#menuList");
	
	if (menu_state_open == true) {
	  burger_menu.className = "menuClosed";
	  toggleBurgerColor(); // When menu is closed, find out if we need to change burgerBar colors
	  document.querySelector("#burgerMenuButton").disabled = true; // disable button while animation runs
	  
	  setTimeout(function(){ // After the animation 
	    burger_menu.className = "";
	    // document.querySelector("body").style.overflowY = "auto"; // Shows the scrollbar when menu is closed
	    document.querySelector("#burgerMenuButton").disabled = false; // enable button when animation is done
	  }, 1000);
	  
	  menu_state_open = false;
	  
	  document.querySelector('#site_header_logo_black_menu').style.display = "none"; // Instant-Hide black logo in menu
	  document.querySelector('#site_header_follow_black_menu').style.display = "none";  // Instant-Hide black social icons in menu
		
	  // Depending on which page was requested, we need either a white or black logo in #site_header
	  if(document.querySelector('#site_header_logo_white')) {
		document.querySelector('#site_header_logo_white').style.display = "block";
		document.querySelector('#site_header_follow_white').style.display = "block";
	  } else {
		document.querySelector('#site_header_logo_black').style.display = "block";
		document.querySelector('#site_header_follow_black').style.display = "block";  
	  }
	  
	} else {
	  burger_menu.className = "menuOpen";
	  toggleBurgerColor(); // When menu is opened, change burgerBar colors to black
	  
	  document.querySelector("#burgerMenuButton").disabled = true; // disable button while animation runs
	  // Depending on which page was requested, we need either a white or black logo in #site_header
	  if(document.querySelector('#site_header_logo_white')) {
		document.querySelector('#site_header_logo_white').style.display = "none";
		document.querySelector('#site_header_follow_white').style.display = "none";
	  } else {
		document.querySelector('#site_header_logo_black').style.display = "none";
		document.querySelector('#site_header_follow_black').style.display = "none";  
	  }
	  
	  setTimeout(function(){
	    // document.querySelector("body").style.overflowY = "hidden"; // Hides the scrollbar while meny open
		document.querySelector("#burgerMenuButton").disabled = false; // enable button when animation is done
		document.querySelector('#site_header_logo_black_menu').style.display = "block"; // Show black logo in menu
		document.querySelector('#site_header_follow_black_menu').style.display = "block"; // show black social icons in menu
	  }, 1000);
	 //  menu_list.className = "listOpen";
	  menu_state_open = true;
	}
	
}
function add_event_listeners() {
  let burger_menu = document.querySelector("#burgerMenuButton");
  burger_menu.addEventListener('click', toggle_burger_menu, false);
}

function scrollFunction() {
  if (menu_state_open == false) {
    if (document.body.scrollTop > (window.screen.height-100) || document.documentElement.scrollTop > window.screen.height-100) {
      toggleBurgerColor();
    }
  }
}

function toggleBurgerColor() {
	let chosenColor = '#000';
	if ((document.querySelector('#site_header_logo_white')) && (menu_state_open!==false)) {
	  // Change burgerBar color to white if burgerMenu is open AND element ID "site_header_logo_white" exists
	  chosenColor = '#fff';
	} else {
	  chosenColor = '#000'; // Else we change color of burgerBars to black
	}
	document.querySelector('#burgerBar1').style.background = chosenColor;
	document.querySelector('#burgerBar2').style.background = chosenColor;
	document.querySelector('#burgerBar3').style.background = chosenColor;
}