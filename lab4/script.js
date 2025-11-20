document.addEventListener('DOMContentLoaded', function() {
    
    const pageMode = document.getElementById('pageMode').value;

    if (pageMode === 'input') {
        const saveBtn = document.getElementById('saveBtn');
        const statusMsg = document.getElementById('statusMsg');
        const form = document.getElementById('glitchForm');

        saveBtn.addEventListener('click', function() {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            fetch('index.php?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if(result.status === 'success') {
                    statusMsg.textContent = "Saved!";
                    statusMsg.style.color = "green";
                } else {
                    statusMsg.textContent = "Error saving.";
                    statusMsg.style.color = "red";
                }
                setTimeout(() => statusMsg.textContent = '', 3000);
            })
            .catch(error => {
                console.error('Error:', error);
                statusMsg.textContent = "Network Error";
            });
        });
    }

    if (pageMode === 'output') {
        const glitchElement = document.getElementById('glitchTarget');

        function fetchData() {
            fetch('index.php?action=get')
            .then(response => response.json())
            .then(data => {
                renderGlitch(data);
            })
            .catch(err => console.error("Polling error:", err));
        }

        function renderGlitch(data) {
            if (glitchElement.innerText !== data.text) {
                glitchElement.innerText = data.text;
                glitchElement.setAttribute('data-text', data.text);
            }
            glitchElement.style.setProperty('--color-main', data.color_main);
            glitchElement.style.setProperty('--color-off1', data.color_offset1);
            glitchElement.style.setProperty('--color-off2', data.color_offset2);
            glitchElement.style.setProperty('--font-size', data.font_size + 'px');
            glitchElement.style.setProperty('--speed', data.speed + 's');
        }

        fetchData();

        setInterval(fetchData, 2000);
    }
});