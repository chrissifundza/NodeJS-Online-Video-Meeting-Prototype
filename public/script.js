const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const peers = {};
const myVideo = document.createElement("video");
myVideo.muted = true;
let configuration = {
	iceServers: [
		{
			url: "turn:numb.viagenie.ca",
			credential: "muazkh",
			username: "webrtc@live.com",
		},
	],
};

var peer = new Peer(undefined, {
	configuration,
});

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
			call.on("close", () => {
				video.remove();
			});

			peers[userId] = call;
		});
		socket.on("user-connected", (userId) => {
			setTimeout(function () {
				connectToNewUser(userId, stream);
			}, 5000);
		});
	});
socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close();
});
peer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
	console.log(stream);
	console.log("new User: " + userId);
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});

	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
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
const leaveMeeting = () => {
	window.location.href = "youtube.com";
};
