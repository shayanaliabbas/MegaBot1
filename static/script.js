document.addEventListener('DOMContentLoaded', () => {
  // Three.js Scene Setup (remains the same)
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x007bff, wireframe:true }); // Changed to wireframe material
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  camera.position.z = 5;

  let rotationSpeed = 0.01; // Initial rotation speed
  const animate = function () {
      requestAnimationFrame(animate);
    sphere.rotation.x += rotationSpeed;
    sphere.rotation.y += rotationSpeed;
    sphere.rotation.z += rotationSpeed;
      renderer.render(scene, camera);
  };
  animate();

document.addEventListener('mousemove', (event) => {
     // Calculate normalized mouse position on the X-axis, centered around 0.
      const mouseX = (event.clientX / window.innerWidth) - 0.5;
     // adjust multiplier as needed
    rotationSpeed = mouseX * 0.1;
});
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
});
 // Chat Functionality (remains the same)
const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function displayMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = text;
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
      chatLog.appendChild(messageDiv);
      chatLog.scrollTop = chatLog.scrollHeight; // Keep scroll at the bottom

    }


sendButton.addEventListener('click', async () => {
const userMessage = userInput.value.trim();
if (userMessage) {
    displayMessage(userMessage, 'user');
    userInput.value = '';

    try {
      const response = await fetch('/chat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if(data && data.response){
        displayMessage(data.response, 'ai');
      }
    } catch (error) {
        console.error("Error during chat:", error);
        displayMessage("Error communicating with AI.", 'ai');
    }
}
});
userInput.addEventListener('keypress', async (event) =>{
  if(event.key === 'Enter'){
    sendButton.click();
    event.preventDefault();
  }

});
});