document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const uploadInput = document.getElementById('upload');
    const backgroundSelect = document.getElementById('backgroundSelect');
    const downloadBtn = document.getElementById('downloadBtn');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const textInput = document.getElementById('textInput');
    const addTextBtn = document.getElementById('addTextBtn');

    let uploadedImage = null;
    let backgroundImage = new Image();
    let textObjects = [];
    let isDragging = false;
    let dragTextIndex = null;
    let dragStartX, dragStartY;
    let imageX = 0, imageY = 0;
    let startX, startY;

    // Set canvas dimensions
    canvas.width = 630;
    canvas.height = 800;

    // Default image dimensions
    const fixedWidth = 335;
    const fixedHeight = 420;

    // Function to draw canvas
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        if (uploadedImage) {
            const drawWidth = fixedWidth;
            const drawHeight = fixedHeight;

            // Draw image with rounded corners
            const radius = 33;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(imageX + radius, imageY);
            ctx.lineTo(imageX + drawWidth - radius, imageY);
            ctx.arcTo(imageX + drawWidth, imageY, imageX + drawWidth, imageY + radius, radius);
            ctx.lineTo(imageX + drawWidth, imageY + drawHeight - radius);
            ctx.arcTo(imageX + drawWidth, imageY + drawHeight, imageX + drawWidth - radius, imageY + drawHeight, radius);
            ctx.lineTo(imageX + radius, imageY + drawHeight);
            ctx.arcTo(imageX, imageY + drawHeight, imageX, imageY + drawHeight - radius, radius);
            ctx.lineTo(imageX, imageY + radius);
            ctx.arcTo(imageX, imageY, imageX + radius, imageY, radius);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(uploadedImage, imageX, imageY, drawWidth, drawHeight);
            ctx.restore();
        }

        // Draw text objects
        ctx.font = 'bold 35px Arial'; // Use font from Google Fonts
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        textObjects.forEach(textObj => {
            ctx.fillStyle = 'White'; // Text color
            ctx.fillText(textObj.text, textObj.x, textObj.y);
        });
    }

    // Event listener for uploading image
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadedImage = new Image();
            uploadedImage.src = URL.createObjectURL(file);
            uploadedImage.onload = () => {
                widthInput.value = fixedWidth;
                heightInput.value = fixedHeight;
                imageX = (canvas.width - fixedWidth) / 2;
                imageY = (canvas.height - fixedHeight) / 2;
                drawCanvas();
            };
        }
    });

    // Event listener for background change
    backgroundSelect.addEventListener('change', () => {
        backgroundImage.src = backgroundSelect.value;
        backgroundImage.onload = () => drawCanvas();
    });

    // Add text to canvas
    addTextBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (text) {
            textObjects.push({ text, x: canvas.width / 2, y: canvas.height / 2 });
            textInput.value = ''; // Clear input
            drawCanvas();
        }
    });

    // Start dragging functionality
    function startDragging(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX || e.touches[0].clientX) - rect.left;
        const mouseY = (e.clientY || e.touches[0].clientY) - rect.top;

        const drawWidth = fixedWidth;
        const drawHeight = fixedHeight;

        // Check if dragging the image
        if (mouseX >= imageX && mouseX <= imageX + drawWidth &&
            mouseY >= imageY && mouseY <= imageY + drawHeight) {
            isDragging = true;
            startX = mouseX - imageX;
            startY = mouseY - imageY;
        } else {
            // Check if dragging any text object
            textObjects.forEach((textObj, index) => {
                const textWidth = ctx.measureText(textObj.text).width;
                const textHeight = 35; // Assuming text height is 35px

                if (mouseX >= textObj.x - textWidth / 2 && mouseX <= textObj.x + textWidth / 2 &&
                    mouseY >= textObj.y - textHeight / 2 && mouseY <= textObj.y + textHeight / 2) {
                    isDragging = true;
                    dragTextIndex = index;
                    dragStartX = mouseX - textObj.x;
                    dragStartY = mouseY - textObj.y;
                }
            });
        }
    }

    // Drag move functionality
    function dragMove(e) {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX || e.touches[0].clientX) - rect.left;
            const mouseY = (e.clientY || e.touches[0].clientY) - rect.top;

            if (dragTextIndex !== null) {
                textObjects[dragTextIndex].x = mouseX - dragStartX;
                textObjects[dragTextIndex].y = mouseY - dragStartY;
            } else {
                imageX = mouseX - startX;
                imageY = mouseY - startY;
            }
            drawCanvas();
        }
    }

    // Stop dragging functionality
    function stopDragging() {
        isDragging = false;
        dragTextIndex = null;
    }

    // Event listeners for mouse and touch events
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', dragMove);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    canvas.addEventListener('touchstart', startDragging, { passive: false });
    canvas.addEventListener('touchmove', dragMove, { passive: false });
    canvas.addEventListener('touchend', stopDragging);

    widthInput.addEventListener('input', drawCanvas);
    heightInput.addEventListener('input', drawCanvas);

    downloadBtn.addEventListener('click', () => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const isImageEmpty = !imageData.data.some(value => value !== 0);

        if (!isImageEmpty) {
            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert('No image available to download!');
        }
    });
});
