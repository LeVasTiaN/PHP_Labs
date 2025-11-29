<?php
date_default_timezone_set('Europe/Berlin');
$log_file = 'server_events.json';

if (isset($_GET['action']) && $_GET['action'] === 'log_event') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input) {
        $micro_date = DateTime::createFromFormat('U.u', sprintf('%.6F', microtime(true)));
        $input['server_time'] = $micro_date->format('Y-m-d H:i:s.v');
        
        $current_logs = file_exists($log_file) ? json_decode(file_get_contents($log_file), true) : [];
        $current_logs[] = $input;
        
        file_put_contents($log_file, json_encode($current_logs));
        echo json_encode(['status' => 'logged', 'server_time' => $input['server_time']]);
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'get_logs') {
    header('Content-Type: application/json');
    if (file_exists($log_file)) {
        echo file_get_contents($log_file);
    } else {
        echo json_encode([]);
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'clear_logs') {
    file_put_contents($log_file, json_encode([]));
    echo json_encode(['status' => 'cleared']);
    exit;
}

$x_text = "Lab Work #5<br>Variant 15"; 
$y_text = "Lavryk Sevastian<br>IM-32";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab 5 - Variant 15</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="main-container">
        <div class="left-column">
            <div class="block-1">
                <h3>Menu</h3>
                <ul>
                    <li><a href="index.php">Reload Page</a></li>
                </ul>
            </div>
            <div class="block-4">
                <h3>Controls</h3>
                <p>Variant 15</p>
                <button id="btnPlay">PLAY ANIMATION</button>
            </div>
        </div>

        <div class="right-column">
            <div class="block-2">
                <div class="box-x"><?php echo $x_text; ?></div>
            </div>
            
            <div class="block-3" id="block3">
                <div style="padding: 20px;">
                    <h2>Instructions</h2>
                    <p>Click "PLAY ANIMATION" in the bottom-left block to start Lab 5 task.</p>
                </div>

                <div id="workLayer">
                    <div id="controlsArea">
                        <div id="msgArea">Waiting...</div>
                        
                        <div>
                            <span id="actionBtnContainer">
                                <button id="btnStart">Start</button>
                            </span>
                            <button id="btnClose">Close</button>
                         </div>
                    </div>

                    <div id="animArea">
                        </div>
                </div>

                <div id="resultTableContainer">
                    <h3>Event Logs (Method 1 vs Method 2)</h3>
                    <table id="logTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Event Description</th>
                                <th>Client Time (Local)</th>
                                <th>Server Time (Method 1)</th>
                                <th>LocalStorage Time (Method 2)</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div class="block-5">
                <div class="box-y"><?php echo $y_text; ?></div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>