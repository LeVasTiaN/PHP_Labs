document.addEventListener('DOMContentLoaded', function() {
    const btnPlay = document.getElementById('btnPlay');
    const workLayer = document.getElementById('workLayer');
    const btnClose = document.getElementById('btnClose');
    const actionBtnContainer = document.getElementById('actionBtnContainer');
    const animArea = document.getElementById('animArea');
    const msgArea = document.getElementById('msgArea');
    const resultTableContainer = document.getElementById('resultTableContainer');
    const logTableBody = document.querySelector('#logTable tbody');

    let animationId = null;
    let eventCounter = 0;
    
    const balls = [];
    const ballRadius = 10;

    btnPlay.addEventListener('click', () => {
        fetch('index.php?action=clear_logs'); 
        localStorage.removeItem('lab5_events');
        
        document.getElementById('block3').children[0].style.display = 'none';
        resultTableContainer.style.display = 'none';
        workLayer.style.display = 'block';
        resetAnimationState();
    });

    btnClose.addEventListener('click', () => {
        stopAnimation();
        workLayer.style.display = 'none';
        resultTableContainer.style.display = 'block';
        renderResults();
    });

    function resetAnimationState() {
        stopAnimation();
        eventCounter = 0;
        animArea.innerHTML = '';
        balls.length = 0;
        actionBtnContainer.innerHTML = '';
        const newStart = document.createElement('button');
        newStart.id = 'btnStart';
        newStart.textContent = 'Start';
        newStart.onclick = () => {
            logEvent("Button 'Start' clicked");
            newStart.disabled = true;
            startAnimationLoop();
        };
        actionBtnContainer.appendChild(newStart);

        createBall('yellow', 1);
        createBall('red', 2);
    }

    function createBall(color, id) {
        const ball = document.createElement('div');
        ball.className = 'anim-ball';
        ball.style.backgroundColor = color;
        animArea.appendChild(ball);

        const maxX = animArea.clientWidth - 20;
        const maxY = animArea.clientHeight - 20;
        const x = Math.random() * maxX + 10;
        const y = Math.random() * maxY + 10;

        balls.push({
            id: id,
            el: ball,
            x: x,
            y: y,
            stepCount: 0,
            directionIndex: 0,
            stopped: false
        });
        
        updateBallVisuals();
    }

    function startAnimationLoop() {
        animationId = setInterval(() => {
            let collisionOccurred = false;

            balls.forEach(ball => {
                if(ball.stopped) return;

                ball.stepCount++;
                const stepSize = ball.stepCount; 
                
                let dx = 0, dy = 0;
                switch(ball.directionIndex % 4) {
                    case 0: dx = stepSize; break; // Right
                    case 1: dy = stepSize; break; // Down
                    case 2: dx = -stepSize; break; // Left
                    case 3: dy = -stepSize; break; // Up
                }

                let nextX = ball.x + dx;
                let nextY = ball.y + dy;

                const bounds = {
                    w: animArea.clientWidth,
                    h: animArea.clientHeight
                };

                let wallHit = false;

                if (nextX < ballRadius || nextX > bounds.w - ballRadius) {
                    ball.directionIndex += 2;
                    wallHit = true;
                    nextX = (nextX < ballRadius) ? ballRadius : bounds.w - ballRadius;
                }
                
                if (nextY < ballRadius || nextY > bounds.h - ballRadius) {
                    ball.directionIndex += 2;
                    wallHit = true;
                    nextY = (nextY < ballRadius) ? ballRadius : bounds.h - ballRadius;
                }

                if (wallHit) {
                    logEvent(`Ball ${ball.id} touched wall`);
                }
                else {
                    ball.directionIndex++; 
                }

                ball.x = nextX;
                ball.y = nextY;
                
                /* Uncomment this if you want the program to log each ball movement,
                but in my case the server couldn't keep up with the quantity of the
                log requests, and defaulted most of them to "Not on Server" */

                //logEvent(`Ball ${ball.id} moved step ${ball.stepCount}`);
            });

            if (balls.length >= 2) {
                const b1 = balls[0];
                const b2 = balls[1];
                const dx = b1.x - b2.x;
                const dy = b1.y - b2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist <= ballRadius * 2) {
                    collisionOccurred = true;
                    logEvent("Collision between balls detected");
                }
            }

            updateBallVisuals();

            if (collisionOccurred) {
                handleStop();
            }

        }, 150);
    }

    function stopAnimation() {
        if (animationId) clearInterval(animationId);
        animationId = null;
    }

    function handleStop() {
        stopAnimation();
        logEvent("Animation stopped due to collision");
        
        actionBtnContainer.innerHTML = '';
        const btnReload = document.createElement('button');
        btnReload.textContent = "Reload";
        btnReload.onclick = () => {
            logEvent("Button 'Reload' clicked");
            resetAnimationState();
        };
        actionBtnContainer.appendChild(btnReload);
    }

    function updateBallVisuals() {
        balls.forEach(ball => {
            ball.el.style.left = ball.x + 'px';
            ball.el.style.top = ball.y + 'px';
        });
    }

    function logEvent(text) {
        eventCounter++;
        const now = new Date();
        const localTime = now.toISOString();

        msgArea.textContent = `Event #${eventCounter}: ${text}`;

        const payload = {
            id: eventCounter,
            text: text,
            local_time: localTime
        };

        // Method 1: Immediate Server Send
        fetch('index.php?action=log_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error(err));

        // Method 2: Accumulate in LocalStorage
        let store = JSON.parse(localStorage.getItem('lab5_events') || '[]');
        payload.save_time_ls = new Date().toISOString();
        store.push(payload);
        localStorage.setItem('lab5_events', JSON.stringify(store));
    }

    function renderResults() {
        logTableBody.innerHTML = '<tr><td colspan="5">Loading data...</td></tr>';
        
        fetch('index.php?action=get_logs')
            .then(response => response.json())
            .then(serverData => {
                const localData = JSON.parse(localStorage.getItem('lab5_events') || '[]');
                
                logTableBody.innerHTML = '';
                const maxLen = Math.max(serverData.length, localData.length);
                
                for(let i=0; i<maxLen; i++) {
                    const row = document.createElement('tr');
                    
                    const localItem = localData[i] || {};
                    const serverItem = serverData.find(item => item.id === localItem.id) || {};
                    
                    const id = localItem.id || serverItem.id || '-';
                    const text = localItem.text || serverItem.text || '-';
                    const lTime = localItem.local_time ? formatTime(localItem.local_time) : '-';
                    const sTime = serverItem.server_time ? formatTime(serverItem.server_time) : 'Not on Server';
                    const lsSaveTime = localItem.save_time_ls ? formatTime(localItem.save_time_ls) : '-';

                    row.innerHTML = `
                        <td>${id}</td>
                        <td>${text}</td>
                        <td>${lTime}</td>
                        <td>${sTime}</td>
                        <td>${lsSaveTime}</td>
                    `;
                    logTableBody.appendChild(row);
                }
            });
    }

    function formatTime(isoString) {
        if(!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString("it-IT") + ':' + d.getMilliseconds();
    }
});