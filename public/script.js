const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
let configuration = {
	iceServers: [
		{
			urls: [
				"stun:stun.l.google.com:19302",
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
			],
		},
	],
};
var peer = new RTCPeerConnection(configuration);
// var peer = new Peer(undefined, {
// 	path: "/peerjs",
// 	host: "/",
// 	port: "443",
// });

let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);

		peer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});
		socket.on("user-connected", (userId) => {
			setTimeout(function () {
				connectToNewUser(userId, stream);
			}, 5000);
		});
	});

peer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
	console.log("new User: " + userId);
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
};
const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});

	videoGrid.append(video);
};
let msg = $("input");

$("html").keydown((e) => {
	if (e.which == 13 && msg.val().length !== 0) {
		console.log(msg.val());
		socket.emit("message", msg.val());
		msg.val("");
	}
});
socket.on("createMessage", (message) => {
	$("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
	scrollToBottom();
});
const scrollToBottom = () => {
	let d = $(".main_chat_window");
	d.scrollTop(d.prop("scrollHeight"));
};
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;

	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};
const setMuteButton = () => {
	const html = `<i class="fas fa-microphone"></i>
	<span>Mute</span>`;
	document.querySelector(".main_mute_botton").innerHTML = html;
};

const setUnmuteButton = () => {
	const html = `<i class="fas fa-microphone-slash unmute"></i>
	<span class="unmute">Unmute</span>`;
	document.querySelector(".main_mute_botton").innerHTML = html;
};

const playStop = () => {
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};

const setStopVideo = () => {
	const html = `
	
	<i class="fas fa-video"></i>
	<span>Stop Video</span>`;
	document.querySelector(".main_video_button").innerHTML = html;
};
const setPlayVideo = () => {
	const html = `
	
	<i class="fas fa-video-slash unmute"></i>
	<span class="unmute">Play Video</span>`;
	document.querySelector(".main_video_button").innerHTML = html;
};
