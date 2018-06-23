<?php 

$template = <<<LOADTEMPLATE
<!doctype html>
<html lang="da">

 <head>
  <title>{$HTML_CONTENT['site_title_content']}</title>
  <meta charset="utf-8">
  <meta name="description" content=""> <!-- Should be filled automatically from Wordpress Custom Field, but out of time -->
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="ladyfingers.css" type="text/css">
  <link rel="stylesheet" href="modified-insta-gallery.css" type="text/css"> <!-- Our own Modified CSS for the "Instagram Gallery" Wordpress Plugin -->
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700%7CRaleway:400,700" rel="stylesheet">
  <link rel="stylesheet" href="fontawesome-all.css">
  </head>

 <body>
    <!-- Scripts Start -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDT6VTQBF-oFihc33fQ_4etU2XkE1uSPTc"></script>
    
    <!-- jQuery (Used by Instagram Gallery) -->
    <script src="https://ladyfingers.beamtic.com/wordpress/wp-includes/js/jquery/jquery.js?ver=1.12.4"></script>
    <!-- Scripts enD -->
  
  <div id="application_content">
  <header id="site_header">
    <div id="custom_header_content"><!-- Corresponds with the "header_content" "Custom Field" in Wordpress -->
      {$HTML_CONTENT['site_header_content']}
      <!-- The menuClosed class is replaced with menuOpen when the burger is clicked/touched -->
    </div>
    <nav id="burgerMenu" data-burgerMenu>
     <div id="site_header_follow_black_menu">
       <a href="https://www.instagram.com/ladyfingerscph/"><i class="fab fa-instagram"></i></a>
       <a href="https://www.facebook.com/ladyfingerscph/"><i class="fab fa-facebook-f"></i></a>
       <a href="https://www.facebook.com/ladyfingerscph/"><i class="fab fa-youtube"></i></a>
     </div>
     <!-- NOTE CONTENT LIKE THIS SHOULD BE MOVED TO THE BACK-END (system category) - BUT WE ARE SHORT OF TIME -->
     <div id="site_header_logo_black_menu">
      <img src="https://ladyfingers.beamtic.com/wordpress/wp-content/uploads/2018/06/logo_black.png" alt="Ladyfingers black logo">
     </div>
     {$HTML_CONTENT['burger_menu_links']}
     <button id="burgerMenuButton"><span id="burgerBar1"></span><span id="burgerBar2"></span><span id="burgerBar3"></span></button>
    </nav>
   </header>
   <article>
   {$HTML_CONTENT['main_content']}
   </article>
   <footer id="site_footer">{$HTML_CONTENT['site_footer_content']}</footer>
   <a href="/?page=gavekort" id="gavekort_fixed">Gavekort</a>
  </div>

  <script src="menu.js"></script>
  <!-- Insta-gallery Wordpress plugin -->
   <script>
   let insgalajax = {"ajax_url":"https://ladyfingers.beamtic.com/wordpress\/wp-admin\/admin-ajax.php"};
   </script>

   
   <script type='text/javascript' src='/wordpress/wp-content/plugins/insta-gallery/assets/insta-gallery-min.js?ver=1.6.1'></script>
  
   <script src="https://ladyfingers.beamtic.com/wordpress/wp-content/plugins/insta-gallery/assets/swiper/swiper.jquery.min.js"></script>
   <script src="https://ladyfingers.beamtic.com/wordpress/wp-content/plugins/insta-gallery/assets/magnific-popup/jquery.magnific-popup.min.js"></script>
  <!-- Insta-gallery Wordpress plugin -->

  </body>

 </html>
LOADTEMPLATE;
