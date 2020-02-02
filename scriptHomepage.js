Promise.all([
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
	faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
	faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(start);

//////

//Send image
const sendImg = async function (asset) {
	const config = {
		headers: {
			'Content-Type': 'application/json'
			//"Content-Type": "application/text"
		}
	};

	const body = JSON.stringify({ image: asset });
	// console.log(body)
	try {
		// const res = await axios
		//   .post("http://localhost:8080/api/img", body, config)
		//   .then(response => {
		//     console.log(response);
		//     // console.log(response.data.token);
		//   });
		const res = await axios.post('http://localhost:8080/api/img', body, config);
		//   .then(response => console.log(response));
	} catch (err) {
		const errors = err.response.data.errors;
		console.log(errors);
	}
};

function encodeImageFile(file) {
	var reader = new FileReader();
	//console.log(typeof file);
	reader.onloadend = function () {
		//console.log("RESULT", reader.result);
		sendImg(reader.result);
	};
	reader.readAsDataURL(file);
}
///////

function start() {
	const img = document.getElementById('imageUpload');
	var token = document.cookie.substring(6);
	if (token) {
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		delete axios.defaults.headers.common['x-auth-token'];
	}

	if (img) {
		img.addEventListener('change', async () => {
			//send pic
			encodeImageFile(img.files[0]);
			//load pic
			///////////////////
			let loadingDiv = document.getElementById('loading');
			loadingDiv.innerHTML = `<div class="spinner-border" role="status">
			<span class="sr-only">Loading...</span>
			</div>`;
			//
			document.body.style.opacity = "0.5"

			//
			Promise.all([
				new Promise((resolve, reject) => {
					const imgUrl = window.URL.createObjectURL(img.files[0]);
					let imageTag = document.createElement('IMG');
					imageTag.src = imgUrl;
					imageTag.setAttribute('height', '30%');
					imageTag.setAttribute('width', '40%');
					//
					const imgDiv = document.getElementById('imageShow');
					const newImg = imageTag;
					newImg.className = 'pics';
					if (imgDiv.children.length > 0) imgDiv.removeChild(imgDiv.children[0]);
					imgDiv.appendChild(imageTag);
					//
					resolve(imageTag);
				}),
				new Promise((resolve, reject) => {
					faceapi.bufferToImage(img.files[0]).then(image => {
						loadLabeledImages(image).then(values => {
							if (values[0] == null) resolve(null);
							const descriptor = JSON.stringify(values);
							resolve(descriptor);
						});
					});
				})
			]).then(values => {
				document.body.style.opacity = "1"
				loadingDiv.innerHTML = null;
				if (values[1] == null) {
					alert('No Face Detected in this pic!');
					return;
				}
				//image
				console.log(values[0]);

				//descriptor
				sessionStorage.setItem('descriptor', values[1]);
			});
		});
	}
}
// sessionStorage.setItem('descriptor', descriptor)
async function loadLabeledImages(image) {
	const labels = ['owner'];
	return Promise.all(
		labels.map(async label => {
			const descriptions = [];
			for (let i = 1; i <= 1; i++) {
				const detections = await faceapi
					.detectSingleFace(image)
					.withFaceLandmarks()
					.withFaceDescriptor();
				if (detections != undefined) descriptions.push(detections.descriptor);
				else return null;
			}
			return new faceapi.LabeledFaceDescriptors(label, descriptions);
		})
	);
}
