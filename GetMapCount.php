<?php
$levelsDirectory = "Levels";

echo sizeof(scandir($levelsDirectory)) - 3;
?>
