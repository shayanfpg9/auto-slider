<?php
$dir = "./posters/";
$images = glob($dir . "*.jpg");
// foreach ($images as $image) {
//     echo $image;
//     echo "<br>";
// }

print json_encode($images);