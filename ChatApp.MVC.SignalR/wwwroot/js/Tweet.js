'use strict';

var username = prompt("Your name, please", "Guest");
var hubBuilder = new signalR.HubConnectionBuilder();
var connection = hubBuilder.withUrl("/msghub").build();

connection.on("msgRcv", function (user, message) {
    var li = document.createElement("li");
    li.textContent = `${user} : ${message}`;
    li.classList.add('received'); // Add class for received messages
    $('#chatLog').append(li);
});

connection.on("imgRcv", function (user, imgData) {
    var img = document.createElement('img');
    img.src = imgData;
    var li = document.createElement('li');
    var br = document.createElement('br');
    li.append(user);
    li.appendChild(br);
    li.appendChild(img);
    li.classList.add('received'); // Add class for received images
    $('#chatLog').append(li);
});

connection.on("selfMsg", function (message) {
    var li = document.createElement("li");
    li.textContent = `(self) : ${message}`;
    li.classList.add('sent'); // Add class for sent messages
    $('#chatLog').append(li);
});

connection.start();

var droppedFile = null; // Variable to store dropped file

$('#dropbox').on('dragenter', function (evt) {
    evt.preventDefault();
    $(this).addClass('dragover');
});

$('#dropbox').on('dragover', function (evt) {
    evt.preventDefault();
});

$('#dropbox').on('dragleave', function (evt) {
    evt.preventDefault();
    $(this).removeClass('dragover');
});

$('#dropbox').on('drop', function (evt) {
    evt.preventDefault();
    $(this).removeClass('dragover');
    droppedFile = evt.originalEvent.dataTransfer.files[0];
    if (droppedFile.size > 5 * 1024 * 1024) {
        alert(`Invalid file size: ${droppedFile.size}`);
        droppedFile = null; // Clear dropped file if invalid
        return;
    }
    if (!(droppedFile.type == 'image/png' || droppedFile.type == 'image/jpg' || droppedFile.type == 'image/jpeg')) {
        alert('Invalid file type. Only PNG, JPG, and JPEG images are allowed.');
        droppedFile = null; // Clear dropped file if invalid
        return;
    }

    // Show confirmation message to the user
    alert('You have successfully dragged and dropped the file. Now click on the Poke button to submit it. You can also poke this or you can write some message along with it.');
});

$('#btnSend').on('click', function () {
    var message = $('#txtInput').val();
    var fileInput = document.getElementById('userFile');
    var file = fileInput.files[0];

    // Check if neither message nor file nor dropped file is provided
    if (!message && !file && !droppedFile) {
        alert('Please enter a message, select an image, or drag and drop a file to send.');
        return;
    }

    if (droppedFile) {
        // If dropped file is available, proceed with sending
        getBase64(droppedFile).then(function (baseData) {
            connection.invoke("ShareImage", username, message, baseData)
                .then(() => {
                    // Clear the dropped file after successfully sending it
                    droppedFile = null;
                    clearTextInput();
                })
                .catch(error => {
                    console.error('Error sending image:', error);
                });
        });
    } else if (file) {
        // If file from file input is available, proceed with sending
        getBase64(file).then(function (baseData) {
            connection.invoke("ShareImage", username, message, baseData)
                .then(() => {
                    // Clear the file input field after successfully sending the image
                    fileInput.value = null;
                    clearTextInput();
                })
                .catch(error => {
                    console.error('Error sending image:', error);
                });
        });
    } else {
        // If only message is available, proceed with sending
        connection.invoke("Share", username, message)
            .then(() => {
                // Clear the text input field after successfully sending the message
                clearTextInput();
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
    }
});

function clearTextInput() {
    // Clear the text input field
    $('#txtInput').val(null);
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
