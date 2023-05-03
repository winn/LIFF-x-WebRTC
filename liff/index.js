// BEGIN DOM BINDING
var cameraStream = null
const canvas = document.querySelector('#canvas')
const stream = document.querySelector('#stream')
const camera = document.querySelector('#camera')
const fileInput = document.querySelector('#file')
const btnStream = document.querySelector('#btnStream')
const btnCapture = document.querySelector('#camera div')
const snapshot = document.querySelector('#snapshot')
const previewImage = document.querySelector('#snapshot img')
// END DOM BINDING

liff.init({ liffId: "1661038537-M1XKRp6n" }, () => {
  // Do something with LIFF functions
})

const startStreaming = () => {
  const mediaSupport = 'mediaDevices' in navigator
  if (mediaSupport && null == cameraStream) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (mediaStream) {
      cameraStream = mediaStream
      stream.srcObject = mediaStream
      stream.play()
    }).catch(function (err) {
      console.log("Unable to access camera: " + err)
    })
  } else {
    alert('Your browser does not support media devices.')
    return
  }
}

const captureSnapshot = () => {
  if (null != cameraStream) {
    var ctx = canvas.getContext('2d')
    ctx.drawImage(stream, 0, 0, canvas.width, canvas.height)
    previewImage.src = canvas.toDataURL("image/png")
    ocr(canvas.toDataURL("image/png"))
  }
}

const stopStreaming = () => {
  if (null != cameraStream) {
    const track = cameraStream.getTracks()[0]
    track.stop()
    stream.load()
    cameraStream = null
  }
}

const getBase64 = (file) => {
  var reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function () {
    previewImage.src = reader.result
    ocr(reader.result)
  }
  reader.onerror = function (error) {
    console.log("Error: ", error)
  }
}

// BEGIN EVENT LISTENERS
fileInput.onchange = (event) => {
  const file = event.target.files[0]
  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png']
  if (file) {
    if (validImageTypes.includes(file.type)) {
      previewImage.style.objectFit = "contain"
      if (liff.isInClient()) {
        previewImage.style.objectFit = "cover"
      }
      camera.style.display = "none"
      snapshot.style.display = "block"
      getBase64(file)
      stopStreaming()
    }
  }
}

btnStream.onclick = () => {
  startStreaming()
  camera.style.display = "block"
  snapshot.style.display = "none"
}

btnCapture.onclick = () => {
  captureSnapshot()
  camera.style.display = "none"
  snapshot.style.display = "block"
  stopStreaming()
}
// END EVENT LISTENERS


// BEGIN FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-functions.js";

const firebaseConfig = {
  apiKey: "### FIREBASE API KEY ###",
  authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "### CLOUD FUNCTIONS PROJECT ID ###"
};
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

function ocr(base64encoded) {
  const myCallable = httpsCallable(functions, 'myCallable');
  myCallable({ base64: base64encoded }).then((result) => {
    console.log(result.data);
  }).catch((error) => {
    console.error(error.code, error.message);
  });
}
// END FIREBASE
