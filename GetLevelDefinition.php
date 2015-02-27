<?php
$levelsDirectory = "Levels";

$output = "Error";
if(isset($_GET["index"])){
    $index = $_GET['index'];
    if(file_exists($levelsDirectory.DIRECTORY_SEPARATOR.$index)){
        $output = file_get_contents($levelsDirectory.DIRECTORY_SEPARATOR.$index);
        $output = str_replace(array('\r\n', '\r', '\n', chr(10)), '', $output); 
    }
}
echo $output;
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
?>
