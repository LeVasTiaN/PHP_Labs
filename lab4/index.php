<?php

$json_file = 'glitch_data.json';

$default_settings = [
    'text' => 'GLITCH',
    'color_main' => '#000000',
    'color_offset1' => '#ff0000',
    'color_offset2' => '#0000ff',
    'font_size' => 60,
    'speed' => 1.5
];

if (isset($_GET['action']) && $_GET['action'] === 'save') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input) {
        $new_settings = array_merge($default_settings, $input);
        file_put_contents($json_file, json_encode($new_settings));
        echo json_encode(['status' => 'success', 'message' => 'Data saved successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'get') {
    header('Content-Type: application/json');
    if (file_exists($json_file)) {
        echo file_get_contents($json_file);
    } else {
        echo json_encode($default_settings);
    }
    exit;
}

$page_mode = isset($_GET['page']) ? $_GET['page'] : 'input';

$x_text = "Lab Work #4<br>Variant 15"; 
$y_text = "Lavryk Sevastian<br>IM-32";
$menu_html = "
    <ul>
        <li><a href='?page=input' " . ($page_mode == 'input' ? "class='active'" : "") . ">Page 1: Controls (Input)</a></li>
        <li><a href='?page=output' " . ($page_mode == 'output' ? "class='active'" : "") . ">Page 2: Display (Output)</a></li>
    </ul>";

$block3_content = "";

if ($page_mode === 'input') {
    $current_data = file_exists($json_file) ? json_decode(file_get_contents($json_file), true) : $default_settings;
    
    $block3_content = "<h2>Glitch Settings Configuration</h2>
                       <p>Modify the parameters below</p>
                       <form id='glitchForm'>
                       <div class='form-group'>
                           <label>Text Content:</label>
                           <input type='text' name='text' id='inputText' value='{$current_data['text']}'>
                       </div>
                       <div class='form-group'>
                           <label>Main Color:</label>
                           <input type='color' name='color_main' id='inputColorMain' value='{$current_data['color_main']}'>
                       </div>
                       <div class='form-group'>
                           <label>Offset Color 1 (Left):</label>
                           <input type='color' name='color_offset1' id='inputColor1' value='{$current_data['color_offset1']}'>
                       </div>
                       <div class='form-group'>
                           <label>Offset Color 2 (Right):</label>
                           <input type='color' name='color_offset2' id='inputColor2' value='{$current_data['color_offset2']}'>
                       </div>
                       <div class='form-group'>
                           <label>Font Size (px):</label>
                           <input type='number' name='font_size' id='inputSize' value='{$current_data['font_size']}'>
                       </div>
                       <div class='form-group'>
                           <label>Animation Duration (s):</label>
                           <input type='number' step='0.1' name='speed' id='inputSpeed' value='{$current_data['speed']}'>
                       </div>
                       <button type='button' id='saveBtn'>Save Settings</button>
                       <span id='statusMsg'></span>
                       </form>";

} else {
    $block3_content = "<h2>Live Glitch Effect Result</h2>
                       <p>This view updates automatically every 2 seconds without reloading.</p>
                       <div class='glitch-container'>
                       <h1 class='glitch' id='glitchTarget'>LOADING...</h1>
                       </div>";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab 4</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <input type="hidden" id="pageMode" value="<?php echo $page_mode; ?>">
    <div class="main-container">
        <div class="left-column">
            <div class="block-1">
                <h3>Navigation</h3>
                <br>
                <nav><?php echo $menu_html; ?></nav>
            </div>
            <div class="block-4">
                <h3>Info</h3>
                <p>Task: Glitch Text Object.<br>Vanilla HTML, CSS, JS, PHP</p>
            </div>
        </div>
        <div class="right-column">
            <div class="block-2">
                <div class="box-x"><?php echo $x_text; ?></div>
            </div>
            <div class="block-3">
                <?php echo $block3_content; ?>
            </div>
            <div class="block-5">
                <div class="box-y"><?php echo $y_text; ?></div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>